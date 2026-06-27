import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import Goal from '../models/Goal.js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables directly using an absolute path to the backend root folder
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const router = express.Router();

// Force the SDK to explicitly load your custom Gemini key parameter
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const comprehensiveGoalSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    milestones: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          milestoneName: { type: Type.STRING },
          timeMarker: { type: Type.STRING },
          motivationRewardIdea: { type: Type.STRING },
          actionableTasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                taskText: { type: Type.STRING },
                assignedTo: { type: Type.STRING }
              },
              required: ["taskText", "assignedTo"]
            }
          }
        },
        required: ["milestoneName", "timeMarker", "motivationRewardIdea", "actionableTasks"]
      }
    }
  },
  required: ["title", "milestones"]
};

/**
 * Helper function to execute Gemini calls with Exponential Backoff Retries
 */
async function generateGoalWithRetry(contextPrompt, retries = 3, delay = 3000) {
  try {
    return await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Reverted to stable 2.5-flash standard
      contents: contextPrompt,
      config: { 
        responseMimeType: "application/json", 
        responseSchema: comprehensiveGoalSchema 
      },
    });
  } catch (error) {
    // Check if error is due to Rate Limits (HTTP status 429)
    if (error.status === 429 && retries > 0) {
      console.warn(`[Quota Limit] Hit 429. Retrying in ${delay / 1000}s... (${retries} retries left)`);
      
      // Wait for the specified delay time
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry call while doubling the delay duration (Exponential Backoff)
      return generateGoalWithRetry(contextPrompt, retries - 1, delay * 2);
    }
    // Re-throw if it's a non-429 error or we ran out of retry attempts
    throw error;
  }
}

// POST: /api/goals/generate
router.post('/generate', async (req, res) => {
  const { userGoal, hoursPerWeek, timelineValue, timelineUnit, isMoneyInvolved, budget, isTeamGoal, teamMembers } = req.body;

  let contextPrompt = `Deconstruct the long-term goal: "${userGoal}". User has ${hoursPerWeek} hours/week. Timeframe is ${timelineValue} ${timelineUnit}.`;
  
  if (isMoneyInvolved) contextPrompt += `\nFINANCIALS: Target budget of ${budget || 0} USD. Factor cost-efficiency in.`;
  if (isTeamGoal && teamMembers?.length > 0) {
    contextPrompt += `\nTEAM: Distribute tasks strictly across these roles: ${teamMembers.join(', ')}.`;
  } else {
    contextPrompt += `\nTEAM: Solo project. Assign all tasks to "Owner".`;
  }
  contextPrompt += `\nMOTIVATION: Add a unique 'motivationRewardIdea' for every milestone.`;

  try {
    // Call the retry helper instead of calling ai.models.generateContent directly
    const response = await generateGoalWithRetry(contextPrompt);

    const generatedData = JSON.parse(response.text);

    const formattedMilestones = generatedData.milestones.map(m => ({
      milestoneName: m.milestoneName,
      timeMarker: m.timeMarker,
      motivationRewardIdea: m.motivationRewardIdea,
      actionableTasks: m.actionableTasks.map(task => ({
        taskText: task.taskText,
        isCompleted: false,
        assignedTo: task.assignedTo || "Owner"
      }))
    }));

    const structuralGoalDoc = new Goal({
      title: generatedData.title || userGoal,
      timeline: { value: Number(timelineValue), unit: timelineUnit },
      financials: { isMoneyInvolved: !!isMoneyInvolved, budget: Number(budget || 0) },
      isTeamGoal: !!isTeamGoal,
      teamMembers: isTeamGoal ? teamMembers : [],
      milestones: formattedMilestones
    });

    await structuralGoalDoc.save();
    res.status(201).json(structuralGoalDoc);
  } catch (error) {
    console.error('Gemini Execution Error Matrix:', error);
    res.status(500).json({ error: 'Failed to deconstruct goal due to api constraints.' });
  }
});

export default router;

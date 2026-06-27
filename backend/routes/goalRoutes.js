import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import Goal from '../models/Goal.js';

const router = express.Router();
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextPrompt,
      config: { responseMimeType: "application/json", responseSchema: comprehensiveGoalSchema },
    });

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
    console.error(error);
    res.status(500).json({ error: 'Failed to deconstruct goal.' });
  }
});

export default router;

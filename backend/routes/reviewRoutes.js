import express from 'express';
import { GoogleGenAI } from '@google/genai';
import Goal from '../models/Goal.js';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// POST: /api/goals/:goalId/review
router.post('/:goalId/review', async (req, res) => {
  const { goalId } = req.params;
  const { milestoneIndex } = req.body;

  try {
    const goalData = await Goal.findById(goalId);
    if (!goalData) return res.status(404).json({ error: "Goal record not found." });

    const targetMilestone = goalData.milestones[Number(milestoneIndex)];
    if (!targetMilestone) return res.status(404).json({ error: "Milestone index out of bounds." });

    const totalTasks = targetMilestone.actionableTasks.length;
    const completedTasks = targetMilestone.actionableTasks.filter(t => t.isCompleted).length;
    const metricPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Evaluate performance. Goal: "${goalData.title}". Milestone: "${targetMilestone.milestoneName}". User completed ${completedTasks} of ${totalTasks} tasks (${metricPercent}%). Provide an encouraging 2-sentence feedback report.`,
    });

    res.status(200).json({
      milestoneIndex,
      completionPercentage: metricPercent,
      aiFeedback: response.text.trim()
    });
  } catch (error) {
    res.status(500).json({ error: "Analysis processor failed." });
  }
});

export default router;

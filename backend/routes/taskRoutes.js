import express from 'express';
import Goal from '../models/Goal.js';

const router = express.Router();

// PATCH: /api/goals/:goalId/tasks
router.patch('/:goalId/tasks', async (req, res) => {
  const { goalId } = req.params;
  const { milestoneIndex, taskIndex, isCompleted } = req.body;

  try {
    const updatePath = `milestones.${milestoneIndex}.actionableTasks.${taskIndex}.isCompleted`;
    const updatedGoal = await Goal.findByIdAndUpdate(
      goalId,
      { $set: { [updatePath]: isCompleted } },
      { new: true }
    );

    if (!updatedGoal) return res.status(404).json({ error: 'Goal track missing.' });
    res.status(200).json(updatedGoal);
  } catch (error) {
    res.status(500).json({ error: 'Task state update failed.' });
  }
});

export default router;

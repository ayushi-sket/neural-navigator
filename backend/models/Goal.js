import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  timeframeWeeks: { type: Number, required: true },
  milestones: [{
    milestoneName: { type: String, required: true },
    targetWeek: { type: Number, required: true },
    actionableTasks: [{
      taskText: { type: String, required: true },
      isCompleted: { type: Boolean, default: false }
    }]
  }]
}, { timestamps: true });

export default mongoose.model('Goal', GoalSchema);

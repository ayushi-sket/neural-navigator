import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  timeline: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ['days', 'weeks', 'months'], required: true }
  },
  financials: {
    isMoneyInvolved: { type: Boolean, default: false },
    budget: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  isTeamGoal: { type: Boolean, default: false },
  teamMembers: [{ type: String }],
  milestones: [{
    milestoneName: { type: String, required: true },
    timeMarker: { type: String, required: true },
    motivationRewardIdea: { type: String },
    actionableTasks: [{
      taskText: { type: String, required: true },
      isCompleted: { type: Boolean, default: false },
      assignedTo: { type: String, default: "Owner" }
    }]
  }]
}, { timestamps: true });

// SAFEGUARD FIX: Fall back to existing compiled version if model is already loaded in cache memory!
export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema);

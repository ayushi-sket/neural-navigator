import { useState } from 'react';
import { goalService } from '../services/api';
import { Gift, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Roadmap({ goal, onUpdate }) {
  const [reviews, setReviews] = useState({});
  const [reviewLoading, setReviewLoading] = useState({});

  const handleToggle = async (mIdx, tIdx) => {
    const task = goal.milestones[mIdx].actionableTasks[tIdx];
    const targetStatus = !task.isCompleted;

    const updatedGoal = { ...goal };
    updatedGoal.milestones[mIdx].actionableTasks[tIdx].isCompleted = targetStatus;
    onUpdate(updatedGoal);

    if (targetStatus) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }

    try {
      await goalService.toggleTask(goal._id, mIdx, tIdx, targetStatus);
    } catch {
      alert('Database synchronization fault occurred. Rolling back UI.');
      updatedGoal.milestones[mIdx].actionableTasks[tIdx].isCompleted = !targetStatus;
      onUpdate(updatedGoal);
    }
  };

  const requestReview = async (mIdx) => {
    setReviewLoading(prev => ({ ...prev, [mIdx]: true }));
    try {
      const data = await goalService.getWeeklyReview(goal._id, mIdx);
      setReviews(prev => ({ ...prev, [mIdx]: data.aiFeedback }));
    } catch {
      alert('Could not compute performance feedback metrics.');
    } finally {
      setReviewLoading(prev => ({ ...prev, [mIdx]: false }));
    }
  };

  return (
    <div className="mt-8 animate-fade-in">
      <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">📋 Operational Roadmap: {goal.title}</h2>
      <div className="flex flex-col gap-6">
        {goal.milestones.map((milestone, mIdx) => (
          <div key={mIdx} className="bg-white p-6 border border-slate-200 border-l-4 border-l-blue-600 rounded-r-xl shadow-sm transition hover:shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">📍 {milestone.timeMarker} — {milestone.milestoneName}</h3>
              <button onClick={() => requestReview(mIdx)} disabled={reviewLoading[mIdx]} className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg cursor-pointer transition disabled:bg-slate-400 shrink-0 self-start sm:self-center">
                <Award size={14}/> {reviewLoading[mIdx] ? 'Analyzing...' : 'Request AI Evaluation'}
              </button>
            </div>
            
            <div className="bg-amber-50 text-amber-900 text-xs font-semibold px-3 py-2 rounded-md inline-flex items-center gap-1.5 mt-3 shadow-inner">
              <Gift size={14} className="text-amber-600"/> <strong>Reward Unlock Target:</strong> {milestone.motivationRewardIdea}
            </div>

            <ul className="space-y-3 mt-4">
              {milestone.actionableTasks.map((task, tIdx) => (
                <li key={tIdx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition group">
                  <input type="checkbox" checked={task.isCompleted} onChange={() => handleToggle(mIdx, tIdx)} className="mt-1 w-4 h-4 cursor-pointer rounded" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 w-full">
                    <span className={`text-sm font-medium transition ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.taskText}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-600 w-fit shrink-0">
                      👤 {task.assignedTo}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {reviews[mIdx] && (
              <div className="bg-slate-100 p-4 rounded-lg border-l-4 border-slate-500 mt-4 text-sm text-slate-700 font-medium animate-fade-in">
                🤖 <strong className="text-slate-900">AI Performance Review:</strong> {reviews[mIdx]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

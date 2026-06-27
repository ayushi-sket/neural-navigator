import { useState } from 'react';
import { Target, Users, DollarSign, Clock } from 'lucide-react';

export default function GoalForm({ onSubmit, loading }) {
  const [userGoal, setUserGoal] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [timelineValue, setTimelineValue] = useState(3);
  const [timelineUnit, setTimelineUnit] = useState('months');
  const [isMoneyInvolved, setIsMoneyInvolved] = useState(false);
  const [budget, setBudget] = useState(0);
  const [isTeamGoal, setIsTeamGoal] = useState(false);
  const [teamInput, setTeamInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const teamMembers = teamInput.split(',').map(m => m.trim()).filter(Boolean);
    onSubmit({
      userGoal,
      hoursPerWeek: Number(hoursPerWeek),
      timelineValue: Number(timelineValue),
      timelineUnit,
      isMoneyInvolved,
      budget: Number(budget),
      isTeamGoal,
      teamMembers
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm flex flex-col gap-5">
      <div>
        <label className="block font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Target size={18} className="text-blue-600"/> What long-term goal are we building?
        </label>
        <input type="text" required value={userGoal} onChange={e => setUserGoal(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-blue-600 focus:ring-2 focus:ring-blue-100 transition" placeholder="e.g., Launch mobile delivery application" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5"><Clock size={16}/> Hours/Week</label>
          <input type="number" min="1" value={hoursPerWeek} onChange={e => setHoursPerWeek(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-blue-600" />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Duration Value</label>
          <input type="number" min="1" value={timelineValue} onChange={e => setTimelineValue(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-blue-600" />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Unit</label>
          <select value={timelineUnit} onChange={e => setTimelineUnit(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg bg-white focus:outline-blue-600">
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </select>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
        <label className="inline-flex items-center gap-2 text-slate-700 font-medium cursor-pointer select-none">
          <input type="checkbox" checked={isMoneyInvolved} onChange={e => setIsMoneyInvolved(e.target.checked)} className="rounded" /> Include Financial Tracking
        </label>
        {isMoneyInvolved && (
          <div className="relative animate-fade-in">
            <DollarSign className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input type="number" placeholder="Budget allocation (USD)" value={budget} onChange={e => setBudget(e.target.value)} className="w-full pl-9 p-3 border border-slate-300 rounded-lg focus:outline-blue-600" />
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
        <label className="inline-flex items-center gap-2 text-slate-700 font-medium cursor-pointer select-none">
          <input type="checkbox" checked={isTeamGoal} onChange={e => setIsTeamGoal(e.target.checked)} className="rounded" /> Include Team Assignment
        </label>
        {isTeamGoal && (
          <div className="relative animate-fade-in">
            <Users className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input type="text" placeholder="Separate roles with commas (e.g., UI Dev, Designer, QA)" value={teamInput} onChange={e => setTeamInput(e.target.value)} className="w-full pl-9 p-3 border border-slate-300 rounded-lg focus:outline-blue-600" />
          </div>
        )}
      </div>

      <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3.5 rounded-lg cursor-pointer transition disabled:bg-slate-400 shadow-md shadow-blue-100 mt-2">
        {loading ? '🧠 Gemini AI Assembling Matrix...' : 'Generate Advanced Blueprint'}
      </button>
    </form>
  );
}

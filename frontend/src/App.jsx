import { useState } from 'react';
import MotivationQuote from './components/MotivationQuote';
import GoalForm from './components/GoalForm';
import Roadmap from './components/Roadmap';
import { goalService } from './services/api';

function App() {
  const [currentGoal, setCurrentGoal] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setCurrentGoal(null);
    try {
      const data = await goalService.generateGoal(formData);
      setCurrentGoal(data);
    } catch (err) {
      alert('Failed to formulate blueprint grid. Verify backend pipeline integration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 min-h-screen text-slate-800">
      <header className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">🎯 Enterprise AI Goal Deconstructor</h1>
        <p className="text-sm text-slate-500 font-medium">Deconstruct long term objectives into context-aware collaborative metrics.</p>
      </header>

      <MotivationQuote />
      <GoalForm onSubmit={handleFormSubmit} loading={loading} />
      {currentGoal && <Roadmap goal={currentGoal} onUpdate={setCurrentGoal} />}
    </div>
  );
}

export default App;

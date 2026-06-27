import { useState, useEffect } from 'react';
import { goalService } from '../services/api';
import { Sparkles } from 'lucide-react';

export default function MotivationQuote() {
  const [quote, setQuote] = useState('Loading daily focus spark...');

  useEffect(() => {
    goalService.getDailyQuote()
      .then(data => setQuote(data.quote))
      .catch(() => setQuote('Small daily iterations build massive empires. Keep pushing!'));
  }, []);

  return (
    <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg my-6 flex items-center gap-3 text-blue-900 font-medium italic shadow-sm animate-fade-in">
      <Sparkles className="text-blue-600 shrink-0" size={20} />
      <span>"{quote}"</span>
    </div>
  );
}

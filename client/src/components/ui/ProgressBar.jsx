import React from 'react';

export function ProgressBar({ value, max = 100, color }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const bg = color || (pct < 70 ? 'bg-green-500' : pct < 90 ? 'bg-yellow-400' : 'bg-red-500');
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div className={`h-3 rounded-full transition-all ${bg}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

export function AnimatedBarChart() {
  const [heights, setHeights] = useState([20, 40, 30, 60, 45, 80, 65, 90, 75, 100]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHeights(prev => prev.map(() => Math.random() * 60 + 40));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-end gap-2 h-32">
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-1000 ease-out"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

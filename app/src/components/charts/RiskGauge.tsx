'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getRiskColor } from '../../../../shared/utils';
import type { RiskCategory } from '../../../../shared/types';

interface RiskGaugeProps {
  score: number;
  category: RiskCategory;
  size?: number;
}

export function RiskGauge({ score, category, size = 200 }: RiskGaugeProps) {
  const color = getRiskColor(category);
  const remaining = 100 - score;

  const data = [
    { value: score, color },
    { value: remaining, color: 'transparent' },
  ];

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size / 1.5 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={size * 0.28}
            outerRadius={size * 0.42}
            paddingAngle={0}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Score overlay */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-2">
        <p
          className="text-4xl font-black leading-none"
          style={{ color }}
        >
          {score}
        </p>
        <p className="text-xs text-base-content/50 mt-0.5 uppercase tracking-widest">
          {category}
        </p>
      </div>
    </div>
  );
}

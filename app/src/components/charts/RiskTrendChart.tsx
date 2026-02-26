'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useTranslations } from 'next-intl';

interface TrendDataPoint {
  date: string;
  score: number;
}

interface RiskTrendChartProps {
  data: TrendDataPoint[];
}

export function RiskTrendChart({ data }: RiskTrendChartProps) {
  const t = useTranslations('dashboard');

  return (
    <div className="cyber-card card-body p-4">
      <h3 className="text-sm font-semibold text-base-content/70 mb-4">{t('riskTrend')}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'rgba(148,163,184,0.6)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: 'rgba(148,163,184,0.6)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--base-200, #1e293b)',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <ReferenceLine y={75} stroke="#7c3aed" strokeDasharray="3 3" opacity={0.5} />
          <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} />
          <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.5} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ fill: '#0ea5e9', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: '#0ea5e9' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

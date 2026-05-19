'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { CATEGORY_META } from '@/components/cards/ExpenseCard';
import type { ExpenseCategory } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';

const COLORS: Record<ExpenseCategory, string> = {
  Food: '#F97316',
  Fuel: '#3B82F6',
  Hotel: '#A855F7',
  'Toll Tax': '#10B981',
  Emergency: '#EF4444',
  Misc: '#64748B',
};

interface ExpensePieChartProps {
  data: Record<ExpenseCategory, number>;
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  const chartData = (Object.entries(data) as [ExpenseCategory, number][])
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value, color: COLORS[name] }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="premium-card p-8 text-center">
        <p className="text-muted-foreground text-sm">No expense data yet</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="premium-card p-5"
    >
      <h3 className="font-semibold text-sm mb-4">Spending by Category</h3>
      <div className="flex items-center gap-4">
        <div className="relative w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 12,
                  fontSize: 12,
                  padding: '8px 12px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</span>
            <span className="text-sm font-semibold number-display">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          {chartData
            .sort((a, b) => b.value - a.value)
            .map((d) => {
              const meta = CATEGORY_META[d.name];
              const Icon = meta.icon;
              const pct = (d.value / total) * 100;
              return (
                <div key={d.name} className="flex items-center gap-2">
                  <div
                    className="w-1 h-6 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <Icon className={cn('w-3.5 h-3.5', meta.color)} />
                  <span className="text-xs flex-1 truncate">{d.name}</span>
                  <span className="text-xs font-semibold tabular-nums">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </motion.div>
  );
}

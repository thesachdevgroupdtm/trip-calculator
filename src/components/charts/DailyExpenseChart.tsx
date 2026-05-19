'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { formatCompactCurrency, formatCurrency } from '@/lib/utils';
import type { Expense } from '@/types';

interface DailyExpenseChartProps {
  expenses: Expense[];
}

export function DailyExpenseChart({ expenses }: DailyExpenseChartProps) {
  // Group by day for last 7 days
  const buckets: Record<string, number> = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    buckets[key] = 0;
  }
  expenses.forEach((e) => {
    const key = new Date(e.createdAt).toISOString().split('T')[0];
    if (key in buckets) buckets[key] += e.amount;
  });

  const data = Object.entries(buckets).map(([date, amount]) => ({
    date,
    amount,
    label: new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }),
    day: new Date(date).getDate(),
  }));

  const maxValue = Math.max(...data.map((d) => d.amount), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="premium-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm">Daily Spending</h3>
          <p className="text-[11px] text-muted-foreground">Last 7 days</p>
        </div>
      </div>
      <div className="h-40 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatCompactCurrency(v)}
              width={40}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }}
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 12,
                fontSize: 12,
                padding: '8px 12px',
              }}
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.amount === maxValue && maxValue > 0
                      ? '#EB0A1E'
                      : 'hsl(var(--primary) / 0.5)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

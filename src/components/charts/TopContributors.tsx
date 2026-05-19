'use client';

import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import type { Contribution } from '@/types';
import { formatCurrency, getInitials, getAvatarColor, cn } from '@/lib/utils';

interface TopContributorsProps {
  contributions: Contribution[];
}

export function TopContributors({ contributions }: TopContributorsProps) {
  // Aggregate by name
  const agg = new Map<string, number>();
  contributions.forEach((c) => {
    agg.set(c.name, (agg.get(c.name) ?? 0) + c.amount);
  });

  const sorted = Array.from(agg.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxValue = sorted[0]?.[1] ?? 1;

  if (sorted.length === 0) {
    return (
      <div className="premium-card p-8 text-center">
        <p className="text-muted-foreground text-sm">No contributors yet</p>
      </div>
    );
  }

  const rankIcons = [
    <Trophy key="t" className="w-3.5 h-3.5 text-amber-500" />,
    <Medal key="m" className="w-3.5 h-3.5 text-slate-400" />,
    <Award key="a" className="w-3.5 h-3.5 text-amber-700" />,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="premium-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Top Contributors</h3>
        <span className="text-[11px] text-muted-foreground">
          {sorted.length} {sorted.length === 1 ? 'person' : 'people'}
        </span>
      </div>

      <div className="space-y-3">
        {sorted.map(([name, amount], idx) => {
          const pct = (amount / maxValue) * 100;
          const avatarColor = getAvatarColor(name);
          return (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="space-y-1.5"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[11px] font-semibold shrink-0',
                    avatarColor
                  )}
                >
                  {getInitials(name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    {idx < 3 && rankIcons[idx]}
                    <span className="text-sm font-medium truncate">{name}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums shrink-0">
                  {formatCurrency(amount)}
                </span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden ml-10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  className={cn('h-full rounded-full bg-gradient-to-r', avatarColor)}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

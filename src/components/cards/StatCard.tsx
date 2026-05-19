'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  accentColor?: string;
  delay?: number;
  format?: 'currency' | 'number';
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendDirection = 'neutral',
  accentColor = 'from-galaxy-500/20 to-galaxy-700/20',
  delay = 0,
  format = 'currency',
}: StatCardProps) {
  const trendColors = {
    up: 'text-emerald-500',
    down: 'text-rose-500',
    neutral: 'text-muted-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="premium-card p-4 overflow-hidden relative group"
    >
      <div
        className={cn(
          'absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-50 transition-opacity bg-gradient-to-br',
          accentColor
        )}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br',
              accentColor
            )}
          >
            <Icon className="w-4 h-4" strokeWidth={2.25} />
          </div>
          {trend && (
            <span className={cn('text-[10px] font-semibold', trendColors[trendDirection])}>
              {trend}
            </span>
          )}
        </div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
          {label}
        </p>
        <div className="text-xl font-semibold">
          {format === 'currency' ? (
            <AnimatedCounter value={value} format="currency" />
          ) : (
            <AnimatedCounter value={value} format="number" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { formatCompactCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  balance: number;
  collected: number;
  spent: number;
  tripTitle: string;
}

export function BalanceCard({ balance, collected, spent, tripTitle }: BalanceCardProps) {
  const percentSpent = collected > 0 ? (spent / collected) * 100 : 0;
  const isHealthy = balance >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl p-6 text-white"
      style={{
        background:
          'linear-gradient(135deg, #0A0E1C 0%, #1a1f3a 35%, #2D3F6A 75%, #EB0A1E 100%)',
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-toyota-red/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-galaxy-500/30 rounded-full blur-3xl pointer-events-none" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium mb-1">
              Trip Balance
            </p>
            <p className="text-sm text-white/80 line-clamp-1">{tripTitle}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-2xl font-light text-white/70">₹</span>
            <AnimatedCounter
              value={Math.abs(balance)}
              format="number"
              className="text-5xl font-light tracking-tight"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {isHealthy ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span
              className={cn(
                'text-xs font-medium',
                isHealthy ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {isHealthy ? 'Available balance' : 'Over budget'}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] text-white/60 mb-1.5">
            <span>Spent {percentSpent.toFixed(0)}%</span>
            <span>{formatCompactCurrency(collected)} budget</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentSpent, 100)}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400 rounded-full"
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">
              Collected
            </p>
            <p className="text-sm font-semibold text-emerald-300">
              {formatCompactCurrency(collected)}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">
              Spent
            </p>
            <p className="text-sm font-semibold text-rose-300">
              {formatCompactCurrency(spent)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

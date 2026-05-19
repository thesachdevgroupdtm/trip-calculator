'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  Wallet,
  Users,
  Activity,
  PieChart as PieIcon,
  BarChart3,
  Trophy,
} from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { ExpensePieChart } from '@/components/charts/ExpensePieChart';
import { DailyExpenseChart } from '@/components/charts/DailyExpenseChart';
import { TopContributors } from '@/components/charts/TopContributors';
import { AnimatedCounter } from '@/components/cards/AnimatedCounter';
import { useTripStore } from '@/store/useTripStore';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <AnalyticsContent />
    </AuthGuard>
  );
}

function AnalyticsContent() {
  const contributions = useTripStore((s) => s.contributions);
  const expenses = useTripStore((s) => s.expenses);
  const getTotalCollected = useTripStore((s) => s.getTotalCollected);
  const getTotalSpent = useTripStore((s) => s.getTotalSpent);
  const getBalance = useTripStore((s) => s.getBalance);
  const getPerPersonContribution = useTripStore((s) => s.getPerPersonContribution);
  const getExpensesByCategory = useTripStore((s) => s.getExpensesByCategory);

  const totalCollected = getTotalCollected();
  const totalSpent = getTotalSpent();
  const balance = getBalance();
  const perPerson = getPerPersonContribution();
  const byCategory = getExpensesByCategory();

  const utilization = totalCollected > 0 ? (totalSpent / totalCollected) * 100 : 0;
  const avgExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  const hasData = contributions.length > 0 || expenses.length > 0;

  return (
    <div className="relative min-h-screen pb-24">
      <AppHeader title="Analytics" subtitle="Trip insights" back="/dashboard" />

      <main className="space-y-6 px-4 pt-4">
        {!hasData ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card flex flex-col items-center gap-3 p-10 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Nothing to analyse yet</p>
              <p className="text-xs text-muted-foreground">
                Add contributions and expenses to see insights here.
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Overview grid */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 gap-3"
            >
              <MetricTile
                icon={<TrendingUp className="h-4 w-4" />}
                label="Utilization"
                value={`${utilization.toFixed(1)}%`}
                tint="from-emerald-500/20 to-emerald-500/5"
                accent="text-emerald-400"
              />
              <MetricTile
                icon={<Wallet className="h-4 w-4" />}
                label="Avg expense"
                value={formatCurrency(avgExpense)}
                tint="from-sky-500/20 to-sky-500/5"
                accent="text-sky-400"
              />
              <MetricTile
                icon={<Users className="h-4 w-4" />}
                label="Per person"
                value={formatCurrency(perPerson)}
                tint="from-violet-500/20 to-violet-500/5"
                accent="text-violet-400"
              />
              <MetricTile
                icon={<Trophy className="h-4 w-4" />}
                label="Top category"
                value={topCategory && topCategory[1] > 0 ? topCategory[0] : '—'}
                tint="from-amber-500/20 to-amber-500/5"
                accent="text-amber-400"
              />
            </motion.div>

            {/* Snapshot bar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="premium-card overflow-hidden p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Trip snapshot
                </div>
                <span className="number-display text-xs text-muted-foreground">
                  ₹<AnimatedCounter value={balance} duration={800} /> left
                </span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Collected</span>
                    <span className="number-display font-semibold text-emerald-400">
                      {formatCurrency(totalCollected)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Spent</span>
                    <span className="number-display font-semibold text-rose-400">
                      {formatCurrency(totalSpent)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(utilization, 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pie chart */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-3"
            >
              <SectionHeader
                icon={<PieIcon className="h-3.5 w-3.5" />}
                title="By category"
                subtitle="Where the money went"
              />
              <ExpensePieChart data={byCategory} />
            </motion.section>

            {/* Daily chart */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="space-y-3"
            >
              <SectionHeader
                icon={<BarChart3 className="h-3.5 w-3.5" />}
                title="Last 7 days"
                subtitle="Daily expense trend"
              />
              <DailyExpenseChart expenses={expenses} />
            </motion.section>

            {/* Top contributors */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-3"
            >
              <SectionHeader
                icon={<Trophy className="h-3.5 w-3.5" />}
                title="Top contributors"
                subtitle="Members ranked by amount"
              />
              <TopContributors contributions={contributions} />
            </motion.section>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-end justify-between px-1">
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {icon}
          {title}
        </div>
        {subtitle && (
          <div className="mt-0.5 text-xs text-muted-foreground/70">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
  tint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: string;
  accent: string;
}) {
  return (
    <div className={`premium-card relative overflow-hidden bg-gradient-to-br ${tint} p-4`}>
      <div className={`mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] ${accent}`}>
        {icon}
        {label}
      </div>
      <div className="number-display truncate text-lg font-semibold">{value}</div>
    </div>
  );
}

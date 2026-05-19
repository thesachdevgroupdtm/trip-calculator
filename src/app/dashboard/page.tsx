'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Users,
  Plus,
  Receipt,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import { TripGuard } from '@/components/layout/TripGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PullToRefresh } from '@/components/layout/PullToRefresh';
import { BalanceCard } from '@/components/cards/BalanceCard';
import { StatCard } from '@/components/cards/StatCard';
import { ContributionCard } from '@/components/cards/ContributionCard';
import { ExpenseCard } from '@/components/cards/ExpenseCard';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  return (
    <TripGuard>
      <DashboardContent />
    </TripGuard>
  );
}

function DashboardContent() {
  const tripTitle = useTripStore((s) => s.settings.tripTitle);
  const contributions = useTripStore((s) => s.contributions);
  const expenses = useTripStore((s) => s.expenses);
  const getTotalCollected = useTripStore((s) => s.getTotalCollected);
  const getTotalSpent = useTripStore((s) => s.getTotalSpent);
  const getBalance = useTripStore((s) => s.getBalance);

  const collected = getTotalCollected();
  const spent = getTotalSpent();
  const balance = getBalance();
  const uniquePeople = new Set(contributions.map((c) => c.name.toLowerCase())).size;

  const today = new Date();
  const greeting = (() => {
    const h = today.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const handleRefresh = async () => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Up to date');
  };

  const recentContributions = contributions.slice(0, 3);
  const recentExpenses = expenses.slice(0, 3);

  return (
    <div className="min-h-screen pb-24">
      <AppHeader
        title={greeting}
        subtitle={formatDate(today, 'long')}
        rightSlot={
          <Link
            href="/analytics"
            className="w-10 h-10 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
            aria-label="Analytics"
          >
            <Sparkles className="w-5 h-5 text-primary" />
          </Link>
        }
      />

      <PullToRefresh onRefresh={handleRefresh}>
        <main className="p-4 space-y-5">
          {/* Hero balance */}
          <BalanceCard
            balance={balance}
            collected={collected}
            spent={spent}
            tripTitle={tripTitle}
          />

          {/* Stat cards row */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Collected"
              value={collected}
              icon={TrendingUp}
              trend="+12%"
              trendDirection="up"
              accentColor="from-emerald-500/25 to-teal-500/25"
              delay={0.1}
            />
            <StatCard
              label="Spent"
              value={spent}
              icon={TrendingDown}
              trend={collected > 0 ? `${((spent / collected) * 100).toFixed(0)}%` : '0%'}
              trendDirection="neutral"
              accentColor="from-rose-500/25 to-red-500/25"
              delay={0.15}
            />
            <StatCard
              label="Members"
              value={uniquePeople}
              icon={Users}
              accentColor="from-blue-500/25 to-cyan-500/25"
              delay={0.2}
              format="number"
            />
            <StatCard
              label="Per Person"
              value={uniquePeople > 0 ? collected / uniquePeople : 0}
              icon={Receipt}
              accentColor="from-amber-500/25 to-orange-500/25"
              delay={0.25}
            />
          </div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="grid grid-cols-2 gap-3"
          >
            <Link
              href="/collection"
              className="premium-card p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Collect</p>
                <p className="text-[11px] text-muted-foreground">Add payment</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link
              href="/expense"
              className="premium-card p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                <Plus className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Expense</p>
                <p className="text-[11px] text-muted-foreground">Log spend</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </motion.div>

          {/* Recent activity */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-base">Recent Collections</h2>
                <p className="text-[11px] text-muted-foreground">Latest contributions</p>
              </div>
              <Link
                href="/collection"
                className="text-xs font-medium text-primary hover:underline"
              >
                See all
              </Link>
            </div>
            <div className="space-y-2">
              {recentContributions.length > 0 ? (
                recentContributions.map((c, i) => (
                  <ContributionCard key={c.id} contribution={c} index={i} />
                ))
              ) : (
                <EmptyState
                  message="No contributions yet"
                  cta="Add the first one"
                  href="/collection"
                />
              )}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-base">Recent Expenses</h2>
                <p className="text-[11px] text-muted-foreground">Latest spending</p>
              </div>
              <Link
                href="/expense"
                className="text-xs font-medium text-primary hover:underline"
              >
                See all
              </Link>
            </div>
            <div className="space-y-2">
              {recentExpenses.length > 0 ? (
                recentExpenses.map((e, i) => (
                  <ExpenseCard key={e.id} expense={e} index={i} />
                ))
              ) : (
                <EmptyState
                  message="No expenses yet"
                  cta="Log the first one"
                  href="/expense"
                />
              )}
            </div>
          </motion.section>
        </main>
      </PullToRefresh>

      <BottomNav />
    </div>
  );
}

function EmptyState({
  message,
  cta,
  href,
}: {
  message: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="premium-card p-6 text-center">
      <p className="text-sm text-muted-foreground mb-2">{message}</p>
      <Link href={href} className="text-xs font-medium text-primary hover:underline">
        {cta} →
      </Link>
    </div>
  );
}

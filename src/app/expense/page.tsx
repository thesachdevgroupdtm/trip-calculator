'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, TrendingDown, Receipt } from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { ExpenseCard, CATEGORY_META } from '@/components/cards/ExpenseCard';
import { AnimatedCounter } from '@/components/cards/AnimatedCounter';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { useTripStore } from '@/store/useTripStore';
import type { ExpenseCategory } from '@/types';
import toast from 'react-hot-toast';

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Fuel',
  'Hotel',
  'Toll Tax',
  'Emergency',
  'Misc',
];

export default function ExpensePage() {
  return (
    <AuthGuard>
      <ExpenseContent />
    </AuthGuard>
  );
}

function ExpenseContent() {
  const expenses = useTripStore((s) => s.expenses);
  const addExpense = useTripStore((s) => s.addExpense);
  const getTotalSpent = useTripStore((s) => s.getTotalSpent);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | ExpenseCategory>('All');
  const [addOpen, setAddOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [description, setDescription] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenses
      .filter((e) => filter === 'All' || e.category === filter)
      .filter(
        (e) =>
          !q ||
          e.title.toLowerCase().includes(q) ||
          (e.description?.toLowerCase().includes(q) ?? false),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [expenses, filter, search]);

  const totalSpent = getTotalSpent();
  const filteredTotal = useMemo(
    () => filtered.reduce((sum, e) => sum + e.amount, 0),
    [filtered],
  );

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('Food');
    setDescription('');
  };

  const handleSave = () => {
    const trimmed = title.trim();
    const amt = parseFloat(amount);
    if (!trimmed) {
      toast.error('Enter a title');
      return;
    }
    if (!amt || amt <= 0 || Number.isNaN(amt)) {
      toast.error('Enter a valid amount');
      return;
    }
    addExpense({
      title: trimmed,
      amount: amt,
      category,
      description: description.trim() || undefined,
    });
    toast.success(`${category} expense added`);
    resetForm();
    setAddOpen(false);
  };

  return (
    <div className="relative min-h-screen pb-24">
      <AppHeader title="Expenses" subtitle="Track every rupee" />

      <main className="space-y-5 px-4 pt-4">
        {/* Total card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="premium-card relative overflow-hidden p-5"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-500/20 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <TrendingDown className="h-3.5 w-3.5" />
                Total spent
              </div>
              <div className="number-display text-3xl">
                <AnimatedCounter value={totalSpent} prefix="₹" />
              </div>
              <div className="text-xs text-muted-foreground">
                across {expenses.length} {expenses.length === 1 ? 'entry' : 'entries'}
              </div>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-600/10 ring-1 ring-rose-500/30">
              <Receipt className="h-6 w-6 text-rose-400" />
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="relative"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses..."
            className="h-12 pl-11 pr-4"
          />
        </motion.div>

        {/* Category filter chips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex gap-2 pb-1">
            <FilterChip
              label="All"
              active={filter === 'All'}
              onClick={() => setFilter('All')}
              count={expenses.length}
            />
            {CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              const count = expenses.filter((e) => e.category === cat).length;
              return (
                <FilterChip
                  key={cat}
                  label={cat}
                  active={filter === cat}
                  onClick={() => setFilter(cat)}
                  count={count}
                  icon={<Icon className="h-3.5 w-3.5" />}
                />
              );
            })}
          </div>
        </motion.div>

        {/* Filter total */}
        {filter !== 'All' && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-2.5 text-sm"
          >
            <span className="text-muted-foreground">
              {filter} subtotal
            </span>
            <span className="number-display font-semibold">
              ₹{filteredTotal.toLocaleString('en-IN')}
            </span>
          </motion.div>
        )}

        {/* Expense list */}
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="premium-card flex flex-col items-center gap-3 p-10 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
                  <Receipt className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">No expenses yet</p>
                  <p className="text-xs text-muted-foreground">
                    {search || filter !== 'All'
                      ? 'Try a different filter or search'
                      : 'Tap + to add your first expense'}
                  </p>
                </div>
              </motion.div>
            ) : (
              filtered.map((expense, idx) => (
                <motion.div
                  key={expense.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
                >
                  <ExpenseCard expense={expense} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* FAB */}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 mx-auto flex max-w-md justify-end px-4">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setAddOpen(true)}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-toyota-red to-red-700 text-white shadow-glow-red ring-1 ring-white/10"
          aria-label="Add expense"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </motion.button>
      </div>

      <BottomNav />

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="exp-title">Title</Label>
              <Input
                id="exp-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dinner at dhaba"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-amount">Amount (₹)</Label>
              <Input
                id="exp-amount"
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-cat">Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as ExpenseCategory)}
              >
                <SelectTrigger id="exp-cat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    const Icon = meta.icon;
                    return (
                      <SelectItem key={cat} value={cat}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {cat}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-desc">Description (optional)</Label>
              <Textarea
                id="exp-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Any extra detail..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="toyota" onClick={handleSave}>
              Save expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  count,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 transition-all ${
        active
          ? 'bg-foreground text-background ring-foreground shadow-sm'
          : 'bg-background/40 text-muted-foreground ring-border hover:text-foreground'
      }`}
    >
      {icon}
      <span>{label}</span>
      <span
        className={`rounded-full px-1.5 text-[10px] tabular-nums ${
          active ? 'bg-background/20' : 'bg-muted/60'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

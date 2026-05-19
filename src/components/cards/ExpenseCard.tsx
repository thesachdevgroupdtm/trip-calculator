'use client';

import { motion } from 'framer-motion';
import {
  MoreVertical,
  Pencil,
  Trash2,
  UtensilsCrossed,
  Fuel,
  BedDouble,
  Receipt,
  Siren,
  Package,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { formatCurrency, formatRelativeTime, cn } from '@/lib/utils';
import type { Expense, ExpenseCategory } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { ConfirmModal } from '@/components/layout/ConfirmModal';
import { useTripStore } from '@/store/useTripStore';
import toast from 'react-hot-toast';

export const CATEGORY_META: Record<
  ExpenseCategory,
  { icon: LucideIcon; color: string; gradient: string }
> = {
  Food: {
    icon: UtensilsCrossed,
    color: 'text-orange-600 dark:text-orange-400',
    gradient: 'from-orange-500/20 to-amber-500/20',
  },
  Fuel: {
    icon: Fuel,
    color: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  Hotel: {
    icon: BedDouble,
    color: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  'Toll Tax': {
    icon: Receipt,
    color: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  Emergency: {
    icon: Siren,
    color: 'text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-500/20 to-red-500/20',
  },
  Misc: {
    icon: Package,
    color: 'text-slate-600 dark:text-slate-400',
    gradient: 'from-slate-500/20 to-zinc-500/20',
  },
};

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Fuel',
  'Hotel',
  'Toll Tax',
  'Emergency',
  'Misc',
];

interface ExpenseCardProps {
  expense: Expense;
  index?: number;
}

export function ExpenseCard({ expense, index = 0 }: ExpenseCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(expense.title);
  const [editAmount, setEditAmount] = useState(expense.amount.toString());
  const [editCategory, setEditCategory] = useState<ExpenseCategory>(expense.category);
  const [editDescription, setEditDescription] = useState(expense.description ?? '');

  const updateExpense = useTripStore((s) => s.updateExpense);
  const deleteExpense = useTripStore((s) => s.deleteExpense);

  const meta = CATEGORY_META[expense.category];
  const Icon = meta.icon;

  const handleUpdate = () => {
    const amount = parseFloat(editAmount);
    if (!editTitle.trim() || !amount || amount <= 0) {
      toast.error('Please enter a valid title and amount');
      return;
    }
    updateExpense(expense.id, {
      title: editTitle.trim(),
      amount,
      category: editCategory,
      description: editDescription.trim() || undefined,
    });
    setEditOpen(false);
    toast.success('Expense updated');
  };

  const handleDelete = () => {
    deleteExpense(expense.id);
    toast.success('Expense removed');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        className="premium-card p-4 flex items-center gap-3 relative"
      >
        <div
          className={cn(
            'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br',
            meta.gradient
          )}
        >
          <Icon className={cn('w-5 h-5', meta.color)} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{expense.title}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className={cn('chip bg-muted/60', meta.color)}>{expense.category}</span>
            <span>{formatRelativeTime(expense.createdAt)}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-sm text-rose-600 dark:text-rose-400 number-display">
            −{formatCurrency(expense.amount)}
          </p>
        </div>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors -mr-1"
          aria-label="Options"
        >
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute right-2 top-12 z-10 glass-strong rounded-xl py-1 min-w-[140px] shadow-premium overflow-hidden"
          >
            <button
              onClick={() => {
                setEditOpen(true);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent text-sm text-left"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => {
                setDeleteOpen(true);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent text-sm text-left text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </motion.div>
        )}

        {showMenu && (
          <div className="fixed inset-0 z-[5]" onClick={() => setShowMenu(false)} />
        )}
      </motion.div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                inputMode="decimal"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cat">Category</Label>
              <Select
                value={editCategory}
                onValueChange={(v) => setEditCategory(v as ExpenseCategory)}
              >
                <SelectTrigger id="edit-cat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description (optional)</Label>
              <Input
                id="edit-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="flex-1">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete expense?"
        description={`Remove "${expense.title}" of ${formatCurrency(expense.amount)}. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
}

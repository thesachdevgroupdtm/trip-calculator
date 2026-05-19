'use client';

import { motion } from 'framer-motion';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency, formatRelativeTime, getInitials, getAvatarColor, cn } from '@/lib/utils';
import type { Contribution } from '@/types';
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
import { ConfirmModal } from '@/components/layout/ConfirmModal';
import { useTripStore } from '@/store/useTripStore';
import toast from 'react-hot-toast';

interface ContributionCardProps {
  contribution: Contribution;
  index?: number;
}

export function ContributionCard({ contribution, index = 0 }: ContributionCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editName, setEditName] = useState(contribution.name);
  const [editAmount, setEditAmount] = useState(contribution.amount.toString());
  const [editNote, setEditNote] = useState(contribution.note ?? '');

  const updateContribution = useTripStore((s) => s.updateContribution);
  const deleteContribution = useTripStore((s) => s.deleteContribution);

  const avatarColor = getAvatarColor(contribution.name);
  const initials = getInitials(contribution.name);

  const handleUpdate = () => {
    const amount = parseFloat(editAmount);
    if (!editName.trim() || !amount || amount <= 0) {
      toast.error('Please enter valid name and amount');
      return;
    }
    updateContribution(contribution.id, {
      name: editName.trim(),
      amount,
      note: editNote.trim() || undefined,
    });
    setEditOpen(false);
    toast.success('Contribution updated');
  };

  const handleDelete = () => {
    deleteContribution(contribution.id);
    toast.success('Contribution removed');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        className="premium-card p-4 flex items-center gap-3 group relative"
      >
        <div
          className={cn(
            'w-11 h-11 rounded-full flex items-center justify-center font-semibold text-white text-sm shrink-0',
            'bg-gradient-to-br',
            avatarColor
          )}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{contribution.name}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>{formatRelativeTime(contribution.createdAt)}</span>
            {contribution.note && (
              <>
                <span>•</span>
                <span className="truncate">{contribution.note}</span>
              </>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 number-display">
            +{formatCurrency(contribution.amount)}
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
          <div
            className="fixed inset-0 z-[5]"
            onClick={() => setShowMenu(false)}
          />
        )}
      </motion.div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contribution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
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
              <Label htmlFor="edit-note">Note (optional)</Label>
              <Input
                id="edit-note"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
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
        title="Delete contribution?"
        description={`Remove ${contribution.name}'s contribution of ${formatCurrency(contribution.amount)}. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
}

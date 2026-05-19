'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X } from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { QRDisplay } from '@/components/cards/QRDisplay';
import { ContributionCard } from '@/components/cards/ContributionCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { useTripStore } from '@/store/useTripStore';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CollectionPage() {
  return (
    <AuthGuard>
      <CollectionContent />
    </AuthGuard>
  );
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

function CollectionContent() {
  const contributions = useTripStore((s) => s.contributions);
  const addContribution = useTripStore((s) => s.addContribution);
  const getTotalCollected = useTripStore((s) => s.getTotalCollected);

  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contributions;
    return contributions.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.note?.toLowerCase().includes(q)
    );
  }, [contributions, search]);

  const total = getTotalCollected();

  const resetForm = () => {
    setName('');
    setAmount('');
    setNote('');
  };

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!name.trim()) {
      toast.error('Enter contributor name');
      return;
    }
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    addContribution({ name: name.trim(), amount: amt, note: note.trim() || undefined });
    toast.success(`${formatCurrency(amt)} from ${name.trim()}`);
    resetForm();
    setAddOpen(false);
  };

  return (
    <div className="min-h-screen pb-24">
      <AppHeader title="Collections" subtitle={`${formatCurrency(total)} collected`} back="/dashboard" />

      <main className="p-4 space-y-5">
        <QRDisplay />

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contributors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 bg-card"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-accent flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base">
              History
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                {filtered.length}
              </span>
            </h2>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                filtered.map((c, i) => (
                  <ContributionCard key={c.id} contribution={c} index={i} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="premium-card p-8 text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    {search ? 'No contributors match your search' : 'No contributions yet'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* FAB */}
      <motion.button
        onClick={() => setAddOpen(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 h-14 px-5 rounded-2xl toyota-gradient text-white shadow-glow-red font-semibold text-sm active:scale-95 transition-transform"
        style={{ right: 'max(1rem, calc((100vw - 28rem) / 2 + 1rem))' }}
      >
        <Plus className="w-5 h-5" strokeWidth={2.5} />
        Add Collection
      </motion.button>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Contributor name</Label>
              <Input
                id="name"
                placeholder="e.g. Rohit Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amt">Amount (₹)</Label>
              <Input
                id="amt"
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="flex gap-2 pt-1 flex-wrap">
                {QUICK_AMOUNTS.map((qa) => (
                  <button
                    key={qa}
                    type="button"
                    onClick={() => setAmount(qa.toString())}
                    className="px-3 py-1 rounded-full bg-muted hover:bg-accent text-xs font-medium transition-colors"
                  >
                    ₹{qa.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                placeholder="e.g. Via UPI"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setAddOpen(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="toyota" onClick={handleSave} className="flex-1">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}

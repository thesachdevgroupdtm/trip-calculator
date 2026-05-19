'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Pencil,
  Lock,
  Download,
  Upload,
  FileText,
  Trash2,
  LogOut,
  Palette,
  ChevronRight,
  Check,
  Info,
} from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { ConfirmModal } from '@/components/layout/ConfirmModal';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
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
import { downloadJSON, formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

function SettingsContent() {
  const router = useRouter();

  const settings = useTripStore((s) => s.settings);
  const contributions = useTripStore((s) => s.contributions);
  const expenses = useTripStore((s) => s.expenses);
  const setTripTitle = useTripStore((s) => s.setTripTitle);
  const setPasscode = useTripStore((s) => s.setPasscode);
  const resetTrip = useTripStore((s) => s.resetTrip);
  const importData = useTripStore((s) => s.importData);
  const logout = useTripStore((s) => s.logout);
  const getTotalCollected = useTripStore((s) => s.getTotalCollected);
  const getTotalSpent = useTripStore((s) => s.getTotalSpent);
  const getBalance = useTripStore((s) => s.getBalance);
  const getPerPersonContribution = useTripStore((s) => s.getPerPersonContribution);

  const [titleOpen, setTitleOpen] = useState(false);
  const [passcodeOpen, setPasscodeOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const [tripTitleDraft, setTripTitleDraft] = useState(settings.tripTitle);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Save trip title
  const handleSaveTitle = () => {
    const t = tripTitleDraft.trim();
    if (!t) {
      toast.error('Title cannot be empty');
      return;
    }
    setTripTitle(t);
    toast.success('Trip title updated');
    setTitleOpen(false);
  };

  // Change passcode
  const handleChangePasscode = () => {
    if (currentPass !== settings.passcode) {
      toast.error('Current passcode is wrong');
      return;
    }
    if (!/^\d{4}$/.test(newPass)) {
      toast.error('Passcode must be 4 digits');
      return;
    }
    if (newPass !== confirmPass) {
      toast.error('Passcodes do not match');
      return;
    }
    setPasscode(newPass);
    toast.success('Passcode updated');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setPasscodeOpen(false);
  };

  // Export JSON backup
  const handleExportJSON = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tripTitle: settings.tripTitle,
      settings,
      contributions,
      expenses,
    };
    const stamp = new Date().toISOString().slice(0, 10);
    downloadJSON(payload, `galaxy-trip-backup-${stamp}.json`);
    toast.success('Backup downloaded');
  };

  // Import JSON backup
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data.contributions) || !Array.isArray(data.expenses)) {
        throw new Error('Invalid backup file');
      }
      importData({
        contributions: data.contributions,
        expenses: data.expenses,
        settings: data.settings,
      });
      toast.success('Backup restored');
    } catch (err) {
      toast.error('Could not read backup file');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Export PDF
  const handleExportPDF = async () => {
    try {
      const [{ default: jsPDF }, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const autoTable = autoTableModule.default;

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header band
      doc.setFillColor(235, 10, 30);
      doc.rect(0, 0, pageWidth, 70, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Galaxy Toyota Trip Summary', 40, 38);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(settings.tripTitle, 40, 56);

      // Body
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.text(`Generated: ${formatDate(new Date())}`, 40, 95);

      // Summary table
      const totalCollected = getTotalCollected();
      const totalSpent = getTotalSpent();
      const balance = getBalance();
      const perPerson = getPerPersonContribution();

      autoTable(doc, {
        startY: 115,
        head: [['Metric', 'Value']],
        body: [
          ['Total Collected', formatCurrency(totalCollected)],
          ['Total Spent', formatCurrency(totalSpent)],
          ['Remaining Balance', formatCurrency(balance)],
          ['Members', String(contributions.length)],
          ['Per Person', formatCurrency(perPerson)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [10, 14, 28], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 8 },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      });

      // Contributions
      // @ts-expect-error - lastAutoTable is added by autotable
      let y = doc.lastAutoTable.finalY + 24;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Contributions', 40, y);

      autoTable(doc, {
        startY: y + 8,
        head: [['#', 'Name', 'Amount', 'Date', 'Note']],
        body: contributions.map((c, i) => [
          String(i + 1),
          c.name,
          formatCurrency(c.amount),
          formatDate(c.createdAt),
          c.note ?? 'â€”',
        ]),
        theme: 'striped',
        headStyles: { fillColor: [10, 14, 28], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 6 },
        columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
      });

      // Expenses
      // @ts-expect-error - lastAutoTable is added by autotable
      y = doc.lastAutoTable.finalY + 24;
      if (y > 720) {
        doc.addPage();
        y = 60;
      }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Expenses', 40, y);

      autoTable(doc, {
        startY: y + 8,
        head: [['#', 'Title', 'Category', 'Amount', 'Date']],
        body: expenses.map((e, i) => [
          String(i + 1),
          e.title,
          e.category,
          formatCurrency(e.amount),
          formatDate(e.createdAt),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [10, 14, 28], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 6 },
        columnStyles: { 3: { halign: 'right', fontStyle: 'bold' } },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(
          `Galaxy Toyota Trip Calculator  â€¢  Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 20,
          { align: 'center' },
        );
      }

      const stamp = new Date().toISOString().slice(0, 10);
      doc.save(`galaxy-trip-summary-${stamp}.pdf`);
      toast.success('PDF summary downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Could not generate PDF');
    }
  };

  // Reset trip
  const handleReset = () => {
    resetTrip();
    setResetOpen(false);
    toast.success('Trip data reset');
  };

  // Logout
  const handleLogout = () => {
    logout();
    setLogoutOpen(false);
    router.push('/');
  };

  return (
    <div className="relative min-h-screen pb-24">
      <AppHeader title="Settings" subtitle="Configure your trip" />

      <main className="space-y-6 px-4 pt-4">
        {/* Trip info header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="premium-card relative overflow-hidden p-5"
        >
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-toyota-red/15 blur-3xl" />
          <div className="relative space-y-1">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Current trip
            </div>
            <div className="font-display text-2xl leading-tight">{settings.tripTitle}</div>
            <div className="text-xs text-muted-foreground">
              {contributions.length} members Â· {expenses.length} expenses
            </div>
          </div>
        </motion.div>

        {/* Trip section */}
        <SettingsSection title="Trip">
          <SettingsRow
            icon={<Pencil className="h-4 w-4" />}
            label="Trip title"
            sublabel={settings.tripTitle}
            onClick={() => {
              setTripTitleDraft(settings.tripTitle);
              setTitleOpen(true);
            }}
          />
          <SettingsRow
            icon={<Lock className="h-4 w-4" />}
            label="Change passcode"
            sublabel="4-digit unlock code"
            onClick={() => setPasscodeOpen(true)}
          />
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">Theme</div>
                <div className="text-xs text-muted-foreground">Light or dark</div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </SettingsSection>

        {/* Data */}
        <SettingsSection title="Data">
          <SettingsRow
            icon={<FileText className="h-4 w-4" />}
            label="Export PDF summary"
            sublabel="Full trip report"
            onClick={handleExportPDF}
            accent="text-toyota-red"
          />
          <SettingsRow
            icon={<Download className="h-4 w-4" />}
            label="Export backup (JSON)"
            sublabel="Save all data locally"
            onClick={handleExportJSON}
          />
          <SettingsRow
            icon={<Upload className="h-4 w-4" />}
            label="Import backup (JSON)"
            sublabel="Restore from a backup file"
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
          />
        </SettingsSection>

        {/* Danger */}
        <SettingsSection title="Danger zone">
          <SettingsRow
            icon={<Trash2 className="h-4 w-4" />}
            label="Reset trip data"
            sublabel="Clear all contributions and expenses"
            onClick={() => setResetOpen(true)}
            accent="text-rose-400"
            destructive
          />
          <SettingsRow
            icon={<LogOut className="h-4 w-4" />}
            label="Log out"
            sublabel="Return to passcode screen"
            onClick={() => setLogoutOpen(true)}
          />
        </SettingsSection>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-1.5 pb-4 pt-2 text-center"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <Info className="h-3 w-3" />
            Galaxy Toyota Trip Calculator
          </div>
          <div className="text-[10px] text-muted-foreground/70">
            v1.0.0 Â· Made with care
          </div>
        </motion.div>
      </main>

      <BottomNav />

      {/* Trip title dialog */}
      <Dialog open={titleOpen} onOpenChange={setTitleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit trip title</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            <Label htmlFor="trip-title">Trip title</Label>
            <Input
              id="trip-title"
              value={tripTitleDraft}
              onChange={(e) => setTripTitleDraft(e.target.value)}
              placeholder="Galaxy Toyota Annual Trip"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTitleOpen(false)}>
              Cancel
            </Button>
            <Button variant="toyota" onClick={handleSaveTitle}>
              <Check className="mr-1 h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Passcode dialog */}
      <Dialog open={passcodeOpen} onOpenChange={setPasscodeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change passcode</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="cur-pass">Current passcode</Label>
              <Input
                id="cur-pass"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value.replace(/\D/g, ''))}
                placeholder="â€¢â€¢â€¢â€¢"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pass">New passcode (4 digits)</Label>
              <Input
                id="new-pass"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value.replace(/\D/g, ''))}
                placeholder="â€¢â€¢â€¢â€¢"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conf-pass">Confirm passcode</Label>
              <Input
                id="conf-pass"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value.replace(/\D/g, ''))}
                placeholder="â€¢â€¢â€¢â€¢"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPasscodeOpen(false)}>
              Cancel
            </Button>
            <Button variant="toyota" onClick={handleChangePasscode}>
              Update passcode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset confirm */}
      <ConfirmModal
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset everything?"
        description="All contributions and expenses will be permanently deleted. This action cannot be undone."
        confirmLabel="Yes, reset"
        onConfirm={handleReset}
      />

      {/* Logout confirm */}
      <ConfirmModal
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Log out?"
        description="You'll need to enter the passcode again to return."
        confirmLabel="Log out"
        variant="default"
        onConfirm={handleLogout}
      />
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <div className="px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function SettingsRow({
  icon,
  label,
  sublabel,
  onClick,
  accent,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick: () => void;
  accent?: string;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border bg-card/60 p-4 text-left transition-all active:scale-[0.98] ${
        destructive
          ? 'border-rose-500/20 hover:border-rose-500/40'
          : 'border-border/60 hover:border-border'
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          destructive
            ? 'bg-rose-500/10 text-rose-400'
            : accent
              ? `bg-muted/60 ${accent}`
              : 'bg-muted/60 text-muted-foreground'
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-sm font-medium ${destructive ? 'text-rose-400' : ''}`}>
          {label}
        </div>
        {sublabel && (
          <div className="truncate text-xs text-muted-foreground">{sublabel}</div>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

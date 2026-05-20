"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  KeyRound,
  ArrowRight,
  LogOut,
  Copy,
  Check,
  Users,
  Crown,
  UserPlus,
  Sparkles,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuardSupabase } from "@/components/layout/AuthGuardSupabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTrip } from "@/contexts/TripContext";
import * as api from "@/lib/supabase/trips";
import type { TripSummary } from "@/lib/supabase/trips";
import { formatCurrency, cn } from "@/lib/utils";

export default function TripsPage() {
  return (
    <AuthGuardSupabase>
      <TripsHub />
    </AuthGuardSupabase>
  );
}

function TripsHub() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { setActiveTrip } = useTrip();
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openingTripId, setOpeningTripId] = useState<string | null>(null);

  const greetingName = user?.email?.split("@")[0] ?? "there";

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await api.listMyTrips();
      setTrips(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const handleOpen = async (tripId: string) => {
    if (openingTripId) return;
    setOpeningTripId(tripId);
    try {
      await setActiveTrip(tripId);
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not open trip";
      toast.error(msg);
      setOpeningTripId(null);
    }
  };

  const handleSignOut = async () => {
    await setActiveTrip(null);
    await signOut();
    router.push("/login");
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Code copied");
      setTimeout(() => setCopiedCode(null), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader
        title="Your trips"
        subtitle={user?.email ?? undefined}
        rightSlot={
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-full px-3 h-9 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        }
      />

      <div className="mx-auto max-w-md px-4 pt-4 pb-24 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h2 className="font-display text-2xl">
            Hello, <span className="text-toyota-red">{greetingName}</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Start a new trip or jump into one with a code.
          </p>
        </motion.div>

        <div className="grid gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setCreateOpen(true)}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-toyota-red via-red-600 to-red-800 p-5 text-left text-white shadow-glow-red"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <Plus className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold">Create new trip</div>
                <div className="text-xs text-white/80">Generates a 6-char invite code</div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/70" />
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setJoinOpen(true)}
            className="premium-card p-5 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-galaxy-500/10 ring-1 ring-galaxy-500/30">
                <KeyRound className="h-5 w-5 text-galaxy-400" />
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold">Join with code</div>
                <div className="text-xs text-muted-foreground">
                  Enter a 6-char invite from a friend
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </motion.button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your trips
            </h3>
            {trips.length > 0 && (
              <span className="text-xs text-muted-foreground">{trips.length}</span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : trips.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-card/60">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No trips yet. Create one or join with a code.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {trips.map((t) => {
                const isOwner = t.owner_id === user?.id;
                const copied = copiedCode === t.invite_code;
                const opening = openingTripId === t.id;
                return (
                  <li key={t.id}>
                    <motion.div
                      whileTap={{ scale: 0.99 }}
                      className="premium-card p-4"
                    >
                      <button
                        onClick={() => handleOpen(t.id)}
                        disabled={!!openingTripId}
                        className="flex w-full items-center gap-3 text-left disabled:opacity-60"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="truncate font-semibold">{t.title}</h4>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                                isOwner
                                  ? "bg-toyota-red/15 text-toyota-red ring-1 ring-toyota-red/30"
                                  : "bg-galaxy-500/15 text-galaxy-300 ring-1 ring-galaxy-500/30"
                              )}
                            >
                              {isOwner ? (
                                <>
                                  <Crown className="h-2.5 w-2.5" /> Owner
                                </>
                              ) : (
                                <>
                                  <UserPlus className="h-2.5 w-2.5" /> Member
                                </>
                              )}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {t.member_count}
                            </span>
                            <span>{formatCurrency(t.total_collected)} collected</span>
                          </div>
                        </div>
                        {opening ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Invite code
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleCopy(t.invite_code);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-md bg-card/60 px-2 py-1 font-mono text-xs ring-1 ring-border/60 hover:bg-accent"
                        >
                          {t.invite_code}
                          {copied ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <CreateTripDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={async (tripId) => {
          setCreateOpen(false);
          await setActiveTrip(tripId);
          router.push("/dashboard");
        }}
      />
      <JoinTripDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        onJoined={async (tripId) => {
          setJoinOpen(false);
          await setActiveTrip(tripId);
          router.push("/dashboard");
        }}
      />
    </div>
  );
}

function CreateTripDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (tripId: string) => void | Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setBusy(false);
    }
  }, [open]);

  const handleCreate = async () => {
    const t = title.trim();
    if (t.length < 2) {
      toast.error("Give your trip a name");
      return;
    }
    setBusy(true);
    try {
      const { id } = await api.createTrip(t);
      toast.success("Trip created!");
      await onCreated(id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new trip</DialogTitle>
          <DialogDescription>
            Name your trip. You can invite others later with the 6-char code.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Galaxy Toyota Annual Trip"
          autoFocus
          disabled={busy}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="toyota" onClick={handleCreate} disabled={busy}>
            {busy ? "Creating..." : "Create trip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function JoinTripDialog({
  open,
  onOpenChange,
  onJoined,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onJoined: (tripId: string) => void | Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setCode("");
      setBusy(false);
    }
  }, [open]);

  const handleJoin = async () => {
    const c = code.trim().toUpperCase();
    if (c.length !== 6) {
      toast.error("Codes are 6 characters");
      return;
    }
    setBusy(true);
    try {
      const { id } = await api.joinTrip(c);
      toast.success("Joined trip!");
      await onJoined(id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join with code</DialogTitle>
          <DialogDescription>Enter the 6-character invite code.</DialogDescription>
        </DialogHeader>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          placeholder="ABCD12"
          className="text-center font-mono text-lg tracking-[0.4em] uppercase"
          maxLength={6}
          autoFocus
          disabled={busy}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="toyota" onClick={handleJoin} disabled={busy}>
            {busy ? "Joining..." : "Join trip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

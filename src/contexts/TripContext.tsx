"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Contribution, Expense, ExpenseCategory } from "@/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import * as api from "@/lib/supabase/trips";
import type { TripRow } from "@/lib/supabase/trips";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "galaxy-active-trip-id";

type TripCtx = {
  activeTripId: string | null;
  trip: TripRow | null;
  contributions: Contribution[];
  expenses: Expense[];
  loading: boolean;

  setActiveTrip: (tripId: string | null) => Promise<void>;
  refresh: () => Promise<void>;

  addContribution: (data: { name: string; amount: number; note?: string }) => Promise<void>;
  updateContribution: (id: string, data: Partial<Contribution>) => Promise<void>;
  deleteContribution: (id: string) => Promise<void>;

  addExpense: (data: {
    title: string;
    amount: number;
    category: ExpenseCategory;
    description?: string;
  }) => Promise<void>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  updateTrip: (patch: {
    title?: string;
    qr_image?: string | null;
    upi_id?: string | null;
  }) => Promise<void>;
};

const Ctx = createContext<TripCtx | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [trip, setTrip] = useState<TripRow | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setActiveTripId(saved);
    else setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      setTrip(null);
      setContributions([]);
      setExpenses([]);
      setActiveTripId(null);
      activeIdRef.current = null;
      setLoading(false);
    }
  }, [user]);

  const fetchAll = useCallback(async (tripId: string) => {
    setLoading(true);
    try {
      const [t, c, e] = await Promise.all([
        api.getTrip(tripId),
        api.listContributions(tripId),
        api.listExpenses(tripId),
      ]);
      setTrip(t);
      setContributions(c);
      setExpenses(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    activeIdRef.current = activeTripId;
    if (!activeTripId || !user) {
      setTrip(null);
      setContributions([]);
      setExpenses([]);
      setLoading(false);
      return;
    }
    void fetchAll(activeTripId);
  }, [activeTripId, user, fetchAll]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!activeTripId || !user) return;

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`trip:${activeTripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contributions",
          filter: `trip_id=eq.${activeTripId}`,
        },
        () => {
          const id = activeIdRef.current;
          if (id) void api.listContributions(id).then(setContributions).catch(() => {});
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `trip_id=eq.${activeTripId}`,
        },
        () => {
          const id = activeIdRef.current;
          if (id) void api.listExpenses(id).then(setExpenses).catch(() => {});
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activeTripId, user]);

  const setActiveTrip = useCallback(async (tripId: string | null) => {
    if (typeof window !== "undefined") {
      if (tripId) localStorage.setItem(STORAGE_KEY, tripId);
      else localStorage.removeItem(STORAGE_KEY);
    }
    setActiveTripId(tripId);
  }, []);

  const refresh = useCallback(async () => {
    if (activeTripId) await fetchAll(activeTripId);
  }, [activeTripId, fetchAll]);

  const value: TripCtx = {
    activeTripId,
    trip,
    contributions,
    expenses,
    loading,

    setActiveTrip,
    refresh,

    addContribution: async (data) => {
      if (!activeTripId) throw new Error("No active trip");
      await api.addContribution({ tripId: activeTripId, ...data });
    },
    updateContribution: async (id, data) => {
      await api.updateContribution(id, {
        name: data.name,
        amount: data.amount,
        note: data.note ?? null,
      });
    },
    deleteContribution: async (id) => {
      await api.deleteContribution(id);
    },

    addExpense: async (data) => {
      if (!activeTripId) throw new Error("No active trip");
      await api.addExpense({ tripId: activeTripId, ...data });
    },
    updateExpense: async (id, data) => {
      await api.updateExpense(id, {
        title: data.title,
        amount: data.amount,
        category: data.category,
        description: data.description ?? null,
      });
    },
    deleteExpense: async (id) => {
      await api.deleteExpense(id);
    },

    updateTrip: async (patch) => {
      if (!activeTripId) throw new Error("No active trip");
      await api.updateTrip(activeTripId, patch);
      const t = await api.getTrip(activeTripId);
      setTrip(t);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTrip() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTrip must be used inside <TripProvider>");
  return v;
}

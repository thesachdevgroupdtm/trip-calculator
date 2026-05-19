"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type {
  Contribution,
  Expense,
  ExpenseCategory,
  TripSettings,
} from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useTrip } from "@/contexts/TripContext";

export type LegacyTripStore = {
  contributions: Contribution[];
  expenses: Expense[];
  settings: TripSettings;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  login: (passcode: string) => boolean;
  logout: () => void | Promise<void>;
  setPasscode: (passcode: string) => void;

  addContribution: (data: { name: string; amount: number; note?: string }) => void | Promise<void>;
  updateContribution: (id: string, data: Partial<Contribution>) => void | Promise<void>;
  deleteContribution: (id: string) => void | Promise<void>;

  addExpense: (data: {
    title: string;
    amount: number;
    category: ExpenseCategory;
    description?: string;
  }) => void | Promise<void>;
  updateExpense: (id: string, data: Partial<Expense>) => void | Promise<void>;
  deleteExpense: (id: string) => void | Promise<void>;

  updateSettings: (data: Partial<TripSettings>) => void | Promise<void>;
  setQrImage: (image: string | null) => void | Promise<void>;
  setTripTitle: (title: string) => void | Promise<void>;

  resetTrip: () => void | Promise<void>;
  importData: (data: {
    contributions?: Contribution[];
    expenses?: Expense[];
    settings?: TripSettings;
  }) => void;
  setHasHydrated: (state: boolean) => void;

  getTotalCollected: () => number;
  getTotalSpent: () => number;
  getBalance: () => number;
  getPerPersonContribution: () => number;
  getExpensesByCategory: () => Record<ExpenseCategory, number>;
};

const CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Fuel",
  "Hotel",
  "Toll Tax",
  "Emergency",
  "Misc",
];

async function withToast<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    toast.error(msg);
    return undefined;
  }
}

function buildState(deps: {
  user: ReturnType<typeof useAuth>["user"];
  authLoading: boolean;
  signOut: ReturnType<typeof useAuth>["signOut"];
  trip: ReturnType<typeof useTrip>;
  router: ReturnType<typeof useRouter>;
}): LegacyTripStore {
  const { user, authLoading, signOut, trip, router } = deps;

  const settings: TripSettings = {
    tripTitle: trip.trip?.title ?? "Galaxy Toyota Annual Trip",
    qrImage: trip.trip?.qr_image ?? null,
    passcode: "1234",
    currency: "INR",
  };

  const contributions = trip.contributions;
  const expenses = trip.expenses;

  return {
    contributions,
    expenses,
    settings,
    isAuthenticated: !!user,
    hasHydrated: !authLoading,

    login: (passcode) => passcode === "1234",
    logout: async () => {
      await trip.setActiveTrip(null);
      await signOut();
      router.push("/login");
    },
    setPasscode: () => {
      // Passcode auth is deprecated under Supabase
    },

    addContribution: (data) =>
      withToast(() => trip.addContribution(data)).then(() => undefined),
    updateContribution: (id, data) =>
      withToast(() => trip.updateContribution(id, data)).then(() => undefined),
    deleteContribution: (id) =>
      withToast(() => trip.deleteContribution(id)).then(() => undefined),

    addExpense: (data) => withToast(() => trip.addExpense(data)).then(() => undefined),
    updateExpense: (id, data) =>
      withToast(() => trip.updateExpense(id, data)).then(() => undefined),
    deleteExpense: (id) => withToast(() => trip.deleteExpense(id)).then(() => undefined),

    updateSettings: (data) =>
      withToast(() =>
        trip.updateTrip({
          title: data.tripTitle,
          qr_image: data.qrImage,
        })
      ).then(() => undefined),
    setQrImage: (qrImage) =>
      withToast(() => trip.updateTrip({ qr_image: qrImage })).then(() => undefined),
    setTripTitle: (title) =>
      withToast(() => trip.updateTrip({ title })).then(() => undefined),

    resetTrip: async () => {
      if (!trip.activeTripId) return;
      const ok =
        typeof window === "undefined"
          ? true
          : window.confirm(
              "Clear all contributions and expenses for this trip? Other members will see them disappear too. You'll remain a member."
            );
      if (!ok) return;
      try {
        await trip.resetTripData();
        toast.success("Trip data cleared");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        toast.error(msg);
      }
    },
    importData: () => {
      // eslint-disable-next-line no-console
      console.warn(
        "importData is not supported in cloud mode — data lives in Supabase."
      );
    },
    setHasHydrated: () => {
      // No-op — hydration tracked via authLoading
    },

    getTotalCollected: () => contributions.reduce((s, c) => s + c.amount, 0),
    getTotalSpent: () => expenses.reduce((s, e) => s + e.amount, 0),
    getBalance: () =>
      contributions.reduce((s, c) => s + c.amount, 0) -
      expenses.reduce((s, e) => s + e.amount, 0),
    getPerPersonContribution: () => {
      const total = contributions.reduce((s, c) => s + c.amount, 0);
      const unique = new Set(contributions.map((c) => c.name.toLowerCase())).size;
      return unique > 0 ? total / unique : 0;
    },
    getExpensesByCategory: () => {
      const result = CATEGORIES.reduce(
        (acc, cat) => ({ ...acc, [cat]: 0 }),
        {} as Record<ExpenseCategory, number>
      );
      expenses.forEach((e) => {
        result[e.category] += e.amount;
      });
      return result;
    },
  };
}

export function useTripStore<T = LegacyTripStore>(
  selector?: (s: LegacyTripStore) => T
): T {
  const { user, loading: authLoading, signOut } = useAuth();
  const trip = useTrip();
  const router = useRouter();

  const state = buildState({ user, authLoading, signOut, trip, router });

  return (selector ? selector(state) : (state as unknown as T)) as T;
}

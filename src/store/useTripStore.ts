'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Contribution, Expense, TripSettings, ExpenseCategory } from '@/types';
import { generateId } from '@/lib/utils';

interface TripStore {
  // State
  contributions: Contribution[];
  expenses: Expense[];
  settings: TripSettings;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  // Auth
  login: (passcode: string) => boolean;
  logout: () => void;
  setPasscode: (passcode: string) => void;

  // Contributions
  addContribution: (data: { name: string; amount: number; note?: string }) => void;
  updateContribution: (id: string, data: Partial<Contribution>) => void;
  deleteContribution: (id: string) => void;

  // Expenses
  addExpense: (data: {
    title: string;
    amount: number;
    category: ExpenseCategory;
    description?: string;
  }) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Settings
  updateSettings: (data: Partial<TripSettings>) => void;
  setQrImage: (image: string | null) => void;
  setTripTitle: (title: string) => void;

  // Data management
  resetTrip: () => void;
  importData: (data: {
    contributions?: Contribution[];
    expenses?: Expense[];
    settings?: TripSettings;
  }) => void;
  setHasHydrated: (state: boolean) => void;

  // Computed (selectors)
  getTotalCollected: () => number;
  getTotalSpent: () => number;
  getBalance: () => number;
  getPerPersonContribution: () => number;
  getExpensesByCategory: () => Record<ExpenseCategory, number>;
}

const DEFAULT_SETTINGS: TripSettings = {
  tripTitle: 'Galaxy Toyota Annual Trip',
  qrImage: null,
  passcode: '1234',
  currency: 'INR',
};

// Demo / sample data
const SAMPLE_CONTRIBUTIONS: Contribution[] = [
  {
    id: 'c1',
    name: 'Rohit Sharma',
    amount: 5000,
    note: 'Cash collected at start',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'c2',
    name: 'Priya Verma',
    amount: 5000,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'c3',
    name: 'Arjun Patel',
    amount: 5000,
    note: 'Via UPI',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'c4',
    name: 'Sneha Kapoor',
    amount: 5000,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'c5',
    name: 'Vikram Singh',
    amount: 5000,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'c6',
    name: 'Anjali Mehta',
    amount: 5000,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const SAMPLE_EXPENSES: Expense[] = [
  {
    id: 'e1',
    title: 'Highway lunch — Punjabi dhaba',
    amount: 2400,
    category: 'Food',
    description: 'Group of 6 — paneer, dal, roti',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'e2',
    title: 'Fuel — HP Petrol Pump',
    amount: 4500,
    category: 'Fuel',
    description: 'Full tank, NH-48',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'e3',
    title: 'Hotel Royal Inn — Night 1',
    amount: 8000,
    category: 'Hotel',
    description: '3 rooms, breakfast included',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'e4',
    title: 'Toll booth — Gurgaon-Jaipur',
    amount: 650,
    category: 'Toll Tax',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'e5',
    title: 'Snacks & water',
    amount: 850,
    category: 'Misc',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      contributions: SAMPLE_CONTRIBUTIONS,
      expenses: SAMPLE_EXPENSES,
      settings: DEFAULT_SETTINGS,
      isAuthenticated: false,
      hasHydrated: false,

      setHasHydrated: (state) => set({ hasHydrated: state }),

      // Auth
      login: (passcode) => {
        const correct = passcode === get().settings.passcode;
        if (correct) set({ isAuthenticated: true });
        return correct;
      },
      logout: () => set({ isAuthenticated: false }),
      setPasscode: (passcode) =>
        set((state) => ({ settings: { ...state.settings, passcode } })),

      // Contributions
      addContribution: ({ name, amount, note }) =>
        set((state) => ({
          contributions: [
            {
              id: generateId(),
              name: name.trim(),
              amount,
              note: note?.trim(),
              createdAt: new Date().toISOString(),
            },
            ...state.contributions,
          ],
        })),

      updateContribution: (id, data) =>
        set((state) => ({
          contributions: state.contributions.map((c) =>
            c.id === id
              ? { ...c, ...data, updatedAt: new Date().toISOString() }
              : c
          ),
        })),

      deleteContribution: (id) =>
        set((state) => ({
          contributions: state.contributions.filter((c) => c.id !== id),
        })),

      // Expenses
      addExpense: ({ title, amount, category, description }) =>
        set((state) => ({
          expenses: [
            {
              id: generateId(),
              title: title.trim(),
              amount,
              category,
              description: description?.trim(),
              createdAt: new Date().toISOString(),
            },
            ...state.expenses,
          ],
        })),

      updateExpense: (id, data) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id
              ? { ...e, ...data, updatedAt: new Date().toISOString() }
              : e
          ),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      // Settings
      updateSettings: (data) =>
        set((state) => ({ settings: { ...state.settings, ...data } })),
      setQrImage: (qrImage) =>
        set((state) => ({ settings: { ...state.settings, qrImage } })),
      setTripTitle: (tripTitle) =>
        set((state) => ({ settings: { ...state.settings, tripTitle } })),

      // Data
      resetTrip: () =>
        set((state) => ({
          contributions: [],
          expenses: [],
          settings: { ...state.settings },
        })),
      importData: (data) =>
        set((state) => ({
          contributions: data.contributions ?? state.contributions,
          expenses: data.expenses ?? state.expenses,
          settings: data.settings ?? state.settings,
        })),

      // Computed
      getTotalCollected: () =>
        get().contributions.reduce((sum, c) => sum + c.amount, 0),
      getTotalSpent: () =>
        get().expenses.reduce((sum, e) => sum + e.amount, 0),
      getBalance: () => {
        const s = get();
        return (
          s.contributions.reduce((sum, c) => sum + c.amount, 0) -
          s.expenses.reduce((sum, e) => sum + e.amount, 0)
        );
      },
      getPerPersonContribution: () => {
        const s = get();
        const total = s.contributions.reduce((sum, c) => sum + c.amount, 0);
        const uniqueContributors = new Set(s.contributions.map((c) => c.name.toLowerCase())).size;
        return uniqueContributors > 0 ? total / uniqueContributors : 0;
      },
      getExpensesByCategory: () => {
        const categories: ExpenseCategory[] = [
          'Food',
          'Fuel',
          'Hotel',
          'Toll Tax',
          'Emergency',
          'Misc',
        ];
        const result = categories.reduce(
          (acc, cat) => ({ ...acc, [cat]: 0 }),
          {} as Record<ExpenseCategory, number>
        );
        get().expenses.forEach((e) => {
          result[e.category] += e.amount;
        });
        return result;
      },
    }),
    {
      name: 'galaxy-toyota-trip',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        contributions: state.contributions,
        expenses: state.expenses,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

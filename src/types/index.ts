export type ExpenseCategory =
  | 'Food'
  | 'Fuel'
  | 'Hotel'
  | 'Toll Tax'
  | 'Emergency'
  | 'Misc';

export interface Contribution {
  id: string;
  name: string;
  amount: number;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TripSettings {
  tripTitle: string;
  qrImage: string | null;
  passcode: string;
  currency: string;
}

export interface TripState {
  contributions: Contribution[];
  expenses: Expense[];
  settings: TripSettings;
  isAuthenticated: boolean;
}

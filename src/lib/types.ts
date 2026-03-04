
import type { GoalIconName } from './goal-icons';

export type User = {
  id: string;
  email: string;
  baseCurrency: 'INR';
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  kind: 'income' | 'expense';
  isArchived: boolean;
};

export type Transaction = {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  categoryId: string;
  category: string;
  amountMinor: number;
  dateISO: string;
  note?: string;
  merchant?: string;
  createdAt: string;
  updatedAt: string;
};

export type Budget = {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  categoryId: string;
  amountMinor: number;
};

export type Goal = {
  id: string;
  userId: string;
  name: string;
  icon: GoalIconName;
  targetAmountMinor: number;
  currentAmountMinor: number;
  targetDate?: string; // ISO string
  createdAt: string;
  updatedAt: string;
};

export type AppData = {
  user: User;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
};

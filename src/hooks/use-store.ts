'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { AppData, Category, Transaction, Budget, User, Goal } from '@/lib/types';

// Default data for a new user
const initialData: AppData = {
  user: {
    id: 'user-1',
    email: 'user@example.com',
    baseCurrency: 'INR',
    createdAt: new Date().toISOString(),
  },
  categories: [
    { id: 'cat-1', name: 'Salary', kind: 'income', isArchived: false },
    { id: 'cat-2', name: 'Groceries', kind: 'expense', isArchived: false },
    { id: 'cat-3', name: 'Rent', kind: 'expense', isArchived: false },
    { id: 'cat-4', name: 'Transport', kind: 'expense', isArchived: false },
    { id: 'cat-5', name: 'Entertainment', kind: 'expense', isArchived: false },
    { id: 'cat-6', name: 'Utilities', kind: 'expense', isArchived: false },
    { id: 'cat-7', name: 'Health', kind: 'expense', isArchived: false },
    { id: 'cat-8', name: 'Freelance', kind: 'income', isArchived: false },
    { id: 'cat-9', name: 'Other', kind: 'expense', isArchived: false },
  ],
  transactions: [],
  budgets: [],
  goals: [],
};

const STORAGE_KEY = 'cashflow-tracker-data';
const AUTH_KEY = 'cashflow-tracker-auth';

interface StoreContextType {
  isLoggedIn: boolean | null;
  isLoading: boolean;
  login: (email: string) => void;
  logout: () => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  upsertCategory: (cat: Omit<Category, 'id' | 'isArchived'> | Category) => void;
  getBudgetForCategory: (categoryId: string, month: string) => Budget | undefined;
  upsertBudget: (budget: Omit<Budget, 'id' | 'userId'>) => void;
  deleteBudget: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'currentAmountMinor'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  addContributionToGoal: (goalId: string, amountMinor: number) => void;
  importData: (data: AppData) => void;
  user: User;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AppData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const authStatus = localStorage.getItem(AUTH_KEY);
      setIsLoggedIn(authStatus === 'true');
    } catch (error) {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn === null) return;

    if (isLoggedIn) {
      try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (!parsedData.goals) {
            parsedData.goals = []; // Backwards compatibility for old data
          }
          setData(parsedData);
        } else {
          // First time login, set initial data
          setData(initialData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        }
      } catch (error) {
        console.error('Failed to load data from storage:', error);
        setData(initialData); // Fallback to initial data
      }
    } else {
      setData(null);
    }
  }, [isLoggedIn]);

  const updateAndPersistData = useCallback((newData: AppData) => {
    setData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error('Failed to save data to storage:', error);
    }
  }, []);

  const login = useCallback(
    (email: string) => {
      try {
        localStorage.setItem(AUTH_KEY, 'true');
        const storedData = localStorage.getItem(STORAGE_KEY);
        const userData = storedData
          ? { ...JSON.parse(storedData).user, email }
          : { ...initialData.user, email };
        const appData = storedData
          ? { ...JSON.parse(storedData), user: userData }
          : { ...initialData, user: userData };

        updateAndPersistData(appData);
        setIsLoggedIn(true);
        router.push('/dashboard');
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
    [router, updateAndPersistData]
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_KEY);
      setIsLoggedIn(false);
      setData(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [router]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!data) return;
    const newTransaction: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random()}`,
      userId: data.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const newData = {
      ...data,
      transactions: [newTransaction, ...data.transactions],
    };
    updateAndPersistData(newData);
  }, [data, updateAndPersistData]);
  
  const updateTransaction = useCallback((tx: Transaction) => {
    if (!data) return;
    const updatedTransactions = data.transactions.map(t => t.id === tx.id ? {...tx, updatedAt: new Date().toISOString()} : t);
    const newData = {...data, transactions: updatedTransactions};
    updateAndPersistData(newData);
  }, [data, updateAndPersistData]);

  const deleteTransaction = useCallback((id: string) => {
    if (!data) return;
    const updatedTransactions = data.transactions.filter(t => t.id !== id);
    const newData = {...data, transactions: updatedTransactions};
    updateAndPersistData(newData);
  }, [data, updateAndPersistData]);

  const getCategoryById = useCallback((id: string) => {
    return data?.categories.find(c => c.id === id);
  }, [data]);

  const upsertCategory = useCallback((cat: Omit<Category, 'id' | 'isArchived'> | Category) => {
    if (!data) return;
    if ('id' in cat) {
      // Update
      const updatedCategories = data.categories.map(c => (c.id === cat.id ? { ...c, ...cat } : c));
      // Also update name in existing transactions
      const updatedTransactions = data.transactions.map(t => {
        if (t.categoryId === cat.id) {
          return { ...t, category: cat.name };
        }
        return t;
      });
      updateAndPersistData({ ...data, categories: updatedCategories, transactions: updatedTransactions });
    } else {
      // Create
      const newCategory: Category = {
        ...cat,
        id: `cat-${Date.now()}-${Math.random()}`,
        isArchived: false,
      };
      updateAndPersistData({ ...data, categories: [...data.categories, newCategory] });
    }
  }, [data, updateAndPersistData]);

  const getBudgetForCategory = useCallback((categoryId: string, month: string) => {
    return data?.budgets.find(b => b.categoryId === categoryId && b.month === month);
  }, [data]);

  const upsertBudget = useCallback((budget: Omit<Budget, 'id'|'userId'>) => {
    if (!data) return;
    const existingBudget = data.budgets.find(b => b.categoryId === budget.categoryId && b.month === budget.month);
    if(existingBudget) {
      const updatedBudgets = data.budgets.map(b => b.id === existingBudget.id ? {...existingBudget, amountMinor: budget.amountMinor} : b);
      updateAndPersistData({...data, budgets: updatedBudgets});
    } else {
      const newBudget: Budget = {
        ...budget,
        id: `bud-${Date.now()}-${Math.random()}`,
        userId: data.user.id
      };
      updateAndPersistData({...data, budgets: [...data.budgets, newBudget]});
    }
  }, [data, updateAndPersistData]);

  const deleteBudget = useCallback((id: string) => {
    if (!data) return;
    const updatedBudgets = data.budgets.filter(b => b.id !== id);
    const newData = {...data, budgets: updatedBudgets};
    updateAndPersistData(newData);
  }, [data, updateAndPersistData]);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'currentAmountMinor'>) => {
    if (!data) return;
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random()}`,
      userId: data.user.id,
      currentAmountMinor: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const newData = {
      ...data,
      goals: [newGoal, ...(data.goals || [])],
    };
    updateAndPersistData(newData);
  }, [data, updateAndPersistData]);

  const updateGoal = useCallback((goal: Goal) => {
    if (!data) return;
    const updatedGoals = (data.goals || []).map(g => (g.id === goal.id ? { ...goal, updatedAt: new Date().toISOString() } : g));
    const newData = { ...data, goals: updatedGoals };
    updateAndPersistData(newData);
  }, [data, updateAndPersistData]);

  const deleteGoal = useCallback((id: string) => {
    if (!data) return;
    const updatedGoals = (data.goals || []).filter(g => g.id !== id);
    const newData = {...data, goals: updatedGoals};
    updateAndPersistData(newData);
  }, [data, updateAndPersistData]);

  const addContributionToGoal = useCallback((goalId: string, amountMinor: number) => {
    if (!data) return;
    const updatedGoals = (data.goals || []).map(g => {
      if (g.id === goalId) {
        const newCurrentAmount = g.currentAmountMinor + amountMinor;
        return { 
          ...g, 
          currentAmountMinor: Math.min(newCurrentAmount, g.targetAmountMinor),
          updatedAt: new Date().toISOString()
        };
      }
      return g;
    });
    const newData = {...data, goals: updatedGoals};
    updateAndPersistData(newData);
  }, [data, updateAndPersistData]);

  const importData = useCallback((importedData: AppData) => {
    updateAndPersistData(importedData);
  }, [updateAndPersistData]);

  const value = useMemo(() => ({
    isLoggedIn,
    isLoading: isLoggedIn === null || (isLoggedIn && !data),
    login,
    logout,
    user: data?.user ?? initialData.user,
    categories: data?.categories ?? [],
    transactions: data?.transactions ?? [],
    budgets: data?.budgets ?? [],
    goals: data?.goals ?? [],
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getCategoryById,
    upsertCategory,
    getBudgetForCategory,
    upsertBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    addContributionToGoal,
    importData,
  }), [
    isLoggedIn, data, login, logout, addTransaction, updateTransaction,
    deleteTransaction, getCategoryById, upsertCategory, getBudgetForCategory,
    upsertBudget, deleteBudget, addGoal, updateGoal, deleteGoal,
    addContributionToGoal, importData
  ]);

  return React.createElement(StoreContext.Provider, { value }, children);
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

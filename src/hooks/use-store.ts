'use client';

import {
  collection,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import {
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import type {
  Category,
  Transaction,
  Budget,
  Goal,
  AppData,
} from '@/lib/types';
import { useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

export const useStore = () => {
  const firestore = useFirestore();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const userId = user?.uid;

  // Memoized Firestore references
  const categoriesQuery = useMemoFirebase(
    () =>
      userId
        ? query(
            collection(firestore, 'users', userId, 'categories'),
            orderBy('name')
          )
        : null,
    [firestore, userId]
  );

  const transactionsQuery = useMemoFirebase(
    () =>
      userId
        ? query(
            collection(firestore, 'users', userId, 'transactions'),
            orderBy('dateISO', 'desc')
          )
        : null,
    [firestore, userId]
  );

  const budgetsQuery = useMemoFirebase(
    () =>
      userId
        ? collection(firestore, 'users', userId, 'budgets')
        : null,
    [firestore, userId]
  );

  const goalsQuery = useMemoFirebase(
    () =>
      userId
        ? query(
            collection(firestore, 'users', userId, 'savingsGoals'),
            orderBy('createdAt', 'desc')
          )
        : null,
    [firestore, userId]
  );

  // Data hooks
  const { data: categories = [] } = useCollection<Category>(categoriesQuery);
  const { data: transactions = [] } =
    useCollection<Transaction>(transactionsQuery);
  const { data: budgets = [] } = useCollection<Budget>(budgetsQuery);
  const { data: goals = [] } = useCollection<Goal>(goalsQuery);

  const logout = useCallback(async () => {
    await signOut(auth);
    router.push('/');
  }, [auth, router]);

  const addTransaction = useCallback(
    (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
      if (!userId) return;
      const transactionsCol = collection(
        firestore,
        'users',
        userId,
        'transactions'
      );
      addDocumentNonBlocking(transactionsCol, {
        ...tx,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    [firestore, userId]
  );

  const updateTransaction = useCallback(
    (tx: Transaction) => {
      if (!userId) return;
      const txRef = doc(
        firestore,
        'users',
        userId,
        'transactions',
        tx.id
      );
      updateDocumentNonBlocking(txRef, {
        ...tx,
        updatedAt: serverTimestamp(),
      });
    },
    [firestore, userId]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      if (!userId) return;
      const txRef = doc(firestore, 'users', userId, 'transactions', id);
      deleteDocumentNonBlocking(txRef);
    },
    [firestore, userId]
  );

  const getCategoryById = useCallback(
    (id: string) => {
      return categories?.find((c) => c.id === id);
    },
    [categories]
  );

  const upsertCategory = useCallback(
    (cat: Omit<Category, 'id'> | Category) => {
      if (!userId) return;
      const categoriesCol = collection(firestore, 'users', userId, 'categories');
      if ('id' in cat) {
        const catRef = doc(categoriesCol, cat.id);
        updateDocumentNonBlocking(catRef, { ...cat });
      } else {
        addDocumentNonBlocking(categoriesCol, { ...cat, userId });
      }
    },
    [firestore, userId]
  );
  
  const getBudgetForCategory = useCallback(
    (categoryId: string, month: string) => {
      return budgets?.find(
        (b) => b.categoryId === categoryId && b.month === month
      );
    },
    [budgets]
  );

  const upsertBudget = useCallback(
    (budget: Omit<Budget, 'id' | 'userId'>) => {
      if (!userId) return;
      const budgetsCol = collection(firestore, 'users', userId, 'budgets');
      const existing = budgets.find(
        (b) =>
          b.categoryId === budget.categoryId && b.month === budget.month
      );
      if (existing) {
        const budgetRef = doc(budgetsCol, existing.id);
        updateDocumentNonBlocking(budgetRef, {
          amountMinor: budget.amountMinor,
        });
      } else {
        addDocumentNonBlocking(budgetsCol, { ...budget, userId });
      }
    },
    [firestore, userId, budgets]
  );

  const deleteBudget = useCallback(
    (id: string) => {
      if (!userId) return;
      const budgetRef = doc(firestore, 'users', userId, 'budgets', id);
      deleteDocumentNonBlocking(budgetRef);
    },
    [firestore, userId]
  );

  const addGoal = useCallback(
    (
      goal: Omit<
        Goal,
        'id' | 'userId' | 'createdAt' | 'updatedAt' | 'currentAmountMinor'
      >
    ) => {
      if (!userId) return;
      const goalsCol = collection(firestore, 'users', userId, 'savingsGoals');
      addDocumentNonBlocking(goalsCol, {
        ...goal,
        userId,
        currentAmountMinor: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    [firestore, userId]
  );

  const updateGoal = useCallback(
    (goal: Goal) => {
      if (!userId) return;
      const goalRef = doc(firestore, 'users', userId, 'savingsGoals', goal.id);
      updateDocumentNonBlocking(goalRef, {
        ...goal,
        updatedAt: serverTimestamp(),
      });
    },
    [firestore, userId]
  );

  const deleteGoal = useCallback(
    (id: string) => {
      if (!userId) return;
      const goalRef = doc(firestore, 'users', userId, 'savingsGoals', id);
      deleteDocumentNonBlocking(goalRef);
    },
    [firestore, userId]
  );

  const addContributionToGoal = useCallback(
    (goalId: string, amountMinor: number) => {
      if (!userId) return;
      const goal = goals?.find((g) => g.id === goalId);
      if (goal) {
        const goalRef = doc(firestore, 'users', userId, 'savingsGoals', goalId);
        const newCurrentAmount = goal.currentAmountMinor + amountMinor;
        updateDocumentNonBlocking(goalRef, {
          currentAmountMinor: Math.min(
            newCurrentAmount,
            goal.targetAmountMinor
          ),
          updatedAt: serverTimestamp(),
        });
      }
    },
    [firestore, userId, goals]
  );

  // Import functionality is complex with Firestore and needs careful implementation.
  // This is a simplified placeholder.
  const importData = (data: AppData) => {
    console.warn('Data import is not fully implemented for Firestore yet.');
    // In a real app, this would involve batch writes to Firestore.
  };

  return {
    isLoggedIn: !!user,
    isLoading: !user,
    login: () => {}, // Firebase handles login
    logout,
    user,
    categories,
    transactions,
    budgets,
    goals,
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
  };
};

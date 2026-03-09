'use client';

import { useState, useMemo, useEffect } from 'react';
import { PlusCircle, Target } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

import { Button } from '@/components/ui/button';
import { useStore } from '@/hooks/use-store';
import BudgetCard from '@/components/budgets/budget-card';
import BudgetForm from '@/components/budgets/budget-form';
import type { Budget } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default function BudgetsPage() {
  const { budgets, transactions, categories, getCategoryById } = useStore();
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>(
    undefined
  );

  const [dateInfo, setDateInfo] = useState<{
    now: Date;
    currentMonth: string;
    monthStart: Date;
    monthEnd: Date;
  } | null>(null);

  useEffect(() => {
    const now = new Date();
    setDateInfo({
      now,
      currentMonth: format(now, 'yyyy-MM'),
      monthStart: startOfMonth(now),
      monthEnd: endOfMonth(now),
    });
  }, []);

  const monthlyBudgets = useMemo(() => {
    if (!dateInfo) return [];
    return budgets.filter((b) => b.month === dateInfo.currentMonth);
  }, [budgets, dateInfo]);

  const spendingByCategory = useMemo(() => {
    if (!dateInfo) return {};
    const spending: { [categoryId: string]: number } = {};

    transactions.forEach((tx) => {
      const txDate = new Date(tx.dateISO);
      if (
        tx.type === 'expense' &&
        isWithinInterval(txDate, {
          start: dateInfo.monthStart,
          end: dateInfo.monthEnd,
        })
      ) {
        spending[tx.categoryId] =
          (spending[tx.categoryId] || 0) + tx.amountMinor;
      }
    });

    return spending;
  }, [transactions, dateInfo]);

  const totalBudgeted = useMemo(() => {
    return monthlyBudgets.reduce((acc, b) => acc + b.amountMinor, 0);
  }, [monthlyBudgets]);

  const totalSpent = useMemo(() => {
    return Object.values(spendingByCategory).reduce(
      (acc, amount) => acc + amount,
      0
    );
  }, [spendingByCategory]);

  const handleNewBudget = () => {
    setSelectedBudget(undefined);
    setIsBudgetFormOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsBudgetFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Monthly Budgets
          </h1>
          <p className="text-muted-foreground">
            Manage your spending for{' '}
            {dateInfo
              ? format(dateInfo.now, 'MMMM yyyy')
              : 'the current month'}
            .
          </p>
        </div>
        <Button onClick={handleNewBudget}>
          <PlusCircle />
          <span className="hidden md:inline">New Budget</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Month Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground">
              Total Budgeted
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBudgeted)}
            </div>
          </div>
          <div className="flex flex-col rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground">
              Total Spent
            </div>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          </div>
        </CardContent>
      </Card>

      {monthlyBudgets.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {monthlyBudgets.map((budget) => {
            const category = getCategoryById(budget.categoryId);
            const spentAmount = spendingByCategory[budget.categoryId] || 0;
            if (!category) return null;

            return (
              <BudgetCard
                key={budget.id}
                budget={budget}
                category={category}
                spentAmount={spentAmount}
                onEdit={handleEditBudget}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">
            No budgets set for this month
          </h3>
          <p className="mt-2 text-muted-foreground">
            Create a budget to start tracking your spending.
          </p>
          <Button className="mt-6" onClick={handleNewBudget}>
            <PlusCircle />
            Create First Budget
          </Button>
        </div>
      )}

      <BudgetForm
        open={isBudgetFormOpen}
        onOpenChange={setIsBudgetFormOpen}
        budget={selectedBudget}
      />
    </div>
  );
}

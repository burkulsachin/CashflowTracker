'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useStore } from '@/hooks/use-store';
import { formatCurrency } from '@/lib/utils';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  LineChart,
} from 'lucide-react';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase';

export default function DashboardPage() {
  const { transactions, isTransactionsLoading } = useStore();
  const { user } = useUser();

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const relevantTransactions = transactions.filter(
      (tx) => new Date(tx.dateISO) >= startOfMonth
    );

    let totalIncome = 0;
    let totalExpenses = 0;

    relevantTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amountMinor;
      } else {
        totalExpenses += tx.amountMinor;
      }
    });

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
    };
  }, [transactions]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Welcome back, {displayName}!
        </h1>
        <p className="text-muted-foreground">
          Here's a summary of your financial activity for this month.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isTransactionsLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(monthlyStats.totalIncome)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isTransactionsLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(monthlyStats.totalExpenses)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isTransactionsLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div
                className={`text-2xl font-bold ${
                  monthlyStats.netBalance < 0
                    ? 'text-destructive'
                    : 'text-success'
                }`}
              >
                {formatCurrency(monthlyStats.netBalance)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for future charts */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Over Time</CardTitle>
          <CardDescription>
            A chart showing your spending trends will be here soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-60 items-center justify-center rounded-md bg-muted/50">
          <div className="text-center text-muted-foreground">
            <LineChart className="mx-auto mb-2 h-12 w-12" />
            <p>Chart coming soon!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

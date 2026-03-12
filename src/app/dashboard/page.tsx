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
} from 'lucide-react';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase';
import { SpendingChart } from '@/components/spending-chart';
import { subDays, format } from 'date-fns';
import { RecentTransactions } from '@/components/recent-transactions';

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
  
  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i));
    const dailySpending = last30Days.map(day => ({
        date: format(day, 'yyyy-MM-dd'),
        total: 0
    }));

    transactions.forEach(tx => {
        if (tx.type === 'expense') {
            const day = dailySpending.find(d => d.date === tx.dateISO.split('T')[0]);
            if (day) {
                day.total += tx.amountMinor / 100;
            }
        }
    });

    return [
      {
        id: 'spending',
        data: dailySpending.map(d => ({ x: d.date, y: d.total })).reverse(),
      },
    ];
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

      <RecentTransactions />

      <Card>
        <CardHeader>
          <CardTitle>Spending Over Time</CardTitle>
          <CardDescription>
            A chart showing your spending trends over the last 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTransactionsLoading ? (
              <Skeleton className="h-60 w-full" />
            ) : (
              <SpendingChart data={chartData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

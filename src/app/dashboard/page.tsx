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
  Activity,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { transactions, user, generateSummary, budgets } = useStore();
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const [monthlyStats, setMonthlyStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    isLoading: true,
  });

  useEffect(() => {
    // This code now runs only on the client, after hydration, preventing mismatches.
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

    setMonthlyStats({
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      isLoading: false,
    });
  }, [transactions]);

  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    try {
      const now = new Date();
      const startDateISO = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString();
      const endDateISO = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).toISOString();

      const transactionsForSummary = transactions.map((tx) => ({
        ...tx,
        note: tx.note ?? '',
        merchant: tx.merchant ?? '',
      }));

      const summaryText = await generateSummary({
        transactions: transactionsForSummary,
        budgets,
        startDateISO,
        endDateISO,
      });
      setSummary(summaryText);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      setSummary(
        'Sorry, I was unable to generate a financial summary at this time.'
      );
    } finally {
      setIsSummaryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Welcome back, {user.email.split('@')[0]}!
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
            {monthlyStats.isLoading ? (
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
            {monthlyStats.isLoading ? (
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
            {monthlyStats.isLoading ? (
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">AI Financial Summary</CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateSummary}
              disabled={isSummaryLoading || transactions.length === 0}
            >
              {isSummaryLoading ? 'Generating...' : 'Generate Summary'}
            </Button>
          </div>
          <CardDescription>
            Get a quick overview of your financial health for the current month,
            powered by AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSummaryLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : summary ? (
            <p className="text-sm text-foreground/90">{summary}</p>
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              {transactions.length > 0 ? (
                <span>Click "Generate Summary" to get your analysis.</span>
              ) : (
                <span>
                  No transactions this month to summarize. Add some to get
                  started!
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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

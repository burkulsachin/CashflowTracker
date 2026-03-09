'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/hooks/use-store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import {
  eachMonthOfInterval,
  endOfYear,
  format,
  getYear,
  startOfMonth,
  endOfMonth,
  startOfYear,
  isWithinInterval,
  parse,
} from 'date-fns';

const MonthlyCashflowChart = dynamic(() => import('@/components/dashboard/monthly-cashflow-chart'), { ssr: false });
const SpendingBreakdownChart = dynamic(() => import('@/components/reports/spending-breakdown-chart'), { ssr: false });


const generateYearOptions = () => {
  const currentYear = getYear(new Date());
  const years = [];
  for (let i = currentYear - 5; i <= currentYear; i++) {
    years.push(i.toString());
  }
  return years.reverse();
};

export default function ReportsPage() {
  const { transactions } = useStore();
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()).toString());
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const yearOptions = useMemo(() => generateYearOptions(), []);
  const monthOptions = useMemo(() => {
    const yearDate = new Date(parseInt(selectedYear), 0, 1);
    return eachMonthOfInterval({
      start: startOfYear(yearDate),
      end: endOfYear(yearDate),
    }).map((month) => ({
      value: format(month, 'yyyy-MM'),
      label: format(month, 'MMMM yyyy'),
    }));
  }, [selectedYear]);

  const filteredTransactions = useMemo(() => {
    const yearStart = startOfYear(new Date(parseInt(selectedYear), 0, 1));
    const yearEnd = endOfYear(yearStart);
    return transactions.filter((tx) =>
      isWithinInterval(new Date(tx.dateISO), { start: yearStart, end: yearEnd })
    );
  }, [transactions, selectedYear]);

  const monthlyChartData = useMemo(() => {
    const yearDate = new Date(parseInt(selectedYear), 0, 1);
    const months = eachMonthOfInterval({ start: startOfYear(yearDate), end: endOfYear(yearDate) });
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      let totalIncome = 0;
      let totalExpenses = 0;

      filteredTransactions.forEach(tx => {
        if (isWithinInterval(new Date(tx.dateISO), { start: monthStart, end: monthEnd })) {
          if (tx.type === 'income') {
            totalIncome += tx.amountMinor;
          } else {
            totalExpenses += tx.amountMinor;
          }
        }
      });
      
      return {
        month: format(month, 'yyyy-MM-dd'), // Needs to be a valid date string
        totalIncome,
        totalExpenses
      };
    });
  }, [filteredTransactions, selectedYear]);
  
  const monthlyReportData = useMemo(() => {
    const monthDate = parse(selectedMonth, 'yyyy-MM', new Date());
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    let totalIncome = 0;
    let totalExpenses = 0;
    const spendingByCategory: { [name: string]: number } = {};

    transactions.forEach(tx => {
       if (isWithinInterval(new Date(tx.dateISO), { start: monthStart, end: monthEnd })) {
         if (tx.type === 'income') {
           totalIncome += tx.amountMinor;
         } else {
           totalExpenses += tx.amountMinor;
           const categoryName = tx.category || 'Uncategorized';
           spendingByCategory[categoryName] = (spendingByCategory[categoryName] || 0) + tx.amountMinor;
         }
       }
    });

    const categoryChartData = Object.entries(spendingByCategory).map(([name, value]) => ({
      name,
      value
    })).sort((a,b) => b.value - a.value);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      categoryChartData
    }

  }, [transactions, selectedMonth]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Financial Reports
          </h1>
          <p className="text-muted-foreground">
            Analyze your income and spending patterns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full md:w-[240px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(monthlyReportData.totalIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(monthlyReportData.totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${monthlyReportData.netBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(monthlyReportData.netBalance)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SpendingBreakdownChart data={monthlyReportData.categoryChartData} />
        <MonthlyCashflowChart data={monthlyChartData} />
      </div>

    </div>
  );
}

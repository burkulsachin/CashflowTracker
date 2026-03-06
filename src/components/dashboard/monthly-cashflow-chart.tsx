'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

type MonthlyData = {
  month: string;
  totalIncome: number;
  totalExpenses: number;
};

type MonthlyCashflowChartProps = {
  data: MonthlyData[];
};

export default function MonthlyCashflowChart({ data }: MonthlyCashflowChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Cash Flow</CardTitle>
        <CardDescription>An overview of your income and expenses for each month.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={(str) => format(parseISO(str), 'MMM yyyy')}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tickFormatter={(num) => formatCurrency(num, true)} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => format(parseISO(label), 'MMMM yyyy')}
            />
            <Legend />
            <Bar dataKey="totalIncome" name="Income" fill="hsl(var(--primary))" />
            <Bar dataKey="totalExpenses" name="Expenses" fill="hsl(var(--destructive))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

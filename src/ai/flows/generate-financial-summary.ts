'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a natural language summary
 * of a user's financial habits and health for a selected period. It processes transaction
 * and budget data to highlight trends, significant expenses, and areas for improvement.
 *
 * - generateFinancialSummary - The main function to call the financial summary generation flow.
 * - FinancialSummaryInput - The input type for the generateFinancialSummary function.
 * - FinancialSummaryOutput - The return type for the generateFinancialSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FinancialSummaryInputSchema = z.object({
  transactions: z.array(z.object({
    type: z.enum(['income', 'expense']).describe('Type of transaction: income or expense.').default('expense'),
    category: z.string().describe('Category of the transaction.').default('Uncategorized'),
    amountMinor: z.number().int().nonnegative().describe('Amount of the transaction in minor units (e.g., cents/paise).').default(0),
    dateISO: z.string().datetime().describe('ISO date string of the transaction.').default(new Date().toISOString()),
    note: z.string().optional().describe('Optional note for the transaction.').default(''),
    merchant: z.string().optional().describe('Optional merchant for the transaction.').default(''),
  })).describe('A list of financial transactions for the period.'),
  startDateISO: z.string().datetime().describe('Start date of the financial period in ISO format.'),
  endDateISO: z.string().datetime().describe('End date of the financial period in ISO format.'),
  budgets: z.array(z.object({
    category: z.string().describe('Category for the budget.').default('Uncategorized'),
    amountMinor: z.number().int().nonnegative().describe('Budgeted amount in minor units.').default(0),
  })).optional().describe('Optional list of monthly budgets per category.'),
});
export type FinancialSummaryInput = z.infer<typeof FinancialSummaryInputSchema>;

const FinancialSummaryOutputSchema = z.object({
  summary: z.string().describe('A natural language summary of the financial situation.'),
});
export type FinancialSummaryOutput = z.infer<typeof FinancialSummaryOutputSchema>;

export async function generateFinancialSummary(input: FinancialSummaryInput): Promise<FinancialSummaryOutput> {
  return financialSummaryFlow(input);
}

// Internal schema for processed data passed to the prompt
const ProcessedFinancialDataSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  totalIncomeMinor: z.number().int().nonnegative(),
  totalExpensesMinor: z.number().int().nonnegative(),
  netBalanceMinor: z.number().int(),
  expenseByCategory: z.array(z.object({
    category: z.string(),
    amountMinor: z.number().int().nonnegative(),
  })),
  incomeByCategory: z.array(z.object({
    category: z.string(),
    amountMinor: z.number().int().nonnegative(),
  })),
  budgetVsActual: z.array(z.object({
    category: z.string(),
    budgetedMinor: z.number().int().nonnegative(),
    spentMinor: z.number().int().nonnegative(),
    differenceMinor: z.number().int(), // spent - budgeted
    isOverBudget: z.boolean(),
  })).optional(),
});

const financialSummaryPrompt = ai.definePrompt({
  name: 'financialSummaryPrompt',
  input: { schema: ProcessedFinancialDataSchema },
  output: { schema: FinancialSummaryOutputSchema },
  prompt: `You are a helpful and insightful financial analyst. Your task is to provide a natural language summary of a user's financial habits and health for the period between {{startDate}} and {{endDate}}.

Analyze the provided financial data and highlight:
- Overall financial performance (net balance).
- Key trends in income and expenses.
- Significant expenses or spending categories.
- Areas where the user is performing well financially.
- Areas for potential improvement or concern.
- If budget data is provided, comment on adherence to budgets.

Consider amounts to be in minor units (e.g., cents or paise) and adjust language accordingly.

Financial Data:
Period: {{startDate}} to {{endDate}}
Total Income: {{totalIncomeMinor}}
Total Expenses: {{totalExpensesMinor}}
Net Balance (Income - Expenses): {{netBalanceMinor}}

Top Expenses by Category:
{{#if expenseByCategory}}
{{#each expenseByCategory}}
- {{category}}: {{amountMinor}}
{{/each}}
{{else}}
No significant expenses.
{{/if}}

Income by Category:
{{#if incomeByCategory}}
{{#each incomeByCategory}}
- {{category}}: {{amountMinor}}
{{/each}}
{{else}}
No income recorded.
{{/if}}

{{#if budgetVsActual}}
Budget Performance:
{{#each budgetVsActual}}
- {{category}}: Budgeted {{budgetedMinor}}, Spent {{spentMinor}}. {{#if isOverBudget}}OVER BUDGET by {{differenceMinor}}!{{else}}Under/Within Budget by {{differenceMinor}}.{{/if}}
{{/each}}
{{/if}}

Provide a concise and informative summary in a friendly yet professional tone. Focus on actionable insights where possible.`,
});

const financialSummaryFlow = ai.defineFlow(
  {
    name: 'financialSummaryFlow',
    inputSchema: FinancialSummaryInputSchema,
    outputSchema: FinancialSummaryOutputSchema,
  },
  async (input) => {
    let totalIncomeMinor = 0;
    let totalExpensesMinor = 0;
    const expenseByCategory: { [key: string]: number } = {};
    const incomeByCategory: { [key: string]: number } = {};

    input.transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncomeMinor += transaction.amountMinor;
        incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + transaction.amountMinor;
      } else {
        totalExpensesMinor += transaction.amountMinor;
        expenseByCategory[transaction.category] = (expenseByCategory[transaction.category] || 0) + transaction.amountMinor;
      }
    });

    const netBalanceMinor = totalIncomeMinor - totalExpensesMinor;

    const sortedExpenseCategories = Object.entries(expenseByCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amountMinor]) => ({ category, amountMinor }));

    const sortedIncomeCategories = Object.entries(incomeByCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amountMinor]) => ({ category, amountMinor }));

    let budgetVsActual: Array<{ category: string; budgetedMinor: number; spentMinor: number; differenceMinor: number; isOverBudget: boolean }> | undefined;

    if (input.budgets && input.budgets.length > 0) {
      budgetVsActual = [];
      const spentByCategoryMap: { [key: string]: number } = {};
      input.transactions.filter(t => t.type === 'expense').forEach(t => {
        spentByCategoryMap[t.category] = (spentByCategoryMap[t.category] || 0) + t.amountMinor;
      });

      input.budgets.forEach(budget => {
        const spentMinor = spentByCategoryMap[budget.category] || 0;
        const differenceMinor = spentMinor - budget.amountMinor;
        budgetVsActual!.push({
          category: budget.category,
          budgetedMinor: budget.amountMinor,
          spentMinor: spentMinor,
          differenceMinor: differenceMinor,
          isOverBudget: differenceMinor > 0,
        });
      });
    }

    const processedData = {
      startDate: input.startDateISO.split('T')[0], // Extract date part
      endDate: input.endDateISO.split('T')[0],     // Extract date part
      totalIncomeMinor,
      totalExpensesMinor,
      netBalanceMinor,
      expenseByCategory: sortedExpenseCategories,
      incomeByCategory: sortedIncomeCategories,
      budgetVsActual,
    };

    const { output } = await financialSummaryPrompt(processedData);
    return output!;
  }
);

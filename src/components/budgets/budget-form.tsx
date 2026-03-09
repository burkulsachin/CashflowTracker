
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/hooks/use-store';
import type { Budget } from '@/lib/types';
import { format } from 'date-fns';

const budgetSchema = z.object({
  categoryId: z.string().min(1, { message: 'Please select a category.' }),
  amount: z.coerce.number().positive({ message: 'Budget amount must be positive.' }),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

type BudgetFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget;
};

export default function BudgetForm({ open, onOpenChange, budget }: BudgetFormProps) {
  const { categories, upsertBudget, budgets } = useStore();
  
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: '',
      amount: undefined,
    },
  });

  const currentMonth = format(new Date(), 'yyyy-MM');

  const availableCategories = categories.filter(c => {
    if (c.kind !== 'expense' || c.isArchived) return false;
    // If editing, the current budget's category is always available
    if (budget && budget.categoryId === c.id) return true;
    // Otherwise, only show categories not already budgeted for this month
    return !budgets.some(b => b.categoryId === c.id && b.month === currentMonth);
  });
  
  useEffect(() => {
    if (budget && open) {
      form.reset({
        categoryId: budget.categoryId,
        amount: budget.amountMinor / 100,
      });
    } else if (!open) {
      form.reset({
        categoryId: '',
        amount: undefined,
      });
    }
  }, [budget, open, form]);

  const onSubmit = (values: BudgetFormValues) => {
    const budgetData = {
      categoryId: values.categoryId,
      amountMinor: Math.round(values.amount * 100),
      month: currentMonth,
    };
    
    upsertBudget(budgetData);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{budget ? 'Edit Budget' : 'Create New Budget'}</SheetTitle>
          <SheetDescription>
            {budget ? 'Update your monthly budget for this category.' : `Set a new budget for ${format(new Date(), 'MMMM yyyy')}.`}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex h-[calc(100%-80px)] flex-col">
            <div className="space-y-4 pr-6 overflow-y-auto flex-1">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!!budget}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an expense category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCategories.length > 0 ? availableCategories.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        )) : (
                          <div className="p-4 text-sm text-muted-foreground">No available categories.</div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                        <Input type="number" step="0.01" placeholder="500.00" className="pl-7" {...field} value={field.value ?? ''} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter className="pt-4 mt-auto">
              <SheetClose asChild>
                 <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                {budget ? 'Save Changes' : 'Create Budget'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

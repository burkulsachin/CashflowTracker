
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useStore } from '@/hooks/use-store';
import type { Goal } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useEffect } from 'react';

const contributionSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
});

type ContributionFormValues = z.infer<typeof contributionSchema>;

type AddContributionFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
};

export default function AddContributionForm({ open, onOpenChange, goal }: AddContributionFormProps) {
  const { addContributionToGoal } = useStore();
  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amount: undefined,
    },
  });

  useEffect(() => {
    if(!open) {
      form.reset();
    }
  }, [open, form]);

  const remainingAmountMinor = goal.targetAmountMinor - goal.currentAmountMinor;
  
  const onSubmit = (values: ContributionFormValues) => {
    const amountMinor = Math.round(values.amount * 100);
    addContributionToGoal(goal.id, amountMinor);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Funds to "{goal.name}"</DialogTitle>
          <DialogDescription>
            You have {formatCurrency(remainingAmountMinor)} left to save.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount to Add</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                      <Input type="number" step="0.01" placeholder="50.00" className="pl-7" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                Add Funds
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

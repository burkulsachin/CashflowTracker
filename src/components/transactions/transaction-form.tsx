'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useStore } from '@/hooks/use-store';
import type { Transaction, Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import { suggestTransactionCategory } from '@/ai/flows/suggest-transaction-category';
import { useToast } from '@/hooks/use-toast';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], { required_error: 'Please select a transaction type.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  dateISO: z.date({ required_error: 'Please select a date.' }),
  categoryId: z.string().min(1, { message: 'Please select a category.' }),
  note: z.string().min(2, {message: 'Please enter a description.'}),
  merchant: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

type TransactionFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
};

export default function TransactionForm({ open, onOpenChange, transaction }: TransactionFormProps) {
  const { categories, addTransaction, updateTransaction } = useStore();
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: undefined,
      dateISO: new Date(),
      categoryId: '',
      note: '',
      merchant: '',
    },
  });

  const transactionType = form.watch('type');
  const transactionDescription = form.watch('note');

  const availableCategories = categories.filter(c => c.kind === transactionType && !c.isArchived);

  useEffect(() => {
    if (transaction && open) {
      form.reset({
        type: transaction.type,
        amount: transaction.amountMinor / 100,
        dateISO: new Date(transaction.dateISO),
        categoryId: transaction.categoryId,
        note: transaction.note || '',
        merchant: transaction.merchant || '',
      });
    } else if (!open) {
      form.reset({
        type: 'expense',
        amount: undefined,
        dateISO: new Date(),
        categoryId: '',
        note: '',
        merchant: '',
      });
    }
  }, [transaction, open, form]);
  
  // Reset category if type changes
  useEffect(() => {
    form.setValue('categoryId', '');
  }, [transactionType, form]);

  const handleSuggestCategory = async () => {
    if (!transactionDescription) {
        toast({ title: 'Please enter a description first.', variant: 'destructive' });
        return;
    }
    setIsSuggesting(true);
    try {
        const result = await suggestTransactionCategory({
            description: transactionDescription,
            categories: availableCategories,
            type: transactionType,
        });
        if (result.categoryId) {
            form.setValue('categoryId', result.categoryId, { shouldValidate: true });
            toast({ title: "AI Suggestion", description: `We've suggested a category based on your description.` });
        } else {
            toast({ title: 'No suggestion found', description: "We couldn't find a suitable category.", variant: 'destructive' });
        }
    } catch (error) {
        console.error("Error suggesting category:", error);
        toast({ title: 'AI Suggestion Failed', description: 'There was an error while getting a suggestion.', variant: 'destructive' });
    } finally {
        setIsSuggesting(false);
    }
  };


  const onSubmit = (values: TransactionFormValues) => {
    const category = categories.find(c => c.id === values.categoryId);
    if (!category) return;

    const transactionData = {
      ...values,
      amountMinor: Math.round(values.amount * 100),
      dateISO: values.dateISO.toISOString(),
      category: category.name,
    };

    if (transaction) {
      updateTransaction({ ...transaction, ...transactionData });
    } else {
      addTransaction(transactionData);
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{transaction ? 'Edit Transaction' : 'Add New Transaction'}</SheetTitle>
          <SheetDescription>
            {transaction ? 'Update the details of your transaction.' : 'Enter the details of your new income or expense.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex h-[calc(100%-80px)] flex-col">
            <div className="space-y-4 pr-6 overflow-y-auto flex-1">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="expense" />
                          </FormControl>
                          <FormLabel className="font-normal">Expense</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="income" />
                          </FormControl>
                          <FormLabel className="font-normal">Income</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Coffee with a friend" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                        <FormLabel>Category</FormLabel>
                        <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={handleSuggestCategory}
                            disabled={isSuggesting}
                        >
                            {isSuggesting ? (
                                <Loader2 className="mr-2 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2" />
                            )}
                            AI Suggest
                        </Button>
                    </div>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCategories.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
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
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                        <Input type="number" step="0.01" placeholder="25.00" className="pl-7" {...field} value={field.value ?? ''} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateISO"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="merchant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Merchant (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Starbucks" {...field} value={field.value ?? ''} />
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
                {transaction ? 'Save Changes' : 'Create Transaction'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

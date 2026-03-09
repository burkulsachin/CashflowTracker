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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useStore } from '@/hooks/use-store';
import type { Category } from '@/lib/types';

const categorySchema = z.object({
  name: z.string().min(2, { message: 'Category name must be at least 2 characters.' }),
  kind: z.enum(['income', 'expense'], { required_error: 'Please select a type.' }),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

type CategoryFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
};

export default function CategoryForm({ open, onOpenChange, category }: CategoryFormProps) {
  const { authUser, upsertCategory } = useStore();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      kind: 'expense',
    },
  });

  useEffect(() => {
    if (category && open) {
      form.reset({
        name: category.name,
        kind: category.kind,
      });
    } else if (!open) {
      form.reset({
        name: '',
        kind: 'expense',
      });
    }
  }, [category, open, form]);

  const onSubmit = (values: CategoryFormValues) => {
    if (category) {
      upsertCategory({ ...category, ...values });
    } else {
      upsertCategory({ ...values, userId: authUser!.uid, isArchived: false });
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{category ? 'Edit Category' : 'Create New Category'}</SheetTitle>
          <SheetDescription>
            {category ? 'Update the details of your category.' : 'Add a new category to track your finances.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex h-[calc(100%-80px)] flex-col">
            <div className="space-y-4 pr-6 overflow-y-auto flex-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Groceries" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-4"
                        disabled={!!category}
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
            </div>
            <SheetFooter className="pt-4 mt-auto">
              <SheetClose asChild>
                 <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                {category ? 'Save Changes' : 'Create Category'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

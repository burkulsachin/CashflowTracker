'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useStore } from '@/hooks/use-store';
import type { Goal } from '@/lib/types';
import { goalIcons, GoalIconName } from '@/lib/goal-icons';

const goalSchema = z.object({
  name: z.string().min(2, { message: 'Goal name must be at least 2 characters.' }),
  targetAmount: z.coerce.number().positive({ message: 'Target amount must be positive.' }),
  targetDate: z.date().optional(),
  icon: z.custom<GoalIconName>((val) => typeof val === 'string' && val in goalIcons, {
    message: 'Please select a valid icon.',
  }),
});

type GoalFormValues = z.infer<typeof goalSchema>;

type GoalFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal;
};

export default function GoalForm({ open, onOpenChange, goal }: GoalFormProps) {
  const { addGoal, updateGoal } = useStore();
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      targetAmount: undefined,
      targetDate: undefined,
      icon: 'gift',
    },
  });

  useEffect(() => {
    if (goal && open) {
      form.reset({
        name: goal.name,
        targetAmount: goal.targetAmountMinor / 100,
        targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
        icon: goal.icon,
      });
    } else if (!open) {
      form.reset({
        name: '',
        targetAmount: undefined,
        targetDate: undefined,
        icon: 'gift',
      });
    }
  }, [goal, open, form]);

  const onSubmit = (values: GoalFormValues) => {
    const formPayload = {
      name: values.name,
      targetAmountMinor: Math.round(values.targetAmount * 100),
      icon: values.icon,
      // This will be a string if a date is present, or `undefined` if not.
      targetDate: values.targetDate?.toISOString(),
    };

    if (goal) {
      updateGoal({
        id: goal.id,
        ...formPayload,
      });
    } else {
      // For creation, we must not have undefined fields.
      // So we create a new object without targetDate if it's undefined.
      const { targetDate, ...rest } = formPayload;
      const createPayload: any = { ...rest };
      if (targetDate) {
        createPayload.targetDate = targetDate;
      }
      addGoal(createPayload);
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{goal ? 'Edit Goal' : 'Create New Goal'}</SheetTitle>
          <SheetDescription>
            {goal ? 'Update the details of your savings goal.' : 'Set up a new goal to start saving for.'}
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
                    <FormLabel>Goal Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New Car" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                        <Input type="number" step="0.01" placeholder="1000.00" className="pl-7" {...field} value={field.value ?? ''} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(goalIcons).map(([key, { icon: Icon, label }]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{label}</span>
                            </div>
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
                name="targetDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Target Date (Optional)</FormLabel>
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
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                {goal ? 'Save Changes' : 'Create Goal'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

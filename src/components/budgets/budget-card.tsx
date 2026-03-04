'use client';

import { useState } from 'react';
import { MoreHorizontal, Trash2, Edit, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

import type { Budget, Category } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useStore } from '@/hooks/use-store';
import { cn } from '@/lib/utils';

type BudgetCardProps = {
  budget: Budget;
  category: Category;
  spentAmount: number;
  onEdit: (budget: Budget) => void;
};

export default function BudgetCard({ budget, category, spentAmount, onEdit }: BudgetCardProps) {
  const { deleteBudget } = useStore();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const progress = budget.amountMinor > 0 ? (spentAmount / budget.amountMinor) * 100 : 0;
  const isOverBudget = spentAmount > budget.amountMinor;
  const remainingAmount = budget.amountMinor - spentAmount;

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(budget)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteAlertOpen(true)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>
            Budget: {formatCurrency(budget.amountMinor)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <Progress value={Math.min(progress, 100)} className={cn(isOverBudget && '[&>div]:bg-destructive')} />
          <div className="flex justify-between text-sm">
            <p className='font-medium'>
                Spent: <span className='font-normal'>{formatCurrency(spentAmount)}</span>
            </p>
            <p className={cn('font-medium', isOverBudget && 'text-destructive')}>
              {isOverBudget ? "Over by " : "Remaining: "}
              <span className='font-normal'>{formatCurrency(Math.abs(remainingAmount))}</span>
            </p>
          </div>
        </CardContent>
        <CardFooter className='text-sm text-muted-foreground'>
            {isOverBudget ? (
                <div className='flex items-center gap-2'>
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span>You've exceeded your budget.</span>
                </div>
            ) : (
                <div className='flex items-center gap-2'>
                    { progress > 75 ? <TrendingDown className='h-4 w-4' /> : <TrendingUp className='h-4 w-4 text-success' /> }
                    <span>{progress.toFixed(0)}% of budget used.</span>
                </div>
            )}
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the budget for "{category.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBudget(budget.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

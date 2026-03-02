
'use client';

import { useState } from 'react';
import { MoreHorizontal, Trash2, Edit, Coins } from 'lucide-react';
import { differenceInDays, formatDistanceToNow, parseISO } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

import type { Goal } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { goalIcons } from '@/lib/goal-icons';
import { useStore } from '@/hooks/use-store';
import AddContributionForm from './add-contribution-form';

type GoalCardProps = {
  goal: Goal;
  onEdit: (goal: Goal) => void;
};

export default function GoalCard({ goal, onEdit }: GoalCardProps) {
  const { deleteGoal } = useStore();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isContributionFormOpen, setIsContributionFormOpen] = useState(false);

  const Icon = goalIcons[goal.icon]?.icon || goalIcons.gift.icon;
  const progress = goal.targetAmountMinor > 0 ? (goal.currentAmountMinor / goal.targetAmountMinor) * 100 : 0;

  const renderTimeLeft = () => {
    if (!goal.targetDate) return null;
    const daysLeft = differenceInDays(parseISO(goal.targetDate), new Date());
    if (daysLeft < 0) {
      return <span className="text-destructive">Overdue</span>;
    }
    return <span>{formatDistanceToNow(parseISO(goal.targetDate), { addSuffix: true })} left</span>;
  };

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">{goal.name}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(goal)}>
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
          <CardDescription className="pt-2">{`Target: ${formatCurrency(goal.targetAmountMinor)}`}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <Progress value={progress} />
          <div>
            <p className="text-sm font-medium text-foreground">
              {`${formatCurrency(goal.currentAmountMinor)} `}
              <span className="text-muted-foreground">saved ({progress.toFixed(0)}%)</span>
            </p>
            {goal.targetDate && (
              <p className="mt-1 text-xs text-muted-foreground">
                {renderTimeLeft()}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => setIsContributionFormOpen(true)}>
            <Coins />
            Add Funds
          </Button>
        </CardFooter>
      </Card>

      <AddContributionForm 
        goal={goal}
        open={isContributionFormOpen}
        onOpenChange={setIsContributionFormOpen}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{goal.name}" goal. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteGoal(goal.id)}
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

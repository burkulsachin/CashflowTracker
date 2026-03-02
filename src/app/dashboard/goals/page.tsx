
'use client';

import { useState } from 'react';
import { PlusCircle, Target } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useStore } from '@/hooks/use-store';
import GoalCard from '@/components/goals/goal-card';
import GoalForm from '@/components/goals/goal-form';
import type { Goal } from '@/lib/types';

export default function GoalsPage() {
  const { goals } = useStore();
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined);

  const handleNewGoal = () => {
    setSelectedGoal(undefined);
    setIsGoalFormOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsGoalFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Savings Goals
          </h1>
          <p className="text-muted-foreground">
            Track your progress towards your financial goals.
          </p>
        </div>
        <Button onClick={handleNewGoal}>
          <PlusCircle />
          <span className="hidden md:inline">New Goal</span>
        </Button>
      </div>

      {goals.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onEdit={handleEditGoal} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">No goals yet</h3>
          <p className="mt-2 text-muted-foreground">
            Create a savings goal to start tracking your progress.
          </p>
          <Button className="mt-6" onClick={handleNewGoal}>
            <PlusCircle />
            Create First Goal
          </Button>
        </div>
      )}

      <GoalForm
        open={isGoalFormOpen}
        onOpenChange={setIsGoalFormOpen}
        goal={selectedGoal}
      />
    </div>
  );
}

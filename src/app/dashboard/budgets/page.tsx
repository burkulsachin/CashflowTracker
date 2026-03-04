'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function BudgetsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <Card className="w-full max-w-lg">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                    <Target className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Budgets</CardTitle>
                <CardDescription>This page is under construction.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Soon you'll be able to set and track monthly budgets for different spending categories to help you stay on track with your financial goals.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}

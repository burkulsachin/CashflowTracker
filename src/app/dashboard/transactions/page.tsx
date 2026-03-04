'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from "lucide-react";

export default function TransactionsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <Card className="w-full max-w-lg">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                    <List className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>This page is under construction.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    A full-featured transaction management page is coming soon! You'll be able to view, edit, and categorize all your financial activities here.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}

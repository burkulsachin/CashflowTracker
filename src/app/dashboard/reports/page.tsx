'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <Card className="w-full max-w-lg">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                    <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Reports</CardTitle>
                <CardDescription>This page is under construction.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Detailed financial reports and visualizations are coming soon to give you deeper insights into your spending and income patterns.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}

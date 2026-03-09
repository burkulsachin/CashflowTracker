'use client';

import { CategoryManager } from "@/components/settings/category-manager";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account categories.
        </p>
      </div>
      <CategoryManager />
    </div>
  );
}

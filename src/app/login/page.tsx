'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Landmark, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { LoginForm } from '@/components/auth/login-form';
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <Landmark className="h-12 w-12 text-primary" />
        <Loader2 className="animate-spin" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="relative flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-600 to-blue-500 text-white gradient-glow">
        <div className="text-center">
          <Landmark className="h-24 w-24 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Welcome to CashFlow Tracker</h1>
          <p className="text-lg">Your modern personal finance dashboard.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

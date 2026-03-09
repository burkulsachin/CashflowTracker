'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Landmark, Loader2 } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = () => {
    initiateAnonymousSignIn(auth);
  };

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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-primary p-4 text-primary-foreground">
            <Landmark className="h-12 w-12" />
          </div>
        </div>
        <h1 className="mb-2 text-4xl font-bold">CashFlow Tracker</h1>
        <p className="mb-8 text-muted-foreground">
          Your personal finance dashboard.
        </p>
        <button
          onClick={handleSignIn}
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Get Started
        </button>
        <p className="mt-4 text-xs text-muted-foreground">
          (Using anonymous sign-in for this demo)
        </p>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Landmark, Loader2 } from 'lucide-react';
import { signInAnonymously } from 'firebase/auth';
import { useFirebase, useUser } from '@/firebase/provider';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAnonymously(auth);
      router.replace('/dashboard');
    } catch (err: any) {
      console.error('Anonymous sign-in failed', err);
      setError(`Failed to sign in: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="relative flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-600 to-blue-500 text-white">
        <div className="text-center">
          <Landmark className="h-24 w-24 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Welcome to CashFlow Tracker</h1>
          <p className="text-lg">Your modern personal finance dashboard.</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold mb-4">Get Started</h2>
          <p className="text-muted-foreground mb-8">
            Sign in anonymously to start tracking your finances. No account needed.
          </p>
          <Button
            onClick={handleAnonymousSignIn}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-lg"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Sign In Anonymously'
            )}
          </Button>
          {error && (
            <p className="text-sm text-red-400 mt-4 text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

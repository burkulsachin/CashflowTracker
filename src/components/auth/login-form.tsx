'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { Loader2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const auth = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    setLoginError(null);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (error: any) {
      setLoginError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setRegisterError(null);
    try {
      await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
    } catch (error: any) {
      setRegisterError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
            <Card className="glassmorphism-card border-0 text-white">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription className="text-gray-300">
                        Welcome back.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                    </div>
                    {loginError && <p className="text-sm text-red-400">{loginError}</p>}
                    <Button onClick={handleLogin} disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="register">
            <Card className="glassmorphism-card border-0 text-white">
                <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription className="text-gray-300">
                        Join us and take control of your finances.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                            id="register-email"
                            type="email"
                            placeholder="you@example.com"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                            id="register-password"
                            type="password"
                            placeholder="•••••••• (at least 6 characters)"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                    </div>
                    {registerError && <p className="text-sm text-red-400">{registerError}</p>}
                    <Button onClick={handleRegister} disabled={loading} className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Register
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );
}

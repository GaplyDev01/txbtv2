'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartBarIcon, LineChart, TrendingUp, BarChart3 } from 'lucide-react';
import { signIn, signUp } from '@/lib/auth';
import { accessLevelInfo } from '@/lib/auth';

export function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedJump, setSelectedJump] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJump) {
      setError('Please select where you want to jump to');
      return;
    }
    
    setLoading(true);
    setError(null);

    const { user, error } = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      setError(error);
    } else if (user) {
      router.push(`/dashboard/${selectedJump}`);
    }
    setLoading(false);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ChartBarIcon': return <ChartBarIcon className="w-6 h-6" />;
      case 'BarChart3': return <BarChart3 className="w-6 h-6" />;
      case 'LineChart': return <LineChart className="w-6 h-6" />;
      case 'TrendingUp': return <TrendingUp className="w-6 h-6" />;
      default: return <LineChart className="w-6 h-6" />;
    }
  };

  return (
    <Card className="w-[800px] bg-[#1C2620]/40 backdrop-blur-md border-[#36C58C] text-white">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 flex items-center">
            <Image src="/logo.svg" alt="TradesXBT Logo" width={48} height={48} />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold">Welcome to TradesXBT</CardTitle>
        <CardDescription className="text-gray-400">
          {isSignUp ? 'Create an account to access the platform' : 'Sign in to continue your journey'}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleAuth}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#1C2620]/60 border-[#36C58C]/50 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#1C2620]/60 border-[#36C58C]/50 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-gray-300">Where do you want to jump?</Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(accessLevelInfo).map(([id, item]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedJump(id)}
                    className={`p-3 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2
                      ${selectedJump === id 
                        ? 'border-[#36C58C] bg-[#36C58C]/10' 
                        : 'border-[#36C58C]/30 hover:border-[#36C58C]/60 bg-[#1C2620]/60'}`}
                  >
                    <div className={`${item.color}`}>
                      {getIcon(item.icon)}
                    </div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1C2620] border border-[#36C58C] hover:bg-[#243830] text-[#36C58C]"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up & Jump' : 'Sign In & Jump'}
          </Button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-gray-400 hover:text-[#36C58C] transition-colors"
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : 'Need an account? Sign up'}
          </button>
        </CardFooter>
      </form>
    </Card>
  );
}
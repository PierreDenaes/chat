'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export function LoginForm() {
  const { login, isLoading, startSignup } = useAppStore();
  const [email, setEmail] = useState('demo@dynprot.com');
  const [password, setPassword] = useState('demo123');

  console.log('LoginForm render:', { email, isLoading });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      toast.error('Invalid credentials. Try demo@dynprot.com with password: demo123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* App Logo/Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Dumbbell className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
          >
            DynProtMobile
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600"
          >
            Track your protein intake with AI precision
          </motion.p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2">Demo Credentials</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">Email:</span> demo@dynprot.com</p>
                <p><span className="font-medium">Password:</span> demo123</p>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Use these credentials to explore the app's features.
              </p>
            </div>

            {/* Features Preview */}
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-health-text">What you can do:</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">🤖</span>
                  <span>AI Protein Estimation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-pink-600">📸</span>
                  <span>Photo Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">📊</span>
                  <span>Progress Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-pink-600">🎯</span>
                  <span>Goal Management</span>
                </div>
              </div>
            </div>

            {/* Sign up link */}
            <div className="text-center pt-4 border-t mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={startSignup}
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  Sign up now
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* PWA Install Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-sm text-gray-500"
        >
          <p>💡 This app can be installed on your device for a native experience!</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
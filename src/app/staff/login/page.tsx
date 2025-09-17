'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function StaffLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/staff/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Redirect based on role
      const { role } = data.user;
      const dashboardPath = `/${role.toLowerCase()}/dashboard`;
      router.push(dashboardPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Back to Home Navigation */}
          <div className="flex justify-start">
            <Link
              href="/"
              className="text-stone-600 hover:text-stone-700 font-medium flex items-center gap-2 text-sm"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <Image src="/lalisure-footer.svg" alt="Lalisure" width={128} height={128} />
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-600">Welcome back! Please enter your details.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                className="h-12"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                  }
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  Remember for 30 days
                </Label>
              </div>
              <Link 
                href="/staff/forgot-password" 
                className="text-sm text-stone-600 hover:text-stone-700 font-medium"
              >
                Forgot password
              </Link>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-stone-700 hover:bg-stone-800 text-white font-medium"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-gray-300"
              disabled
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285f4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34a853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#fbbc05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#ea4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/staff/register" className="text-stone-600 hover:text-stone-700 font-medium">
              Sign up
            </Link>
          </p>

          {/* Copyright */}
          <p className="text-xs text-gray-500">© Lalisure 2024</p>
        </div>
      </div>

      {/* Right Side - Testimonial */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gray-100">
        <div className="relative w-full h-full">
          {/* Background Image */}
          <Image
            src="/Sarah-Ann-Van-Der-Merwe.jpg"
            alt="Professional insurance team"
            fill
            className="object-cover"
            priority
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
            <blockquote className="text-2xl font-medium leading-relaxed mb-8">
              "Lalisure's platform has transformed how we manage our insurance operations. 
              The efficiency gains are remarkable."
            </blockquote>
            
            <div>
              
              <div className="font-semibold text-lg">Sarah van der Merwe</div>
              <div className="text-white/80">Senior Underwriter, Metropolitan Insurance</div>
            </div>
            
            {/* Navigation */}
            <div className="flex gap-2 mt-8">
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
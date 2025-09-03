'use client';

import { SignIn, useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Shield } from 'lucide-react';

const SignInPage = () => {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <Shield className="h-12 w-12 text-stone-700 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your Lalisure account</p>
            </div>

            <div className="flex justify-center">
              <SignIn 
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-stone-700 hover:bg-stone-800',
                    card: 'shadow-none border-0',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden'
                  }
                }}
                fallbackRedirectUrl="/dashboard"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SignInPage;
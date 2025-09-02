'use client';

import { Button } from '@/components/ui/button';
import { Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-insurance-blue to-blue-800 text-white py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Shield className="h-16 w-16 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Protect Your Home with 
            <span className="block text-insurance-green mt-2">Confidence</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
            Comprehensive home insurance coverage tailored to your needs. 
            Get protected in minutes, not days.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-insurance-green hover:bg-green-600 text-white px-8 py-4 text-lg"
              asChild
            >
              <Link href="/sign-up">
                Get Your Quote Now
              </Link>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-insurance-blue px-8 py-4 text-lg"
              asChild
            >
              <Link href="#coverage">
                Learn More
              </Link>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <CheckCircle className="h-8 w-8 text-insurance-green mb-2" />
              <span className="font-semibold">Instant Quotes</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="h-8 w-8 text-insurance-green mb-2" />
              <span className="font-semibold">24/7 Claims Support</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="h-8 w-8 text-insurance-green mb-2" />
              <span className="font-semibold">Competitive Rates</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative background */}
      <div className="absolute inset-0 bg-black opacity-10"></div>
    </section>
  );
}
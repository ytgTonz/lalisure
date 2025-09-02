import { HeroSection } from '@/components/landing/hero-section';
import { ProductShowcase } from '@/components/landing/product-showcase';
import { Testimonials } from '@/components/landing/testimonials';
import { CoverageAreas } from '@/components/landing/coverage-areas';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = await auth();
  
  // If user is already authenticated, redirect to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen">
      <HeroSection />
      <ProductShowcase />
      <Testimonials />
      <CoverageAreas />
    </main>
  );
}

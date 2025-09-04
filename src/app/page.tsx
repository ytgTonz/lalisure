'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { ChevronRight, ShieldCheck, FileText, Users, Star } from 'lucide-react';
import Link from 'next/link';
import HeroSection from '../components/HeroSection';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AppStoreButton, GooglePlayButton, AppGalleryButton } from '../components/ui/app-store-buttons';
import TestimonialsSection from '../components/landing/TestimonialsSection';

const Page = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, isLoaded, router]);

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-stone-700"></div>
      </div>
    );
  }

  // Only show landing page if not signed in
  if (isSignedIn) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="bg-white text-gray-800">
      <Navbar />
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-2">Why Choose Lalisure?</h2>
            <p className="text-lg text-gray-600">We provide more than just insurance; we provide a promise.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center p-8 transform hover:-translate-y-2 transition-transform">
              <div className="inline-block p-5 bg-stone-100 rounded-full mb-6">
                <ShieldCheck className="h-10 w-10 text-stone-700" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Comprehensive Coverage</h3>
              <p className="text-gray-600">From natural disasters to theft, our policies are designed to protect your home and belongings against a wide range of risks.</p>
            </div>
            <div className="text-center p-8 transform hover:-translate-y-2 transition-transform">
              <div className="inline-block p-5 bg-green-100 rounded-full mb-6">
                <FileText className="h-10 w-10 text-green-700" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Simple & Fast Claims</h3>
              <p className="text-gray-600">Our streamlined claims process ensures that you get the support you need, when you need it, without unnecessary delays.</p>
            </div>
            <div className="text-center p-8 transform hover:-translate-y-2 transition-transform">
              <div className="inline-block p-5 bg-blue-100 rounded-full mb-6">
                <Users className="h-10 w-10 text-blue-700" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Exceptional Service</h3>
              <p className="text-gray-600">Our dedicated team is always ready to assist you with personalized service and expert advice, ensuring a seamless experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-2">Get Covered in 3 Easy Steps</h2>
            <p className="text-lg text-gray-600">A straightforward path to securing your home.</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200"></div>
            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-2 border-gray-200 rounded-full text-2xl font-bold text-stone-700">1</div>
                </div>
                <h3 className="text-2xl font-semibold mb-2">Get a Quote</h3>
                <p className="text-gray-600">Answer a few simple questions to receive a personalized quote in minutes.</p>
              </div>
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-2 border-gray-200 rounded-full text-2xl font-bold text-stone-700">2</div>
                </div>
                <h3 className="text-2xl font-semibold mb-2">Customize Your Plan</h3>
                <p className="text-gray-600">Adjust your coverage and payment options to fit your needs and budget.</p>
              </div>
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-2 border-gray-200 rounded-full text-2xl font-bold text-stone-700">3</div>
                </div>
                <h3 className="text-2xl font-semibold mb-2">Get Insured</h3>
                <p className="text-gray-600">Finalize your policy online and enjoy immediate peace of mind.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      {/* Mobile App Section */}
      <section className="py-20 bg-gradient-to-br from-stone-800 to-stone-900 text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center bg-stone-700/50 px-8 py-4 rounded-full mb-6">
                  <img src="/lalisure1.svg" alt="Lalisure" className="h-18 w-auto mr-4 filter invert brightness-0 contrast-100" />
                  <span className="text-lg font-medium">Now Available</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Insurance.<br />
                  <span className="text-stone-300">In Your Pocket.</span>
                </h2>
                <p className="text-xl text-stone-300 mb-8 leading-relaxed">
                  Manage policies. Submit claims. Track everything. 
                  The power of Lalisure, wherever you are.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="font-medium">Instant Claims</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="font-medium">Policy Management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="font-medium">Document Upload</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="font-medium">24/7 Support</span>
                </div>
              </div>

              {/* Download Section */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* QR Code */}
                  <div className="bg-white p-3 rounded-xl shadow-sm">
                    <div className="flex items-center justify-center mb-4">
                      <img src="/lalisure-footer.svg" alt="Lalisure" className="h-4 w-auto" />
                    </div>
                    <div className="w-60 h-60 rounded-lg overflow-hidden">
                      <img 
                        src="/qrcode.svg" 
                        alt="QR Code to download Lalisure mobile app" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-3 text-center font-medium">Scan to download</p>
                  </div>
                  
                  {/* App Store Buttons */}
                  <div className="space-y-3">
                    <div className="flex flex-col xs:flex-row gap-3">
                      <AppStoreButton 
                        href="https://apps.apple.com/app/lalisure" 
                        size="md"
                        className="min-w-[140px]"
                      />
                      <GooglePlayButton 
                        href="https://play.google.com/store/apps/details?id=com.lalisure.app" 
                        size="md"
                        className="min-w-[140px]"
                      />
                    </div>
                    
                    <AppGalleryButton 
                      href="https://appgallery.huawei.com/app/lalisure" 
                      size="md"
                      className="w-full xs:w-auto min-w-[140px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Mockups */}
            <div className="relative">
              <div className="flex justify-center items-center space-x-6">
                {/* Phone 1 - Dashboard */}
                <div className="bg-gray-900 p-2 rounded-[2.5rem] shadow-2xl transform rotate-2 hover:rotate-0 transition-transform">
                  <div className="bg-white rounded-[2rem] overflow-hidden w-64 h-[32rem]">
                    <div className="bg-stone-700 h-20 flex items-center justify-center">
                      <img src="/lalisure1.svg" alt="Lalisure" className="h-16 w-auto filter invert brightness-0 contrast-100" />
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-stone-200 rounded-full"></div>
                        <div>
                          <div className="w-24 h-4 bg-stone-200 rounded"></div>
                          <div className="w-16 h-3 bg-stone-100 rounded mt-2"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-stone-50 p-4 rounded-lg">
                          <div className="w-8 h-8 bg-stone-700 rounded mb-2"></div>
                          <div className="w-16 h-3 bg-stone-200 rounded"></div>
                        </div>
                        <div className="bg-stone-50 p-4 rounded-lg">
                          <div className="w-8 h-8 bg-green-500 rounded mb-2"></div>
                          <div className="w-16 h-3 bg-stone-200 rounded"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="w-full h-16 bg-stone-100 rounded-lg"></div>
                        <div className="w-full h-16 bg-stone-100 rounded-lg"></div>
                        <div className="w-full h-16 bg-stone-100 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone 2 - Claims */}
                <div className="bg-gray-900 p-2 rounded-[2.5rem] shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform">
                  <div className="bg-white rounded-[2rem] overflow-hidden w-64 h-[32rem]">
                    <div className="bg-green-600 h-20 flex items-center justify-center">
                      <img src="/lalisure1.svg" alt="Lalisure" className="h-16 w-auto filter invert brightness-0 contrast-100" />
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <div className="w-8 h-8 bg-green-600 rounded"></div>
                        </div>
                        <div className="w-32 h-4 bg-stone-200 rounded mx-auto"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="w-20 h-3 bg-stone-200 rounded"></div>
                          <div className="w-16 h-6 bg-green-100 rounded-full"></div>
                        </div>
                        <div className="w-full h-32 bg-stone-100 rounded-lg"></div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="w-full h-16 bg-stone-100 rounded"></div>
                          <div className="w-full h-16 bg-stone-100 rounded"></div>
                          <div className="w-full h-16 bg-stone-100 rounded"></div>
                        </div>
                        <div className="w-full h-12 bg-stone-700 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-stone-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Protect Your Home?</h2>
          <p className="text-xl mb-8">Get a personalized quote today and and join the growing family of protected Lalisure homeowners.</p>
          <Link href="/sign-up" className="bg-white text-stone-700 font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105" suppressHydrationWarning>
            Get Your Free Quote
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Page;
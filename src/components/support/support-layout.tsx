'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface SupportLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  showBreadcrumb?: boolean;
  breadcrumbText?: string;
}

const SupportLayout = ({ 
  children, 
  title, 
  description, 
  showBreadcrumb = true,
  breadcrumbText = "Support" 
}: SupportLayoutProps) => {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-stone-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {showBreadcrumb && (
              <nav className="text-sm text-gray-600 mb-4">
                <span>Home</span>
                <span className="mx-2">→</span>
                <span>{breadcrumbText}</span>
              </nav>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="py-16">
        {children}
      </div>

      <Footer />
    </div>
  );
};

export default SupportLayout;
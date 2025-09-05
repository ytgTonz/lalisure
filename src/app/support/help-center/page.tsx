'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Shield, 
  CreditCard, 
  Phone, 
  MessageCircle, 
  Clock,
  Search,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Settings,
  Users
} from 'lucide-react';
import SupportLayout from '@/components/support/support-layout';
import SearchBar from '@/components/support/search-bar';

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      id: 'policies',
      title: 'Policies & Coverage',
      description: 'Learn about policy types, coverage options, and premium calculations',
      icon: Shield,
      color: 'bg-blue-50 text-blue-700',
      articles: [
        { title: 'Understanding Home Insurance Coverage', slug: 'home-insurance-coverage' },
        { title: 'How to Choose the Right Policy', slug: 'choosing-right-policy' },
        { title: 'Premium Calculation Explained', slug: 'premium-calculation' },
        { title: 'Policy Renewal Process', slug: 'policy-renewal' }
      ]
    },
    {
      id: 'claims',
      title: 'Claims Process',
      description: 'Step-by-step guidance on filing and tracking insurance claims',
      icon: FileText,
      color: 'bg-green-50 text-green-700',
      articles: [
        { title: 'How to File a Claim', slug: 'how-to-file-claim' },
        { title: 'Required Documentation', slug: 'claim-documentation' },
        { title: 'Claim Status Tracking', slug: 'claim-tracking' },
        { title: 'Claims Appeals Process', slug: 'claims-appeals' }
      ]
    },
    {
      id: 'payments',
      title: 'Billing & Payments',
      description: 'Manage your payments, billing cycles, and payment methods',
      icon: CreditCard,
      color: 'bg-purple-50 text-purple-700',
      articles: [
        { title: 'Payment Methods Available', slug: 'payment-methods' },
        { title: 'Setting Up Auto-Pay', slug: 'auto-pay-setup' },
        { title: 'Understanding Your Bill', slug: 'understanding-bill' },
        { title: 'Payment Troubleshooting', slug: 'payment-issues' }
      ]
    },
    {
      id: 'account',
      title: 'Account Management',
      description: 'Manage your profile, preferences, and account settings',
      icon: Settings,
      color: 'bg-orange-50 text-orange-700',
      articles: [
        { title: 'Creating Your Account', slug: 'creating-account' },
        { title: 'Updating Personal Information', slug: 'updating-info' },
        { title: 'Password & Security Settings', slug: 'security-settings' },
        { title: 'Notification Preferences', slug: 'notifications' }
      ]
    }
  ];

  const popularArticles = [
    { title: 'How to File Your First Claim', views: '12,543', category: 'Claims' },
    { title: 'Understanding Home Insurance Basics', views: '9,876', category: 'Policies' },
    { title: 'Setting Up Automatic Payments', views: '7,234', category: 'Billing' },
    { title: 'What to Do After Property Damage', views: '6,543', category: 'Claims' },
    { title: 'Updating Your Coverage Amount', views: '5,321', category: 'Policies' }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, this would trigger search functionality
    console.log('Searching for:', query);
  };

  const filteredCategories = searchQuery 
    ? categories.filter(category => 
        category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.articles.some(article => 
          article.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : categories;

  return (
    <SupportLayout
      title="Help Center"
      description="Find answers to common questions, browse help articles, and get the support you need for your insurance needs."
      breadcrumbText="Help Center"
    >
      <div className="container mx-auto px-4">
        {/* Search Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <SearchBar 
            placeholder="Search help articles, FAQs, or type your question..."
            onSearch={handleSearch}
          />
          
          {searchQuery && (
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Searching for: <span className="font-medium">"{searchQuery}"</span>
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Link 
              href="/claims/new" 
              className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition-shadow duration-200 group"
            >
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">File a Claim</h3>
              <p className="text-sm text-gray-600">Report damage or loss</p>
            </Link>

            <Link 
              href="/contact" 
              className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition-shadow duration-200 group"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
              <p className="text-sm text-gray-600">Speak with our team</p>
            </Link>

            <Link 
              href="/support/faq" 
              className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition-shadow duration-200 group"
            >
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                <HelpCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">View FAQs</h3>
              <p className="text-sm text-gray-600">Common questions answered</p>
            </Link>

            <Link 
              href="/customer/dashboard" 
              className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition-shadow duration-200 group"
            >
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">My Account</h3>
              <p className="text-sm text-gray-600">Access your dashboard</p>
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-xl shadow-md border p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${category.color} mr-4`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {category.articles.slice(0, 3).map((article, index) => (
                    <Link
                      key={index}
                      href={`/support/help-center/${article.slug}`}
                      className="block text-stone-700 hover:text-stone-800 text-sm py-1 transition-colors duration-200"
                    >
                      • {article.title}
                    </Link>
                  ))}
                  {category.articles.length > 3 && (
                    <p className="text-xs text-gray-500">+{category.articles.length - 3} more articles</p>
                  )}
                </div>
                
                <Link
                  href={`/support/help-center/category/${category.id}`}
                  className="text-stone-700 hover:text-stone-800 font-medium text-sm flex items-center transition-colors duration-200"
                >
                  View all articles <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Popular Articles</h2>
          <div className="bg-white rounded-xl shadow-md border">
            {popularArticles.map((article, index) => (
              <Link
                key={index}
                href={`/support/help-center/article/${article.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="block p-6 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-sm font-medium text-stone-700">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{article.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{article.category}</span>
                        <span>•</span>
                        <span>{article.views} views</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-stone-50 rounded-xl p-8 text-center">
            <MessageCircle className="h-12 w-12 text-stone-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Still need help?</h3>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-stone-700 hover:bg-stone-800 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Contact Support
              </Link>
              <button className="text-stone-700 hover:text-stone-800 font-medium px-6 py-3 border border-stone-300 rounded-lg transition-colors duration-200">
                Schedule a Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </SupportLayout>
  );
};

export default HelpCenterPage;
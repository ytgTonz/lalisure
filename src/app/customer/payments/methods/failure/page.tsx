'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  XCircle, 
  CreditCard, 
  RefreshCw, 
  Home, 
  AlertTriangle,
  Phone,
  Mail,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';

function PaymentMethodFailurePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');
  const setup = searchParams.get('setup');
  const source = searchParams.get('source');
  const error = searchParams.get('error') || 'Unknown error occurred';

  // Determine error context
  const isDirect = source === 'direct';
  const hasReference = !!(reference || trxref);
  const errorContext = isDirect ? 'Direct Error' : hasReference ? 'Setup Failed' : 'General Error';

  const commonIssues = [
    {
      title: "Insufficient Funds",
      description: "Your account may not have sufficient funds for the setup fee",
      icon: AlertTriangle,
      color: "text-orange-600"
    },
    {
      title: "Card Declined",
      description: "Your bank may have declined the transaction for security reasons",
      icon: XCircle,
      color: "text-red-600"
    },
    {
      title: "Network Issues",
      description: "Connection problems may have interrupted the setup process",
      icon: RefreshCw,
      color: "text-blue-600"
    },
    {
      title: "Bank Restrictions",
      description: "Your bank may have restrictions on online transactions",
      icon: AlertTriangle,
      color: "text-yellow-600"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="max-w-2xl mx-auto">
          {/* Failure Header */}
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-stone-700 mb-4">Payment Method Setup Failed</h1>
            <p className="text-lg text-gray-600">
              We couldn't add your payment method. Don't worry, we can help you resolve this.
            </p>
          </div>

          {/* Error Details */}
          {(hasReference || isDirect) && (
            <Card className="border-red-200 bg-red-50 shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-red-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {errorContext} Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-red-700">Reference Number:</span>
                    <span className="font-mono text-sm bg-red-100 px-2 py-1 rounded text-red-800">
                      {reference || trxref}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-700">Status:</span>
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-600 mr-1" />
                      <span className="text-red-600 font-medium">Failed</span>
                    </div>
                  </div>
                  {error !== 'Unknown error occurred' && (
                    <div className="flex justify-between items-start">
                      <span className="text-red-700">Error:</span>
                      <span className="text-sm text-red-800 max-w-xs text-right">
                        {error}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Common Issues */}
          <Card className="border-gray-200 bg-white shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-stone-700">Common Issues & Solutions</CardTitle>
              <CardDescription className="text-gray-600">
                Here are some common reasons why payment setup might fail
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commonIssues.map((issue, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <issue.icon className={`h-5 w-5 ${issue.color} mt-0.5`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{issue.title}</h4>
                      <p className="text-sm text-gray-700">{issue.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-gray-200 bg-white shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-stone-700">What You Can Do Next</CardTitle>
              <CardDescription className="text-gray-600">
                Try these steps to resolve the issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Try Again</h4>
                    <p className="text-sm text-blue-700">
                      Sometimes temporary issues resolve themselves. Try adding your payment method again.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CreditCard className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Use Different Card</h4>
                    <p className="text-sm text-green-700">
                      Try using a different credit or debit card if available
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Phone className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Contact Your Bank</h4>
                    <p className="text-sm text-yellow-700">
                      If the issue persists, contact your bank to ensure online transactions are enabled
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Information */}
          <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-3" />
              <div className="text-blue-800">
                <strong>Need Help?</strong> Our support team is here to assist you. 
                Contact us if you continue to experience issues with payment setup.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button asChild className="bg-stone-700 hover:bg-stone-800 text-white">
              <Link href="/customer/payments/methods/add">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/customer/payments/methods">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Methods
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/customer/payments">
                <Home className="h-4 w-4 mr-2" />
                Payments Dashboard
              </Link>
            </Button>
          </div>

          {/* Support Contact */}
          <div className="p-6 bg-stone-50 rounded-lg border border-stone-200">
            <h3 className="font-medium text-stone-700 mb-4 text-center">Still Need Help?</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="text-center p-4 bg-white rounded border">
                <Mail className="h-6 w-6 mx-auto mb-2 text-stone-600" />
                <p className="text-sm font-medium text-stone-700">Email Support</p>
                <p className="text-xs text-gray-600">support@lalisure.com</p>
              </div>
              <div className="text-center p-4 bg-white rounded border">
                <Phone className="h-6 w-6 mx-auto mb-2 text-stone-600" />
                <p className="text-sm font-medium text-stone-700">Phone Support</p>
                <p className="text-xs text-gray-600">+27 (0) 123 456 789</p>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-6">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PaymentMethodFailurePage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <PaymentMethodFailurePageContent />
    </Suspense>
  );
}
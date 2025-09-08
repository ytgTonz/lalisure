'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb, createPaymentBreadcrumbs } from '@/components/ui/breadcrumb';
import { 
  CheckCircle, 
  CreditCard, 
  ArrowRight, 
  Home, 
  Shield,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { api } from '@/trpc/react';

export default function PaymentMethodSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  
  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');
  const setup = searchParams.get('setup');

  // Verify the payment setup
  const { data: verificationResult, isLoading, error } = api.payment.verifySetup.useQuery(
    { reference: reference || trxref || '' },
    { 
      enabled: !!(reference || trxref),
      retry: false 
    }
  );

  useEffect(() => {
    if (!isLoading && (verificationResult || error)) {
      setIsProcessing(false);
      
      // If verification failed, redirect to failure page
      if (error || !verificationResult?.success) {
        const params = new URLSearchParams();
        if (reference) params.append('reference', reference);
        if (trxref) params.append('trxref', trxref);
        if (error) {
          params.append('error', error.message || 'Verification failed');
        } else {
          params.append('error', 'Setup verification failed');
        }
        router.replace(`/customer/payments/methods/failure?${params.toString()}`);
        return;
      }
    }
  }, [isLoading, verificationResult, error, reference, trxref, router]);

  // If verification failed or no reference provided
  if (!reference && !trxref) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="max-w-2xl mx-auto text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto mb-6 text-destructive" />
            <h1 className="text-2xl font-bold text-stone-700 mb-4">Invalid Request</h1>
            <p className="text-gray-600 mb-6">
              No payment reference found. Please try adding your payment method again.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/customer/payments/methods">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Methods
                </Link>
              </Button>
              <Button asChild className="bg-stone-700 hover:bg-stone-800 text-white">
                <Link href="/customer/payments/methods/add">
                  Try Again
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Loading state while verifying
  if (isProcessing || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumb items={createPaymentBreadcrumbs('method-success')} />
          <div className="max-w-2xl mx-auto text-center py-12">
            <Loader2 className="h-16 w-16 mx-auto mb-6 animate-spin text-primary" />
            <h1 className="text-2xl font-bold text-stone-700 mb-4">Verifying Payment Method</h1>
            <p className="text-gray-600">
              Please wait while we verify your payment method setup...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Verification failed
  if (error || !verificationResult?.success) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumb items={createPaymentBreadcrumbs('method-failure')} />
          <div className="max-w-2xl mx-auto text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto mb-6 text-destructive" />
            <h1 className="text-2xl font-bold text-stone-700 mb-4">Setup Failed</h1>
            <p className="text-gray-600 mb-6">
              There was an issue verifying your payment method setup. Please try again.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/customer/payments/methods">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Methods
                </Link>
              </Button>
              <Button asChild className="bg-stone-700 hover:bg-stone-800 text-white">
                <Link href="/customer/payments/methods/add">
                  Try Again
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Success state
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb items={createPaymentBreadcrumbs('method-success')} />
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-stone-700 mb-4">Payment Method Added Successfully!</h1>
            <p className="text-lg text-gray-600">
              Your payment method has been securely saved and is ready to use.
            </p>
          </div>

          {/* Payment Method Details */}
          <Card className="border-gray-200 bg-white shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-stone-700 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Method Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reference Number:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {reference || trxref}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Security:</span>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-blue-600 font-medium">Encrypted by Paystack</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="border-gray-200 bg-white shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-stone-700">What's Next?</CardTitle>
              <CardDescription className="text-gray-600">
                Here's what you can do with your new payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Make Payments</h4>
                    <p className="text-sm text-blue-700">
                      Use your saved payment method for faster premium payments
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Auto-Pay Ready</h4>
                    <p className="text-sm text-green-700">
                      Enable automatic payments to never miss a premium due date
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900">Secure & Protected</h4>
                    <p className="text-sm text-purple-700">
                      Your payment information is encrypted and secure with Paystack
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Alert className="border-blue-200 bg-blue-50 mb-6">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Your security is our priority:</strong> We never store your card details on our servers. 
              All payment information is securely handled by Paystack, a PCI DSS compliant payment processor.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-stone-700 hover:bg-stone-800 text-white">
              <Link href="/customer/payments">
                <Home className="h-4 w-4 mr-2" />
                Go to Payments Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/customer/payments/methods">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Payment Methods
              </Link>
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 p-6 bg-stone-50 rounded-lg border border-stone-200">
            <h3 className="font-medium text-stone-700 mb-4">Quick Actions</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/customer/policies">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View Your Policies
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/customer/claims">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View Your Claims
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
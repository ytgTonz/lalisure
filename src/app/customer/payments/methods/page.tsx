'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb, createPaymentBreadcrumbs } from '@/components/ui/breadcrumb';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import {
  CreditCard,
  Plus,
  Trash2,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { PaystackService } from '@/lib/services/paystack';

export default function PaymentMethodsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [removingMethod, setRemovingMethod] = useState<string | null>(null);

  // Handle payment setup redirect
  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    const error = searchParams.get('error');

    // Use the actual reference from Paystack (trxref is the primary reference)
    const actualReference = trxref || reference;

    if (actualReference) {
      // Check if this is a setup transaction by verifying with our API
      // The verifySetup mutation will check the transaction metadata
      // If it's a setup transaction, redirect to success page
      // If verification fails, redirect to failure page
      const params = new URLSearchParams();
      params.append('reference', actualReference);
      
      // Always redirect to success page first - it will handle verification
      // and redirect to failure page if needed
      router.replace(`/customer/payments/methods/success?${params.toString()}`);
      return;
    }

    // Handle edge case: error parameter without reference (direct error redirect)
    if (error && !actualReference) {
      const params = new URLSearchParams();
      params.append('error', error);
      params.append('source', 'direct');
      router.replace(`/customer/payments/methods/failure?${params.toString()}`);
      return;
    }
  }, [searchParams, router]);

  // Get payment methods
  const { data: paymentMethods, isLoading, refetch } = api.payment.getPaymentMethods.useQuery();

  // Remove payment method mutation
  const removePaymentMethod = api.payment.removePaymentMethod.useMutation({
    onSuccess: () => {
      refetch();
      setRemovingMethod(null);
    },
    onError: (error) => {
      console.error('Error removing payment method:', error);
      setRemovingMethod(null);
    },
  });

  const handleRemoveMethod = (methodId: string) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      setRemovingMethod(methodId);
      removePaymentMethod.mutate({ methodId });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumb items={createPaymentBreadcrumbs('methods')} />
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Payment Methods</h1>
            <p className="text-muted-foreground mt-2">
              Manage your saved payment methods
            </p>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={createPaymentBreadcrumbs('methods')} />
        
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground mt-2">
            Manage your saved payment methods for faster checkout
          </p>
        </div>
        <Link href="/customer/payments/methods/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </Link>
      </div>

      {/* Security Notice */}
      <Alert className="mb-8">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your payment information is securely stored and encrypted by Paystack.
          We never store your card details on our servers.
        </AlertDescription>
      </Alert>

      {paymentMethods && paymentMethods.length > 0 ? (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-muted rounded-full">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        Paystack Account
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {method.email} • Customer Code: {method.customerCode}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">{method.brand}</Badge>
                        {method.isDefault && (
                          <Badge variant="default">Default</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMethod(method.id)}
                      disabled={removingMethod === method.id || removePaymentMethod.isLoading}
                    >
                      {removingMethod === method.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>No Payment Methods</CardTitle>
            <CardDescription>
              You haven't saved any payment methods yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Get Started with Paystack</h3>
              <p className="text-muted-foreground mb-6">
                Add your first payment method to enable faster checkout and automatic payments for your insurance premiums.
              </p>
              <Link href="/customer/payments/methods/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Payment Method Benefits</CardTitle>
          <CardDescription>
            Why save your payment method with us?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium">Faster Checkout</h4>
                <p className="text-sm text-muted-foreground">
                  Skip entering payment details every time you make a payment
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h4 className="font-medium">Bank-Level Security</h4>
                <p className="text-sm text-muted-foreground">
                  Your payment information is protected with industry-standard encryption
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium">Automatic Payments</h4>
                <p className="text-sm text-muted-foreground">
                  Set up recurring payments for your insurance premiums
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CreditCard className="h-5 w-5 text-purple-500 mt-1" />
              <div>
                <h4 className="font-medium">Easy Management</h4>
                <p className="text-sm text-muted-foreground">
                  Update or remove payment methods anytime from your account
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}

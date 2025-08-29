'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function PaymentVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [verificationMessage, setVerificationMessage] = useState('');

  // Verify payment mutation
  const verifyPayment = api.payment.verifyPayment.useMutation({
    onSuccess: (data) => {
      setVerificationStatus('success');
      setVerificationMessage(`Payment of R${data.transaction.amount / 100} was successful!`);
      setTimeout(() => {
        router.push('/payments?success=true');
      }, 3000);
    },
    onError: (error) => {
      setVerificationStatus('error');
      setVerificationMessage(error.message || 'Payment verification failed');
    },
  });

  useEffect(() => {
    if (reference) {
      verifyPayment.mutate({ reference });
    } else {
      setVerificationStatus('error');
      setVerificationMessage('No payment reference found');
    }
  }, [reference]);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Payment Verification</h1>
          <p className="text-muted-foreground mt-2">
            Verifying your payment with Paystack
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>
              {reference && `Reference: ${reference}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              {verificationStatus === 'loading' && (
                <>
                  <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-primary" />
                  <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
                  <p className="text-muted-foreground mb-4">
                    Please wait while we verify your payment with Paystack...
                  </p>
                </>
              )}

              {verificationStatus === 'success' && (
                <>
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h2>
                  <p className="text-muted-foreground mb-4">
                    {verificationMessage}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to payments page in 3 seconds...
                  </p>
                </>
              )}

              {verificationStatus === 'error' && (
                <>
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
                  <h2 className="text-2xl font-bold mb-2 text-destructive">Payment Failed</h2>
                  <p className="text-muted-foreground mb-6">
                    {verificationMessage}
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => router.push('/payments')}
                    >
                      Back to Payments
                    </Button>
                    {reference && (
                      <Button
                        onClick={() => {
                          setVerificationStatus('loading');
                          verifyPayment.mutate({ reference });
                        }}
                      >
                        Try Again
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
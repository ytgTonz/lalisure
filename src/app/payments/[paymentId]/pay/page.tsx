'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface PaymentFormProps {
  reference: string;
  authorization_url: string;
  amount: number;
  policyNumber: string;
}

function PaymentForm({ reference, authorization_url, amount, policyNumber }: PaymentFormProps) {
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  // Verify payment mutation
  const verifyPayment = api.payment.verifyPayment.useMutation({
    onSuccess: () => {
      setSucceeded(true);
      setTimeout(() => {
        router.push('/payments?success=true');
      }, 2000);
    },
    onError: (error) => {
      setErrorMessage(error.message);
      setIsProcessing(false);
    },
  });

  const handlePaymentRedirect = () => {
    setIsProcessing(true);
    // Redirect to Paystack payment page
    window.location.href = authorization_url;
  };

  const handleVerifyPayment = () => {
    verifyPayment.mutate({ reference });
  };

  if (succeeded) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-muted-foreground mb-4">
          Your payment for R{amount.toLocaleString()} has been processed successfully.
        </p>
        <p className="text-sm text-muted-foreground">
          Redirecting to payments page...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Payment Details</h3>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span>Premium Payment - Policy {policyNumber}</span>
              <span className="font-bold">R{amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Payment Information</h3>
          <div className="p-6 border rounded-lg text-center space-y-4">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h4 className="font-medium">Pay with Paystack</h4>
              <p className="text-sm text-muted-foreground">
                You'll be redirected to Paystack to complete your payment securely
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Reference: {reference}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>Your payment information is secure and encrypted by Paystack</span>
      </div>

      <Separator />

      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleVerifyPayment}
            disabled={verifyPayment.isLoading}
          >
            {verifyPayment.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Payment'
            )}
          </Button>
          <Button 
            onClick={handlePaymentRedirect}
            disabled={isProcessing}
            className="min-w-32"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Pay R{amount.toLocaleString()}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PayPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.paymentId as string;

  // Get payment details
  const { data: payment, isLoading, error } = api.payment.getPayment.useQuery({
    paymentId,
  });

  // Create payment intent
  const [paymentTransaction, setPaymentTransaction] = useState<{
    authorization_url: string;
    reference: string;
  } | null>(null);

  const createPaymentIntent = api.payment.createPaymentIntent.useMutation({
    onSuccess: (data) => {
      setPaymentTransaction(data);
    },
    onError: (error) => {
      console.error('Error creating payment transaction:', error);
    },
  });

  useEffect(() => {
    if (payment && !paymentTransaction) {
      createPaymentIntent.mutate({
        policyId: payment.policyId,
        amount: payment.amount,
        description: `Premium payment for policy ${payment.policy.policyNumber}`,
      });
    }
  }, [payment, paymentTransaction]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-2">Payment Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The payment you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push('/payments')}>
            Back to Payments
          </Button>
        </div>
      </div>
    );
  }

  if (payment.status === 'COMPLETED') {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h1 className="text-2xl font-bold mb-2">Payment Already Completed</h1>
          <p className="text-muted-foreground mb-4">
            This payment has already been processed successfully.
          </p>
          <Button onClick={() => router.push('/payments')}>
            Back to Payments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Complete Payment</h1>
          <p className="text-muted-foreground mt-2">
            Pay your premium for Policy {payment.policy.policyNumber}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Payment Summary</span>
              <Badge variant="secondary">
                {payment.type === 'PREMIUM' ? 'Premium Payment' : payment.type}
              </Badge>
            </CardTitle>
            <CardDescription>
              Complete your payment securely using Paystack
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentTransaction && paymentTransaction.authorization_url ? (
              <PaymentForm
                reference={paymentTransaction.reference}
                authorization_url={paymentTransaction.authorization_url}
                amount={payment.amount}
                policyNumber={payment.policy.policyNumber}
              />
            ) : createPaymentIntent.isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Preparing payment form...</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
                <p className="text-muted-foreground">
                  Failed to prepare payment. Please try again or contact support.
                </p>
                <Button
                  onClick={() => createPaymentIntent.mutate({
                    policyId: payment.policyId,
                    amount: payment.amount,
                    description: `Premium payment for policy ${payment.policy.policyNumber}`,
                  })}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
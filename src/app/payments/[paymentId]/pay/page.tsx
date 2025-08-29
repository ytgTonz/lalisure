'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  policyNumber: string;
}

function PaymentForm({ paymentIntentId, clientSecret, amount, policyNumber }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  // Confirm payment mutation
  const confirmPayment = api.payment.confirmPayment.useMutation({
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payments?success=true`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      setErrorMessage(result.error.message || 'Payment failed');
      setIsProcessing(false);
    } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      // Confirm payment in our backend
      confirmPayment.mutate({ paymentIntentId });
    }
  };

  if (succeeded) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-muted-foreground mb-4">
          Your payment for ${amount.toLocaleString()} has been processed successfully.
        </p>
        <p className="text-sm text-muted-foreground">
          Redirecting to payments page...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              <span className="font-bold">${amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Payment Information</h3>
          <div className="p-4 border rounded-lg">
            <PaymentElement 
              options={{
                layout: 'tabs'
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
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
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="min-w-32"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay ${amount.toLocaleString()}
            </>
          )}
        </Button>
      </div>
    </form>
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
  const [paymentIntent, setPaymentIntent] = useState<{
    clientSecret: string;
    paymentIntentId: string;
  } | null>(null);

  const createPaymentIntent = api.payment.createPaymentIntent.useMutation({
    onSuccess: (data) => {
      setPaymentIntent(data);
    },
    onError: (error) => {
      console.error('Error creating payment intent:', error);
    },
  });

  useEffect(() => {
    if (payment && !paymentIntent) {
      createPaymentIntent.mutate({
        policyId: payment.policyId,
        amount: payment.amount,
        description: `Premium payment for policy ${payment.policy.policyNumber}`,
      });
    }
  }, [payment, paymentIntent]);

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
              Complete your payment securely using Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentIntent && paymentIntent.clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: paymentIntent.clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: 'hsl(221.2 83.2% 53.3%)',
                      colorBackground: 'hsl(0 0% 100%)',
                      colorText: 'hsl(222.2 84% 4.9%)',
                      borderRadius: '0.5rem',
                    },
                  },
                }}
              >
                <PaymentForm
                  paymentIntentId={paymentIntent.paymentIntentId}
                  clientSecret={paymentIntent.clientSecret}
                  amount={payment.amount}
                  policyNumber={payment.policy.policyNumber}
                />
              </Elements>
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
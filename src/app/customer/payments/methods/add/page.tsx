'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SetupFormProps {
  clientSecret: string;
}

function SetupForm({ clientSecret }: SetupFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const result = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payments/methods?success=true`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      setErrorMessage(result.error.message || 'Failed to save payment method');
      setIsProcessing(false);
    } else {
      setSucceeded(true);
      setTimeout(() => {
        router.push('/payments?tab=methods&success=true');
      }, 2000);
    }
  };

  if (succeeded) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
        <h2 className="text-2xl font-bold mb-2">Payment Method Added!</h2>
        <p className="text-muted-foreground mb-4">
          Your payment method has been saved successfully.
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

      <div>
        <h3 className="text-lg font-medium mb-4">Payment Method Information</h3>
        <div className="p-4 border rounded-lg">
          <PaymentElement 
            options={{
              layout: 'tabs',
            }}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>Your payment information is secure and encrypted. We don't store your card details.</span>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isProcessing}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
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
              Saving...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Save Payment Method
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function AddPaymentMethodPage() {
  const router = useRouter();
  
  // Create setup intent
  const { data: setupIntent, isLoading, error } = api.payment.createSetupIntent.useQuery();

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

  if (error || !setupIntent) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-2">Unable to Load Payment Form</h1>
          <p className="text-muted-foreground mb-4">
            There was an error preparing the payment form. Please try again.
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
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>
          
          <h1 className="text-3xl font-bold">Add Payment Method</h1>
          <p className="text-muted-foreground mt-2">
            Save a payment method for faster checkout and automatic payments
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Payment Method</CardTitle>
            <CardDescription>
              Add a credit or debit card to your account for secure payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {setupIntent.clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: setupIntent.clientSecret,
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
                <SetupForm clientSecret={setupIntent.clientSecret} />
              </Elements>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
                <p className="text-muted-foreground">
                  Failed to prepare payment form. Please try again or contact support.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Why Save a Payment Method?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-medium">Secure & Encrypted</h4>
                  <p className="text-sm text-muted-foreground">
                    Your payment information is protected with bank-level security
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CreditCard className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-medium">Faster Payments</h4>
                  <p className="text-sm text-muted-foreground">
                    Skip entering card details every time you make a payment
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-medium">Auto-Pay Ready</h4>
                  <p className="text-sm text-muted-foreground">
                    Enable automatic premium payments to never miss a due date
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Loader2 className="h-5 w-5 text-purple-500 mt-1" />
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
    </div>
  );
}
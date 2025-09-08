'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, createPaymentBreadcrumbs } from '@/components/ui/breadcrumb';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CreditCard } from '@/components/ui/credit-card';
import { InfoDialog } from '@/components/ui/info-dialog';
import { 
  Loader2, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Lock,
  Zap,
  Clock,
  HelpCircle,
  DollarSign,
  CreditCard as CreditCardIcon
} from 'lucide-react';

interface SetupFormProps {
  authorizationUrl: string;
  reference: string;
}

function SetupForm({ authorizationUrl, reference }: SetupFormProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentRedirect = () => {
    setIsProcessing(true);
    window.location.href = authorizationUrl;
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-8">
      {/* Card Preview */}
      <div className="flex justify-center">
        <CreditCard
          type="brand"
          company="Lalisure"
          cardNumber="•••• •••• •••• ••••"
          cardHolder="YOUR NAME"
          cardExpiration="MM/YY"
          width={280}
          className="shadow-xl"
        />
      </div>

      {/* Setup Information */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Secure Payment Setup</h3>
          <p className="text-muted-foreground">
            Add your payment method securely with Paystack
          </p>
        </div>

        {/* Setup Fee */}
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-stone-600" />
              <span className="text-sm font-medium">Setup verification</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-stone-900">R1.00</span>
              <p className="text-xs text-stone-500">Refunded immediately</p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Bank-level security</p>
            <p className="text-xs text-blue-700">
              Your payment details are encrypted and never stored on our servers
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handlePaymentRedirect}
            disabled={isProcessing}
            className="w-full h-12 bg-stone-900 hover:bg-stone-800 text-white"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirecting to Paystack...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Continue to Secure Setup
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isProcessing}
            className="w-full"
          >
            Cancel
          </Button>
        </div>

        {/* Reference */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Reference: <span className="font-mono">{reference}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AddPaymentMethodPage() {
  const router = useRouter();

  // Create setup intent
  const { data: setupIntent, isLoading, error } = api.payment.createSetupIntent.useQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumb items={createPaymentBreadcrumbs('add-method')} />
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !setupIntent) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumb items={createPaymentBreadcrumbs('add-method')} />
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-2">Unable to Load Payment Form</h1>
            <p className="text-muted-foreground mb-4">
              There was an error preparing the payment form. Please try again.
            </p>
            <Button onClick={() => router.push('/customer/payments')}>
              Back to Payments
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb items={createPaymentBreadcrumbs('add-method')} />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payments
            </Button>
            <h1 className="text-3xl font-bold text-stone-900">Add Payment Method</h1>
            <p className="text-stone-600 mt-1">
              Save a payment method for faster checkout and automatic payments
            </p>
          </div>
        </div>

        {/* Main Content - 70/30 Split */}
        <div className="grid lg:grid-cols-10 gap-8">
          {/* Left Side - Form (70%) */}
          <div className="lg:col-span-7">
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-8">
                {setupIntent.authorizationUrl && setupIntent.clientSecret ? (
                  <SetupForm
                    authorizationUrl={setupIntent.authorizationUrl}
                    reference={setupIntent.clientSecret}
                  />
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-stone-400" />
                    <h3 className="text-lg font-semibold text-stone-900 mb-2">Unable to Load Form</h3>
                    <p className="text-stone-600 mb-6">
                      Failed to prepare payment form. Please try again or contact support.
                    </p>
                    <Button onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Info Panel (30%) */}
          <div className="lg:col-span-3">
            <div className="space-y-4 sticky top-6">
              <Card className="border-stone-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-stone-900">Need Help?</CardTitle>
                  <CardDescription>Learn more about payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoDialog
                    title="How Payment Setup Works"
                    description="Learn about our secure payment method setup process"
                    triggerText="Setup Process"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                        <div>
                          <p className="font-medium">Secure Redirect</p>
                          <p className="text-sm text-stone-600">You&apos;ll be redirected to Paystack&apos;s secure payment page</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                        <div>
                          <p className="font-medium">Verification</p>
                          <p className="text-sm text-stone-600">A small amount (R1.00) is charged and immediately refunded</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                        <div>
                          <p className="font-medium">Saved Securely</p>
                          <p className="text-sm text-stone-600">Your payment method is saved for future transactions</p>
                        </div>
                      </div>
                    </div>
                  </InfoDialog>

                  <InfoDialog
                    title="Security & Privacy"
                    description="Your payment information is protected"
                    triggerText="Security Details"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Lock className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">256-bit SSL Encryption</p>
                          <p className="text-sm text-stone-600">All data is encrypted during transmission</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium">PCI DSS Compliant</p>
                          <p className="text-sm text-stone-600">Meets international security standards</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Never Stored</p>
                          <p className="text-sm text-stone-600">Card details are never stored on our servers</p>
                        </div>
                      </div>
                    </div>
                  </InfoDialog>

                  <InfoDialog
                    title="Benefits of Saving"
                    description="Why save a payment method?"
                    triggerText="Benefits"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Zap className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Faster Payments</p>
                          <p className="text-sm text-stone-600">Skip entering card details every time</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Auto-Pay Ready</p>
                          <p className="text-sm text-stone-600">Enable automatic premium payments</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CreditCardIcon className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Easy Management</p>
                          <p className="text-sm text-stone-600">Update or remove anytime from your account</p>
                        </div>
                      </div>
                    </div>
                  </InfoDialog>

                  <InfoDialog
                    title="Frequently Asked Questions"
                    description="Common questions about payment methods"
                    triggerText="FAQs"
                  >
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-1">Is there a fee for saving my card?</p>
                        <p className="text-sm text-stone-600">No, saving payment methods is completely free. The R1.00 verification is refunded immediately.</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Can I remove my payment method later?</p>
                        <p className="text-sm text-stone-600">Yes, you can remove or update your payment methods anytime from your account settings.</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">What cards do you accept?</p>
                        <p className="text-sm text-stone-600">We accept all major credit and debit cards through Paystack.</p>
                      </div>
                    </div>
                  </InfoDialog>
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card className="border-stone-200 bg-stone-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <HelpCircle className="h-8 w-8 mx-auto text-stone-600 mb-3" />
                    <h3 className="font-semibold text-stone-900 mb-2">Need Assistance?</h3>
                    <p className="text-sm text-stone-600 mb-4">
                      Our support team is here to help with any questions
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
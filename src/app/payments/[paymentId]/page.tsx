'use client';

import { api } from '@/trpc/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { enZA } from 'date-fns/locale';
import { PaystackService } from '@/lib/services/paystack';
import Link from 'next/link';

export default function PaymentDetailsPage({ params }: { params: { paymentId: string } }) {
  const { data: payment, isLoading } = api.payment.getPayment.useQuery({
    paymentId: params.paymentId,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold">Payment not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payment Details</h1>
        <p className="text-muted-foreground mt-2">
          Details for payment {payment.paystackId}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>
            Policy: <Link href={`/policies/${payment.policy.id}`} className="text-primary hover:underline">{payment.policy.policyNumber}</Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-medium">{PaystackService.formatCurrency(payment.amount * 100, payment.currency)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p>{getStatusBadge(payment.status)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p>{format(new Date(payment.createdAt), 'PPPpp', { locale: enZA })}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Type</p>
              <p>{payment.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paystack Reference</p>
              <p>{payment.paystackId}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

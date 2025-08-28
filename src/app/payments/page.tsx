'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  Download,
  Calendar,
  DollarSign
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function PaymentsPage() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'history' | 'methods'>('overview');

  // Get payment data
  const { data: paymentStats, isLoading: statsLoading } = trpc.payment.getPaymentStats.useQuery();
  const { data: upcomingPayments, isLoading: upcomingLoading } = trpc.payment.getUpcomingPayments.useQuery();
  const { data: paymentHistory, isLoading: historyLoading } = trpc.payment.getPaymentHistory.useQuery({
    limit: 10,
  });
  const { data: paymentMethods, isLoading: methodsLoading } = trpc.payment.getPaymentMethods.useQuery();

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

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'PREMIUM':
        return <CreditCard className="h-4 w-4" />;
      case 'DEDUCTIBLE':
        return <DollarSign className="h-4 w-4" />;
      case 'CLAIM_PAYOUT':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  if (statsLoading || upcomingLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payments & Billing</h1>
        <p className="text-muted-foreground mt-2">
          Manage your premium payments, view billing history, and update payment methods.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Payment History
          </button>
          <button
            onClick={() => setSelectedTab('methods')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'methods'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Payment Methods
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Paid This Year</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(paymentStats?.thisYearPayments || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(paymentStats?.totalPaid || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paymentStats?.pendingPayments || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
              <CardDescription>
                Premium payments due in the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingPayments && upcomingPayments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getPaymentTypeIcon(payment.type)}
                        <div>
                          <p className="font-medium">Policy {payment.policy.policyNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            Due {payment.dueDate ? formatDistanceToNow(new Date(payment.dueDate), { addSuffix: true }) : 'Soon'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">${payment.amount.toLocaleString()}</p>
                          {getStatusBadge(payment.status)}
                        </div>
                        <Link href={`/payments/${payment.id}/pay`}>
                          <Button size="sm">Pay Now</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming payments</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Your latest payment transactions</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSelectedTab('history')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {paymentHistory && paymentHistory.payments.length > 0 ? (
                <div className="space-y-4">
                  {paymentHistory.payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getPaymentTypeIcon(payment.type)}
                        <div>
                          <p className="font-medium">Policy {payment.policy.policyNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">${payment.amount.toLocaleString()}</span>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payment history</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment History Tab */}
      {selectedTab === 'history' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Complete history of your payments and transactions</CardDescription>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                        <div className="h-3 bg-muted rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                      <div className="h-6 bg-muted rounded w-12 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : paymentHistory && paymentHistory.payments.length > 0 ? (
              <div className="space-y-1">
                {paymentHistory.payments.map((payment, index) => (
                  <div key={payment.id}>
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getPaymentTypeIcon(payment.type)}
                        <div>
                          <p className="font-medium">Policy {payment.policy.policyNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleDateString()} • {payment.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">${payment.amount.toLocaleString()}</span>
                        {getStatusBadge(payment.status)}
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                    {index < paymentHistory.payments.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No payment history</h3>
                <p>You haven't made any payments yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Methods Tab */}
      {selectedTab === 'methods' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your saved payment methods</CardDescription>
            </div>
            <Link href="/payments/methods/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {methodsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                        <div className="h-3 bg-muted rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-8 bg-muted rounded w-20 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : paymentMethods && paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          •••• •••• •••• {method.card?.last4}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {method.card?.brand?.toUpperCase()} • Expires {method.card?.exp_month}/{method.card?.exp_year}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No payment methods</h3>
                <p className="mb-4">Add a payment method to make payments easier.</p>
                <Link href="/payments/methods/add">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
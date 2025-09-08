'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
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
  Banknote,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enZA } from 'date-fns/locale';
import { PaystackService } from '@/lib/services/paystack';
import Link from 'next/link';

export default function PaymentsPage() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'history' | 'methods'>('overview');

  // Get payment data
  const { data: paymentStats, isLoading: statsLoading } = api.payment.getPaymentStats.useQuery();
  const { data: upcomingPayments, isLoading: upcomingLoading } = api.payment.getUpcomingPayments.useQuery();
  const { data: paymentHistory, isLoading: historyLoading } = api.payment.getPaymentHistory.useQuery({
    limit: 10,
  });
  const { data: customerData, isLoading: methodsLoading } = api.payment.getCustomerTransactions.useQuery();

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
        return <Banknote className="h-4 w-4" />;
      case 'CLAIM_PAYOUT':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  if (statsLoading || upcomingLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" >
          <div>
            <h1 className="text-3xl font-bold">Payments & Billing</h1>
            <p className="text-muted-foreground">
              Manage your premium payments, view billing history, and update payment methods
            </p>
          </div>
          <Button asChild className="bg-stone-700 hover:bg-stone-800 text-white border-2">
            <Link href="/customer/payments/methods/add">
              <Plus className="h-4 w-4 mr-2"/>
              Add Payment Method
            </Link>
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Card>
          <CardContent className="p-0">
            <nav className="flex border-b">
              <button
                onClick={() => setSelectedTab('overview')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  selectedTab === 'overview'
                    ? 'border-b-2 border-primary text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setSelectedTab('history')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  selectedTab === 'history'
                    ? 'border-b-2 border-primary text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Payment History
              </button>
              <button
                onClick={() => setSelectedTab('methods')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  selectedTab === 'methods'
                    ? 'border-b-2 border-primary text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Payment Methods
              </button>
            </nav>
          </CardContent>
        </Card>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="card-hover border-gray-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-stone-700">Total Paid This Year</CardTitle>
                  <div className="inline-block p-2 bg-blue-100 rounded-full">
                    <TrendingUp className="h-4 w-4 text-blue-700" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-stone-700">
                    {PaystackService.formatCurrency((paymentStats?.thisYearPayments || 0) * 100)}
                  </div>
                  <p className="text-xs text-gray-600">
                    Premium payments made in {new Date().getFullYear()}
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover border-gray-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-stone-700">Total Paid</CardTitle>
                  <div className="inline-block p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-700" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-stone-700">
                    {PaystackService.formatCurrency((paymentStats?.totalPaid || 0) * 100)}
                  </div>
                  <p className="text-xs text-gray-600">
                    All-time payment total
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover border-gray-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-stone-700">Pending Payments</CardTitle>
                  <div className="inline-block p-2 bg-orange-100 rounded-full">
                    <Clock className="h-4 w-4 text-orange-700" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-stone-700">
                    {paymentStats?.pendingPayments || 0}
                  </div>
                  <p className="text-xs text-gray-600">
                    Payments awaiting processing
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Payments */}
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-stone-700">Upcoming Payments</CardTitle>
                <CardDescription className="text-gray-600">
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
                            Due {payment.dueDate ? formatDistanceToNow(new Date(payment.dueDate), { addSuffix: true, locale: enZA }) : 'Soon'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{PaystackService.formatCurrency(payment.amount * 100)}</p>
                          {getStatusBadge(payment.status)}
                        </div>
                        <Link href={`/customer/payments/${payment.id}/pay`}>
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
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-stone-700">Recent Payments</CardTitle>
                  <CardDescription className="text-gray-600">Your latest payment transactions</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedTab('history')} className="bg-stone-700 hover:bg-stone-800 text-white">
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
                            {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true, locale: enZA })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">{PaystackService.formatCurrency(payment.amount * 100)}</span>
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
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-stone-700">Payment History</CardTitle>
                <CardDescription className="text-gray-600">Complete history of your payments and transactions</CardDescription>
              </div>
              <Button variant="outline" className="bg-stone-700 hover:bg-stone-800 text-white">
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
                        <span className="font-medium">{PaystackService.formatCurrency(payment.amount * 100)}</span>
                        {getStatusBadge(payment.status)}
                        <Link href={`/customer/payments/${payment.id}`}>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </Link>
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
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-stone-700">Payment Methods</CardTitle>
                <CardDescription className="text-gray-600">Manage your saved payment methods</CardDescription>
              </div>
              <Button asChild className="bg-stone-700 hover:bg-stone-800 text-white">
                <Link href="/customer/payments/methods/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Method
                </Link>
              </Button>
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
            ) : customerData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        Paystack Account
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customerData.email} • Customer Code: {customerData.customer_code}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Active
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="mx-auto h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-stone-700">No payment methods</h3>
                <p className="mb-6 text-gray-600">Your Paystack account will be created automatically when you make your first payment.</p>
                <Button asChild className="bg-stone-700 hover:bg-stone-800 text-white">
                  <Link href="/customer/payments/methods/add">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PolicyStatusManager } from '@/components/policies/policy-status-manager';
import { PolicyDetailsView } from '@/components/policies/policy-details-view';
import { api } from '@/trpc/react';
import { ArrowLeft, Edit, FileText, CreditCard, AlertTriangle, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { PolicyStatus } from '@prisma/client';

export default function PolicyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const policyId = params.id as string;

  const { data: policy, isLoading, error, refetch } = api.policy.getById.useQuery(
    { id: policyId },
    { enabled: !!policyId }
  );

  const updateStatus = api.policy.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !policy) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Policy Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The policy you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link href="/customer/policies">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Policies
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: PolicyStatus) => {
    switch (status) {
      case PolicyStatus.ACTIVE:
        return 'bg-insurance-green text-white';
      case PolicyStatus.PENDING_REVIEW:
        return 'bg-insurance-orange text-white';
      case PolicyStatus.DRAFT:
        return 'bg-gray-500 text-white';
      case PolicyStatus.EXPIRED:
        return 'bg-red-500 text-white';
      case PolicyStatus.CANCELLED:
        return 'bg-red-600 text-white';
      case PolicyStatus.SUSPENDED:
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleStatusChange = async (newStatus: PolicyStatus, reason?: string) => {
    try {
      await updateStatus.mutateAsync({
        id: policyId,
        status: newStatus,
        reason,
      });
    } catch (error) {
      console.error('Failed to update policy status:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/customer/policies" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Policies
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{policy.policyNumber}</h1>
              <p className="text-muted-foreground">
                {policy.type} Insurance Policy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(policy.status)}>
              {policy.status.replace('_', ' ')}
            </Badge>
            
            {policy.status === PolicyStatus.DRAFT && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/customer/policies/${policy.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Policy
                </Link>
              </Button>
            )}

            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Coverage Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-insurance-blue">
                {formatCurrency(policy.coverage)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Annual Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(policy.premium)}
              </div>
              <p className="text-sm text-muted-foreground">
                R{Math.round(policy.premium / 12)} per month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Deductible</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(policy.deductible)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Policy Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="font-medium">
                  {format(new Date(policy.startDate), 'MMM dd, yyyy')}
                </div>
                <div className="text-muted-foreground">
                  to {format(new Date(policy.endDate), 'MMM dd, yyyy')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Policy Details */}
          <div className="lg:col-span-2 space-y-6">
            <PolicyDetailsView policy={policy} />
            
            {/* Claims Section */}
            {policy.claims && policy.claims.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Claims History</CardTitle>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/customer/claims/new?policyId=${policy.id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        New Claim
                      </Link>
                    </Button>
                  </div>
                  <CardDescription>
                    Claims associated with this policy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {policy.claims.map((claim) => (
                      <div key={claim.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{claim.claimNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {claim.type.replace('_', ' ')} - {claim.status}
                          </p>
                          {claim.amount && (
                            <p className="text-sm font-medium">
                              {formatCurrency(claim.amount)}
                            </p>
                          )}
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/customer/claims/${claim.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payments Section */}
            {policy.payments && policy.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Payment History</CardTitle>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/customer/payments?policyId=${policy.id}`}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        View All
                      </Link>
                    </Button>
                  </div>
                  <CardDescription>
                    Recent payments for this policy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {policy.payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.type.replace('_', ' ')}
                          </p>
                          {payment.paidAt && (
                            <p className="text-sm text-muted-foreground">
                              Paid {format(new Date(payment.paidAt), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                        <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <PolicyStatusManager
              policy={policy}
              onStatusChange={handleStatusChange}
              isLoading={updateStatus.isPending}
            />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/customer/claims/new?policyId=${policy.id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    File a Claim
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/customer/payments/new?policyId=${policy.id}`}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Make Payment
                  </Link>
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Policy
                </Button>
              </CardContent>
            </Card>

            {/* Policy Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Policy Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{format(new Date(policy.createdAt), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{format(new Date(policy.updatedAt), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Claims:</span>
                  <span>{policy.claims?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payments:</span>
                  <span>{policy.payments?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
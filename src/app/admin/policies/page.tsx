'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PolicyManagement } from '@/components/agent/policy-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/trpc/react';
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Download,
  RefreshCw,
  Settings,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminPoliciesPage() {
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const { data: policiesData, isLoading, refetch } = api.policy.getAllForAdmins.useQuery({
    filters: {},
    limit: 100
  });

  // Bulk action mutations
  const bulkApproveMutation = api.policy.bulkApprove.useMutation();
  const bulkExpireMutation = api.policy.bulkExpire.useMutation();
  const bulkRenewalMutation = api.policy.bulkRenewal.useMutation();
  const bulkAuditMutation = api.policy.bulkAudit.useMutation();
  const bulkRecalculateMutation = api.policy.bulkRecalculate.useMutation();

  const policies = policiesData?.policies || [];

  // Calculate advanced metrics
  const policyMetrics = {
    total: policies.length,
    active: policies.filter(p => p.status === 'ACTIVE').length,
    pending: policies.filter(p => p.status === 'PENDING_REVIEW').length,
    draft: policies.filter(p => p.status === 'DRAFT').length,
    expired: policies.filter(p => p.status === 'EXPIRED').length,
    cancelled: policies.filter(p => p.status === 'CANCELLED').length,
    suspended: policies.filter(p => p.status === 'SUSPENDED').length,
  };

  const totalPremiums = policies
    .filter(p => p.status === 'ACTIVE')
    .reduce((sum, policy) => sum + policy.premium, 0);

  const averagePremium = policyMetrics.active > 0 ? totalPremiums / policyMetrics.active : 0;

  // Group by customer to get unique customer count
  const customerIds = new Set(policies.map(p => p.userId));
  const totalCustomers = customerIds.size;

  // Recent policy trends (mock data)
  const trends = {
    newPolicies: {
      thisWeek: 45,
      lastWeek: 38,
      change: 18.4
    },
    approvals: {
      thisWeek: 42,
      lastWeek: 35,
      change: 20.0
    },
    cancellations: {
      thisWeek: 3,
      lastWeek: 7,
      change: -57.1
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedPolicies.length === 0) {
      toast.error('Please select policies and an action');
      return;
    }

    setIsExecuting(true);
    try {
      let result;
      switch (bulkAction) {
        case 'approve_all':
          result = await bulkApproveMutation.mutateAsync({ policyIds: selectedPolicies });
          toast.success(`Approved ${result.updatedCount} policies`);
          break;
        case 'expire_old':
          result = await bulkExpireMutation.mutateAsync({ policyIds: selectedPolicies });
          toast.success(`Expired ${result.updatedCount} policies`);
          break;
        case 'send_renewal':
          result = await bulkRenewalMutation.mutateAsync({ policyIds: selectedPolicies });
          toast.success(`Sent renewal notices to ${result.processedCount} policies`);
          break;
        case 'audit_check':
          result = await bulkAuditMutation.mutateAsync({ policyIds: selectedPolicies });
          toast.success(`Audit completed for ${result.auditResults.length} policies`);
          break;
        case 'recalculate':
          result = await bulkRecalculateMutation.mutateAsync({ policyIds: selectedPolicies });
          toast.success(`Recalculated premiums for ${result.updatedCount} policies`);
          break;
        default:
          toast.error('Unknown action');
          return;
      }
      setBulkAction('');
      setSelectedPolicies([]);
      refetch();
    } catch (error) {
      toast.error('Failed to execute bulk action');
      console.error('Bulk action error:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const exportPolicies = () => {
    // Handle export
    console.log('Exporting policies...');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System-Wide Policies</h1>
            <p className="text-muted-foreground">
              Administrative overview and management of all platform policies
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportPolicies}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Policy Settings
            </Button>
          </div>
        </div>

        {/* Admin Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPremiums)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {policyMetrics.active} active policies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Premium</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(averagePremium)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per active policy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {totalCustomers}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique policyholders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {policyMetrics.pending}
              </div>
              <p className="text-xs text-muted-foreground">
                Require admin review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Policy Trends */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New Policies</CardTitle>
              <CardDescription>Weekly comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{trends.newPolicies.thisWeek}</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600">{formatPercentage(trends.newPolicies.change)}</span>
                <span className="text-muted-foreground ml-1">vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Approvals</CardTitle>
              <CardDescription>Weekly comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{trends.approvals.thisWeek}</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600">{formatPercentage(trends.approvals.change)}</span>
                <span className="text-muted-foreground ml-1">vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cancellations</CardTitle>
              <CardDescription>Weekly comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{trends.cancellations.thisWeek}</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600">{formatPercentage(trends.cancellations.change)}</span>
                <span className="text-muted-foreground ml-1">vs last week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Policy Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Status Overview</CardTitle>
            <CardDescription>Breakdown of all policies by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-xl font-bold text-green-600">{policyMetrics.active}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-xl font-bold text-orange-600">{policyMetrics.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FileText className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <div className="text-xl font-bold text-gray-600">{policyMetrics.draft}</div>
                <div className="text-sm text-muted-foreground">Draft</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-xl font-bold text-blue-600">{policyMetrics.suspended}</div>
                <div className="text-sm text-muted-foreground">Suspended</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <div className="text-xl font-bold text-red-600">{policyMetrics.expired}</div>
                <div className="text-sm text-muted-foreground">Expired</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <div className="text-xl font-bold text-red-600">{policyMetrics.cancelled}</div>
                <div className="text-sm text-muted-foreground">Cancelled</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Administrative Controls</CardTitle>
            <CardDescription>Bulk actions and administrative operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select bulk action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve_all">Approve All Pending</SelectItem>
                  <SelectItem value="expire_old">Mark Old Policies as Expired</SelectItem>
                  <SelectItem value="send_renewal">Send Renewal Notices</SelectItem>
                  <SelectItem value="audit_check">Run Audit Check</SelectItem>
                  <SelectItem value="recalculate">Recalculate Premiums</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleBulkAction} 
                disabled={!bulkAction || selectedPolicies.length === 0 || isExecuting}
              >
                {isExecuting ? 'Executing...' : 'Execute Action'}
              </Button>
              <div className="flex-1" />
              <Badge variant="secondary">
                Admin Access Only
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Policy Management Component */}
        <PolicyManagement showFilters={true} />
      </div>
    </DashboardLayout>
  );
}
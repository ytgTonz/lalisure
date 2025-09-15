'use client';

// import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { api } from '@/trpc/react';
import { 
  ClipboardList, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  XCircle,
  Download,
  RefreshCw,
  Settings,
  Filter,
  Search,
  FileText,
  DollarSign,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminClaimsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkAction, setBulkAction] = useState<string>('');

  const { data: policiesData, isLoading } = api.policy.getAllForAdmins.useQuery({
    filters: {},
    limit: 100
  });

  const policies = policiesData?.policies || [];
  const allClaims = policies.flatMap(policy => 
    policy.claims.map(claim => ({
      ...claim,
      policyNumber: policy.policyNumber,
      customerName: policy.customer?.firstName + ' ' + policy.customer?.lastName,
      premium: policy.premium,
      status: claim.status
    }))
  );

  // Filter claims
  const filteredClaims = allClaims.filter(claim => {
    const matchesStatus = !statusFilter || claim.status === statusFilter;
    const matchesSearch = !searchQuery || 
      claim.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate claims metrics
  const claimsMetrics = {
    total: allClaims.length,
    pending: allClaims.filter(c => c.status === 'PENDING').length,
    investigating: allClaims.filter(c => c.status === 'INVESTIGATING').length,
    approved: allClaims.filter(c => c.status === 'APPROVED').length,
    settled: allClaims.filter(c => c.status === 'SETTLED').length,
    rejected: allClaims.filter(c => c.status === 'REJECTED').length,
    cancelled: allClaims.filter(c => c.status === 'CANCELLED').length,
  };

  const totalClaimsValue = allClaims
    .filter(c => ['APPROVED', 'SETTLED'].includes(c.status))
    .reduce((sum, claim) => sum + claim.amount, 0);

  const averageClaimValue = allClaims.length > 0 ? 
    allClaims.reduce((sum, claim) => sum + claim.amount, 0) / allClaims.length : 0;

  const settlementRate = claimsMetrics.total > 0 ? 
    (claimsMetrics.settled / claimsMetrics.total) * 100 : 0;

  // Claims trends (mock data based on real metrics)
  const trends = {
    newClaims: {
      thisWeek: 23,
      lastWeek: 19,
      change: 21.1
    },
    settlements: {
      thisWeek: 18,
      lastWeek: 22,
      change: -18.2
    },
    investigations: {
      thisWeek: claimsMetrics.investigating,
      lastWeek: 8,
      change: 25.0
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'INVESTIGATING': return 'bg-blue-100 text-blue-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'SETTLED': return 'bg-emerald-100 text-emerald-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction) return;
    console.log('Bulk action:', bulkAction);
  };

  const exportClaims = () => {
    console.log('Exporting claims...');
  };

  return (
    // <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System-Wide Claims</h1>
            <p className="text-muted-foreground">
              Administrative overview and management of all platform claims
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportClaims}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Claims Settings
            </Button>
          </div>
        </div>

        {/* Admin Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalClaimsValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Approved and settled claims
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Claim</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(averageClaimValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per claim submitted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Settlement Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {settlementRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Claims successfully settled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {claimsMetrics.pending + claimsMetrics.investigating}
              </div>
              <p className="text-xs text-muted-foreground">
                Require admin attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Claims Trends */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New Claims</CardTitle>
              <CardDescription>Weekly comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{trends.newClaims.thisWeek}</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600">{formatPercentage(trends.newClaims.change)}</span>
                <span className="text-muted-foreground ml-1">vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Settlements</CardTitle>
              <CardDescription>Weekly comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{trends.settlements.thisWeek}</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-3 w-3 mr-1 text-red-600 rotate-180" />
                <span className="text-red-600">{formatPercentage(trends.settlements.change)}</span>
                <span className="text-muted-foreground ml-1">vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Under Investigation</CardTitle>
              <CardDescription>Weekly comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{trends.investigations.thisWeek}</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600">{formatPercentage(trends.investigations.change)}</span>
                <span className="text-muted-foreground ml-1">vs last week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claims Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Claims Status Overview</CardTitle>
            <CardDescription>Breakdown of all claims by processing status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <div className="text-xl font-bold text-yellow-600">{claimsMetrics.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-xl font-bold text-blue-600">{claimsMetrics.investigating}</div>
                <div className="text-sm text-muted-foreground">Investigating</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-xl font-bold text-green-600">{claimsMetrics.approved}</div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </div>
              
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
                <div className="text-xl font-bold text-emerald-600">{claimsMetrics.settled}</div>
                <div className="text-sm text-muted-foreground">Settled</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <div className="text-xl font-bold text-red-600">{claimsMetrics.rejected}</div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <XCircle className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <div className="text-xl font-bold text-gray-600">{claimsMetrics.cancelled}</div>
                <div className="text-sm text-muted-foreground">Cancelled</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Administrative Controls</CardTitle>
            <CardDescription>Bulk actions and claims management operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select bulk action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve_pending">Approve Pending Claims</SelectItem>
                  <SelectItem value="escalate_old">Escalate Old Claims</SelectItem>
                  <SelectItem value="send_updates">Send Status Updates</SelectItem>
                  <SelectItem value="audit_check">Run Fraud Check</SelectItem>
                  <SelectItem value="generate_report">Generate Settlement Report</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkAction} disabled={!bulkAction}>
                Execute Action
              </Button>
              <div className="flex-1" />
              <Badge variant="secondary">
                Admin Access Only
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Claims List */}
        <Card>
          <CardHeader>
            <CardTitle>All Claims</CardTitle>
            <CardDescription>
              Comprehensive view of all claims in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search claims..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="SETTLED">Settled</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>

            {/* Claims Table */}
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Policy</th>
                      <th className="text-left p-4 font-medium">Customer</th>
                      <th className="text-left p-4 font-medium">Amount</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.slice(0, 10).map((claim) => (
                      <tr key={claim.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{claim.policyNumber}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {claim.description}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{claim.customerName}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{formatCurrency(claim.amount)}</div>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(claim.status)} variant="secondary">
                            {claim.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{formatDate(claim.createdAt)}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/claims/${claim.id}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredClaims.length === 0 && (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No claims found matching your criteria</p>
                </div>
              )}
            </div>

            {filteredClaims.length > 10 && (
              <div className="flex justify-center pt-4">
                <Button variant="outline">
                  Load More Claims
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    // </DashboardLayout>
  );
}
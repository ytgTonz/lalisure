'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { api } from '@/trpc/react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  FileText,
  ClipboardList,
  Calendar,
  Download,
  RefreshCw,
  Target,
  Activity,
  PieChart
} from 'lucide-react';
import { useState } from 'react';

type TimeRange = '7d' | '30d' | '90d' | '1y';

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const { data: policiesData, isLoading } = api.policy.getAllForAdmins.useQuery({
    filters: {},
    limit: 100
  });

  const policies = policiesData?.policies || [];
  
  // Calculate analytics data
  const totalRevenue = policies.reduce((acc, policy) => 
    acc + (policy.status === 'ACTIVE' ? policy.premium : 0), 0);
  const totalClaims = policies.reduce((acc, policy) => acc + policy.claims.length, 0);
  const claimsValue = policies.reduce((acc, policy) => 
    acc + policy.claims.reduce((sum, claim) => sum + (claim.amount || 0), 0), 0);
  
  // Mock data for charts (in real app, this would come from analytics service)
  const revenueData = {
    '7d': { current: 125000, previous: 118000, growth: 5.9 },
    '30d': { current: 485000, previous: 425000, growth: 14.1 },
    '90d': { current: 1250000, previous: 1100000, growth: 13.6 },
    '1y': { current: 5200000, previous: 4800000, growth: 8.3 }
  };

  const customerData = {
    '7d': { current: 145, previous: 138, growth: 5.1 },
    '30d': { current: 520, previous: 480, growth: 8.3 },
    '90d': { current: 1420, previous: 1280, growth: 10.9 },
    '1y': { current: 4850, previous: 4200, growth: 15.5 }
  };

  const currentRevenue = revenueData[timeRange];
  const currentCustomers = customerData[timeRange];

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

  // Policy status breakdown
  const policyStats = {
    active: policies.filter(p => p.status === 'ACTIVE').length,
    pending: policies.filter(p => p.status === 'PENDING_REVIEW').length,
    draft: policies.filter(p => p.status === 'DRAFT').length,
    expired: policies.filter(p => p.status === 'EXPIRED').length,
    cancelled: policies.filter(p => p.status === 'CANCELLED').length
  };

  // Claims status breakdown
  const claimsStats = {
    submitted: 0,
    reviewing: 0,
    approved: 0,
    settled: 0,
    rejected: 0
  };

  policies.forEach(policy => {
    policy.claims.forEach(claim => {
      switch (claim.status) {
        case 'SUBMITTED': claimsStats.submitted++; break;
        case 'UNDER_REVIEW': claimsStats.reviewing++; break;
        case 'APPROVED': claimsStats.approved++; break;
        case 'SETTLED': claimsStats.settled++; break;
        case 'REJECTED': claimsStats.rejected++; break;
      }
    });
  });

  // Performance metrics
  const performanceMetrics = {
    policyConversion: 78.5,
    claimSettlement: 92.3,
    customerSatisfaction: 4.7,
    processingTime: 2.4
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Platform performance insights and key metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(currentRevenue.current)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {currentRevenue.growth >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                )}
                <span className={currentRevenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatPercentage(currentRevenue.growth)} from last period
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {currentCustomers.current.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600">
                  {formatPercentage(currentCustomers.growth)} from last period
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-insurance-blue">
                {isLoading ? '--' : policyStats.active.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {policyStats.active + policyStats.pending} total policies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Claims Ratio</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {isLoading ? '--' : policies.length > 0 ? ((totalClaims / policies.length) * 100).toFixed(1) : '0'}%
              </div>
              <p className="text-xs text-muted-foreground">
                {totalClaims} total claims
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Policy Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Policy Status Breakdown
              </CardTitle>
              <CardDescription>Distribution of policy statuses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Policies</span>
                  <span className="text-sm text-green-600 font-medium">{policyStats.active}</span>
                </div>
                <Progress value={policies.length > 0 ? (policyStats.active / policies.length) * 100 : 0} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending Review</span>
                  <span className="text-sm text-orange-600 font-medium">{policyStats.pending}</span>
                </div>
                <Progress value={policies.length > 0 ? (policyStats.pending / policies.length) * 100 : 0} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Draft Policies</span>
                  <span className="text-sm text-gray-600 font-medium">{policyStats.draft}</span>
                </div>
                <Progress value={policies.length > 0 ? (policyStats.draft / policies.length) * 100 : 0} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Expired/Cancelled</span>
                  <span className="text-sm text-red-600 font-medium">{policyStats.expired + policyStats.cancelled}</span>
                </div>
                <Progress value={policies.length > 0 ? ((policyStats.expired + policyStats.cancelled) / policies.length) * 100 : 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Claims Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Claims Analytics
              </CardTitle>
              <CardDescription>Claims processing and status overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{claimsStats.submitted}</div>
                  <div className="text-xs text-muted-foreground">Submitted</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{claimsStats.reviewing}</div>
                  <div className="text-xs text-muted-foreground">Under Review</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{claimsStats.settled}</div>
                  <div className="text-xs text-muted-foreground">Settled</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Settlement</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(claimsStats.settled > 0 ? claimsValue / claimsStats.settled : 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Settlement Rate</span>
                  <span className="text-sm font-medium text-green-600">
                    {totalClaims > 0 ? ((claimsStats.settled / totalClaims) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Claims Value</span>
                  <span className="text-sm font-medium">{formatCurrency(claimsValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Key performance indicators and targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Policy Conversion Rate</span>
                  <span className="text-sm text-green-600 font-medium">{performanceMetrics.policyConversion}%</span>
                </div>
                <Progress value={performanceMetrics.policyConversion} className="h-2" />
                <p className="text-xs text-muted-foreground">Target: 75%</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Claim Settlement Rate</span>
                  <span className="text-sm text-green-600 font-medium">{performanceMetrics.claimSettlement}%</span>
                </div>
                <Progress value={performanceMetrics.claimSettlement} className="h-2" />
                <p className="text-xs text-muted-foreground">Target: 90%</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <span className="text-sm text-green-600 font-medium">{performanceMetrics.customerSatisfaction}/5</span>
                </div>
                <Progress value={performanceMetrics.customerSatisfaction * 20} className="h-2" />
                <p className="text-xs text-muted-foreground">Target: 4.5/5</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg Processing Time</span>
                  <span className="text-sm text-orange-600 font-medium">{performanceMetrics.processingTime} days</span>
                </div>
                <Progress value={100 - (performanceMetrics.processingTime * 10)} className="h-2" />
                <p className="text-xs text-muted-foreground">Target: &lt;2 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Trends & Insights
            </CardTitle>
            <CardDescription>Key business insights and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">Revenue Growth</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Premium revenue increased by 14.1% this month, driven by new customer acquisitions
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-sm">Claims Increase</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Claims volume up 8% due to recent weather events. Monitor settlement costs
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">Customer Retention</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Retention rate at 94.2%, above industry average of 87%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { api } from '@/trpc/react';
import {
  Mail,
  Send,
  Eye,
  MousePointer,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Download,
  Activity,
  Target,
  Clock
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type TimeRange = '7d' | '30d' | '90d' | '1y';

export default function EmailAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Fetch email analytics data
  const { data: overviewData, isLoading: overviewLoading, refetch: refetchOverview } = api.emailAnalytics.getOverview.useQuery({ timeRange });
  const { data: typeData, isLoading: typeLoading } = api.emailAnalytics.getByType.useQuery({ timeRange });
  const { data: trendsData, isLoading: trendsLoading } = api.emailAnalytics.getDeliveryTrends.useQuery({ days: 30 });
  const { data: performanceData, isLoading: performanceLoading } = api.emailAnalytics.getPerformanceMetrics.useQuery();

  const isLoading = overviewLoading || typeLoading || trendsLoading || performanceLoading;

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleRetryFailedEmails = async () => {
    try {
      await api.emailAnalytics.retryFailedEmails.mutateAsync();
      toast.success('Email retry process started');
      refetchOverview();
    } catch (error) {
      toast.error('Failed to retry emails');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Email Analytics</h1>
            <p className="text-muted-foreground">
              Track email performance, delivery rates, and engagement metrics
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
            <Button variant="outline" onClick={handleRetryFailedEmails}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Failed
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
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {overviewData?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Emails sent in period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(overviewData?.deliveryRate || 0)}
              </div>
              <Progress value={overviewData?.deliveryRate || 0} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground">
                {overviewData?.delivered || 0} delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(overviewData?.openRate || 0)}
              </div>
              <Progress value={overviewData?.openRate || 0} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground">
                {overviewData?.opened || 0} opened
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatPercentage(overviewData?.clickRate || 0)}
              </div>
              <Progress value={overviewData?.clickRate || 0} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground">
                {overviewData?.clicked || 0} clicked
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Email Types Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Performance by Email Type
              </CardTitle>
              <CardDescription>Delivery and engagement rates by email type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {typeData?.map((type) => (
                  <div key={type.type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{type.type}</span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-green-600">{formatPercentage(type.deliveryRate)} delivered</span>
                        <span className="text-purple-600">{formatPercentage(type.openRate)} opened</span>
                        <span className="text-orange-600">{formatPercentage(type.clickRate)} clicked</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{type.sent}</div>
                        <div className="text-xs text-muted-foreground">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{type.delivered}</div>
                        <div className="text-xs text-muted-foreground">Delivered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{type.opened}</div>
                        <div className="text-xs text-muted-foreground">Opened</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Issues & Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Email Health
              </CardTitle>
              <CardDescription>Issues and alerts that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overviewData?.bounceRate && overviewData.bounceRate > 5 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">High Bounce Rate</p>
                      <p className="text-sm text-red-600">
                        {formatPercentage(overviewData.bounceRate)} bounce rate detected
                      </p>
                    </div>
                  </div>
                )}

                {overviewData?.complaint && overviewData.complaint > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-800">Spam Complaints</p>
                      <p className="text-sm text-orange-600">
                        {overviewData.complaint} spam complaints received
                      </p>
                    </div>
                  </div>
                )}

                {overviewData?.deliveryRate && overviewData.deliveryRate < 95 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">Low Delivery Rate</p>
                      <p className="text-sm text-yellow-600">
                        {formatPercentage(overviewData.deliveryRate)} delivery rate
                      </p>
                    </div>
                  </div>
                )}

                {(!overviewData?.bounceRate || overviewData.bounceRate <= 5) &&
                 (!overviewData?.complaint || overviewData.complaint === 0) &&
                 (!overviewData?.deliveryRate || overviewData.deliveryRate >= 95) && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Email Health Good</p>
                      <p className="text-sm text-green-600">
                        No issues detected with email delivery
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Average response times and delivery performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {performanceData?.totalEmailsSent || 0}
                </div>
                <p className="text-sm text-muted-foreground">Total Emails Sent</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {performanceData?.avgDeliveryTime ? `${performanceData.avgDeliveryTime}m` : 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground">Avg Delivery Time</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {performanceData?.avgOpenTime ? `${performanceData.avgOpenTime}h` : 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground">Avg Time to Open</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {performanceData?.topTemplates?.length || 0}
                </div>
                <p className="text-sm text-muted-foreground">Active Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Templates */}
        {performanceData?.topTemplates && performanceData.topTemplates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performing Templates
              </CardTitle>
              <CardDescription>Templates with highest open rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.topTemplates.map((template: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {template.totalSent} emails sent
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatPercentage(template.openRate)}
                      </div>
                      <p className="text-xs text-muted-foreground">Open Rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

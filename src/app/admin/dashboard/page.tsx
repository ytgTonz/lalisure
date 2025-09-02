'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/trpc/react';
import { 
  Users, 
  FileText, 
  ClipboardList, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Activity,
  Server,
  Database,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { data: policiesData, isLoading: policiesLoading } = api.policy.getAllForAdmins.useQuery({
    filters: {},
    limit: 1000
  });

  const policies = policiesData?.policies || [];
  
  // Calculate system metrics
  const totalPolicies = policies.length;
  const activePolicies = policies.filter(p => p.status === 'ACTIVE').length;
  const pendingPolicies = policies.filter(p => p.status === 'PENDING_REVIEW').length;
  const totalClaims = policies.reduce((acc, policy) => acc + policy.claims.length, 0);
  const openClaims = policies.reduce((acc, policy) => 
    acc + policy.claims.filter(claim => !['SETTLED', 'REJECTED'].includes(claim.status)).length, 0);
  const totalPremiums = policies.reduce((acc, policy) => acc + (policy.status === 'ACTIVE' ? policy.premium : 0), 0);

  // Group by customer to get unique customer count
  const customerIds = new Set(policies.map(p => p.userId));
  const totalCustomers = customerIds.size;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const systemHealth = {
    uptime: 99.9,
    responseTime: 120,
    errorRate: 0.02,
    activeUsers: 1247
  };

  const recentAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'High Claim Volume',
      description: '15% increase in claims this week',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'info',
      title: 'System Maintenance Scheduled',
      description: 'Planned maintenance on Sunday 2AM',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'success',
      title: 'Policy Processing Optimized',
      description: 'Response time improved by 25%',
      time: '6 hours ago'
    }
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users and roles',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-600'
    },
    {
      title: 'System Analytics',
      description: 'View platform analytics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-green-600'
    },
    {
      title: 'Security Center',
      description: 'Security settings and logs',
      icon: Shield,
      href: '/admin/security',
      color: 'bg-red-600'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Server,
      href: '/admin/settings',
      color: 'bg-purple-600'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview, analytics, and administrative controls
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-insurance-green">
                {policiesLoading ? '--' : formatCurrency(totalPremiums)}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-insurance-blue">
                {policiesLoading ? '--' : totalCustomers}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-insurance-orange">
                {policiesLoading ? '--' : activePolicies}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalPolicies} total policies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Claims</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {policiesLoading ? '--' : openClaims}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalClaims} total claims
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* System Health */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health
                </CardTitle>
                <CardDescription>Real-time system performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">System Uptime</span>
                      <span className="text-sm text-green-600 font-medium">{systemHealth.uptime}%</span>
                    </div>
                    <Progress value={systemHealth.uptime} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-sm font-medium">{systemHealth.responseTime}ms</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Error Rate</span>
                      <span className="text-sm text-green-600 font-medium">{systemHealth.errorRate}%</span>
                    </div>
                    <Progress value={2} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Users</span>
                      <span className="text-sm font-medium">{systemHealth.activeUsers.toLocaleString()}</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
                <CardDescription>Key platform metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{pendingPolicies}</div>
                    <div className="text-sm text-muted-foreground">Pending Reviews</div>
                    <div className="text-xs text-red-600 mt-1">Needs attention</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {totalPolicies > 0 ? Math.round((activePolicies / totalPolicies) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Policy Approval Rate</div>
                    <div className="text-xs text-green-600 mt-1">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      +5% this month
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {totalClaims > 0 ? Math.round((openClaims / totalClaims) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Claims Processing</div>
                    <div className="text-xs text-orange-600 mt-1">In progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Alerts */}
          <div className="space-y-6">
            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  System Alerts
                </CardTitle>
                <CardDescription>Recent system notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.type === 'warning' ? 'bg-orange-500' :
                        alert.type === 'info' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Alerts
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.title}
                      asChild
                      variant="outline"
                      className="justify-start h-auto p-3"
                    >
                      <Link href={action.href}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg text-white ${action.color}`}>
                            <action.icon className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-sm">{action.title}</div>
                            <div className="text-xs text-muted-foreground">{action.description}</div>
                          </div>
                        </div>
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Usage</span>
                    <span>34%</span>
                  </div>
                  <Progress value={34} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
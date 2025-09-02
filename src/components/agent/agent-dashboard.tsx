'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/trpc/react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  ClipboardList, 
  DollarSign,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star
} from 'lucide-react';
import Link from 'next/link';

interface AgentDashboardProps {
  className?: string;
}

export function AgentDashboard({ className }: AgentDashboardProps) {
  const { data: policiesData, isLoading } = api.policy.getAllForAgents.useQuery({
    filters: {},
    limit: 1000
  });

  const policies = policiesData?.policies || [];
  
  // Calculate metrics
  const totalPolicies = policies.length;
  const activePolicies = policies.filter(p => p.status === 'ACTIVE').length;
  const pendingPolicies = policies.filter(p => p.status === 'PENDING_REVIEW').length;
  const totalClaims = policies.reduce((acc, policy) => acc + policy.claims.length, 0);
  const openClaims = policies.reduce((acc, policy) => 
    acc + policy.claims.filter(claim => !['SETTLED', 'REJECTED'].includes(claim.status)).length, 0);
  
  // Monthly targets (would come from backend in real app)
  const monthlyTargets = {
    policiesProcessed: { current: 24, target: 30 },
    claimsResolved: { current: 18, target: 25 },
    customerSatisfaction: { current: 4.8, target: 4.5 }
  };

  // Recent activity data
  const recentActivity = [
    {
      id: 1,
      type: 'policy_review',
      title: 'Policy Application Reviewed',
      description: 'Sarah Johnson - Home Insurance Policy',
      time: '2 minutes ago',
      status: 'completed',
      icon: FileText
    },
    {
      id: 2,
      type: 'claim_update',
      title: 'Claim Status Updated',
      description: 'Water damage claim - Investigation complete',
      time: '15 minutes ago',
      status: 'in_progress',
      icon: ClipboardList
    },
    {
      id: 3,
      type: 'customer_contact',
      title: 'Customer Call Completed',
      description: 'Michael Davis - Policy renewal discussion',
      time: '45 minutes ago',
      status: 'completed',
      icon: Users
    },
    {
      id: 4,
      type: 'quote_sent',
      title: 'Quote Sent to Prospect',
      description: 'New customer quote - R2,500 annual premium',
      time: '1 hour ago',
      status: 'pending',
      icon: DollarSign
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-insurance-blue mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Performance Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Performance</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Policies Processed</span>
                  <span>{monthlyTargets.policiesProcessed.current}/{monthlyTargets.policiesProcessed.target}</span>
                </div>
                <Progress 
                  value={(monthlyTargets.policiesProcessed.current / monthlyTargets.policiesProcessed.target) * 100} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Claims Resolved</span>
                  <span>{monthlyTargets.claimsResolved.current}/{monthlyTargets.claimsResolved.target}</span>
                </div>
                <Progress 
                  value={(monthlyTargets.claimsResolved.current / monthlyTargets.claimsResolved.target) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-insurance-green mb-2">
              {monthlyTargets.customerSatisfaction.current}/5.0
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
              Above target ({monthlyTargets.customerSatisfaction.target})
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Policies to Review</span>
                <span className="font-medium text-orange-600">{pendingPolicies}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Open Claims</span>
                <span className="font-medium text-blue-600">{openClaims}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Follow-ups Due</span>
                <span className="font-medium text-purple-600">3</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest interactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-100' :
                      activity.status === 'in_progress' ? 'bg-blue-100' :
                      'bg-orange-100'
                    }`}>
                      <IconComponent className={`h-4 w-4 ${getStatusColor(activity.status)}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-500' :
                      activity.status === 'in_progress' ? 'bg-blue-500' :
                      'bg-orange-500'
                    }`} />
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Overview</CardTitle>
              <CardDescription>Your current policy and claims portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-insurance-blue mb-1">{totalPolicies}</div>
                  <div className="text-sm text-muted-foreground">Total Policies</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-insurance-green mb-1">{activePolicies}</div>
                  <div className="text-sm text-muted-foreground">Active Policies</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-insurance-orange mb-1">{totalClaims}</div>
                  <div className="text-sm text-muted-foreground">Total Claims</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{openClaims}</div>
                  <div className="text-sm text-muted-foreground">Open Claims</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button asChild className="justify-start h-auto p-4">
                  <Link href="/agent/quotes">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-insurance-blue/10 rounded-lg">
                        <DollarSign className="h-5 w-5 text-insurance-blue" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Generate New Quote</div>
                        <div className="text-sm text-muted-foreground">Create quote for prospect</div>
                      </div>
                    </div>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="justify-start h-auto p-4">
                  <Link href="/agent/policies?status=PENDING_REVIEW">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <FileText className="h-5 w-5 text-insurance-orange" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Review Pending Policies</div>
                        <div className="text-sm text-muted-foreground">{pendingPolicies} policies awaiting review</div>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="justify-start h-auto p-4">
                  <Link href="/agent/claims?status=UNDER_REVIEW">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <ClipboardList className="h-5 w-5 text-insurance-green" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Process Claims</div>
                        <div className="text-sm text-muted-foreground">{openClaims} claims need attention</div>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Users,
  DollarSign,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function UnderwriterDashboard() {
  const pendingReviews = [
    {
      id: 'POL-2024-001',
      customerName: 'John Smith',
      propertyValue: 'R2.5M',
      riskScore: 'Medium',
      submittedDate: '2024-01-15',
      priority: 'High'
    },
    {
      id: 'POL-2024-002', 
      customerName: 'Sarah Johnson',
      propertyValue: 'R1.8M',
      riskScore: 'Low',
      submittedDate: '2024-01-14',
      priority: 'Medium'
    },
    {
      id: 'POL-2024-003',
      customerName: 'Mike Davis',
      propertyValue: 'R3.2M',
      riskScore: 'High',
      submittedDate: '2024-01-13',
      priority: 'High'
    }
  ];

  const getRiskBadge = (riskScore: string) => {
    switch (riskScore) {
      case 'Low':
        return <Badge variant="success">Low Risk</Badge>;
      case 'Medium':
        return <Badge variant="warning">Medium Risk</Badge>;
      case 'High':
        return <Badge variant="destructive">High Risk</Badge>;
      default:
        return <Badge variant="secondary">{riskScore}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'Low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Underwriter Dashboard</h1>
          <p className="text-muted-foreground">
            Review policies, assess risks, and manage underwriting workflows
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +3 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                15% higher than average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                Requires senior review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4h</div>
              <p className="text-xs text-muted-foreground">
                -0.3h from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common underwriting tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start">
                <Link href="/underwriter/policies/review">
                  <FileText className="mr-2 h-4 w-4" />
                  Review Pending Policies
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/underwriter/risk-assessment">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Risk Assessment Tools
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/underwriter/reports">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Generate Reports
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/underwriter/guidelines">
                  <Users className="mr-2 h-4 w-4" />
                  Underwriting Guidelines
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Reviews</CardTitle>
              <CardDescription>
                Policies requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReviews.map((review) => (
                  <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{review.id}</p>
                        {getPriorityBadge(review.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.customerName} • {review.propertyValue}
                      </p>
                      <div className="flex items-center gap-2">
                        {getRiskBadge(review.riskScore)}
                        <span className="text-xs text-muted-foreground">
                          Submitted {review.submittedDate}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/underwriter/policies/review/${review.id}`}>
                        Review
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent underwriting decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Approved POL-2024-005</p>
                  <p className="text-xs text-muted-foreground">
                    R1.2M property, Low risk assessment
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Declined POL-2024-004</p>
                  <p className="text-xs text-muted-foreground">
                    High flood risk area, insufficient documentation
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">4 hours ago</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Requested additional info for POL-2024-003</p>
                  <p className="text-xs text-muted-foreground">
                    Property inspection required for final assessment
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">6 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/server';
import { FileText, ClipboardList, CreditCard, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: stats, isLoading } = api.user.getDashboardStats.useQuery();

  const quickActions = [
    {
      title: 'New Policy',
      description: 'Apply for a new insurance policy',
      icon: FileText,
      href: '/policies/new',
      color: 'bg-insurance-blue',
    },
    {
      title: 'File Claim',
      description: 'Submit a new insurance claim',
      icon: ClipboardList,
      href: '/claims/new',
      color: 'bg-insurance-green',
    },
    {
      title: 'Make Payment',
      description: 'Pay your premium or deductible',
      icon: CreditCard,
      href: '/payments',
      color: 'bg-insurance-orange',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your insurance policies and recent activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '--' : stats?.policiesCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active and pending policies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Claims</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '--' : stats?.claimsCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Claims in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coverage</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '--' : stats?.activePoliciesCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active policies
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your insurance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <Card className="cursor-pointer transition-colors hover:bg-accent">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={`rounded-lg p-2 text-white ${action.color}`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest policy and claim updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="rounded-full bg-insurance-blue/10 p-2">
                  <FileText className="h-4 w-4 text-insurance-blue" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Welcome to Lalisure!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Get started by creating your first policy
                  </p>
                </div>
                <Button size="sm" asChild>
                  <Link href="/policies/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Policy
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';
import { FileText, ClipboardList, CreditCard, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: stats, isLoading } = api.user.getDashboardStats.useQuery();

  const quickActions = [
    {
      title: 'New Home Policy',
      description: 'Apply for home insurance coverage',
      icon: FileText,
      href: '/customer/policies/new',
      color: 'bg-insurance-blue',
    },
    {
      title: 'File Home Claim',
      description: 'Submit a claim for home damages',
      icon: ClipboardList,
      href: '/customer/claims/new',
      color: 'bg-insurance-green',
    },
    {
      title: 'Make Payment',
      description: 'Pay your premium or deductible',
      icon: CreditCard,
      href: '/customer/payments',
      color: 'bg-insurance-orange',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-stone-700 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">
            Overview of your home insurance policies and recent activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="card-hover border-gray-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-stone-700">Total Policies</CardTitle>
              <div className="inline-block p-2 bg-stone-100 rounded-full">
                <FileText className="h-4 w-4 text-stone-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-stone-700">
                {isLoading ? '--' : stats?.policiesCount || 0}
              </div>
              <p className="text-xs text-gray-600">
                Active and pending policies
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover border-gray-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-stone-700">Active Claims</CardTitle>
              <div className="inline-block p-2 bg-green-100 rounded-full">
                <ClipboardList className="h-4 w-4 text-green-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-stone-700">
                {isLoading ? '--' : stats?.claimsCount || 0}
              </div>
              <p className="text-xs text-gray-600">
                Claims in progress
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover border-gray-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-stone-700">Coverage</CardTitle>
              <div className="inline-block p-2 bg-blue-100 rounded-full">
                <TrendingUp className="h-4 w-4 text-blue-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-stone-700">
                {isLoading ? '--' : stats?.activePoliciesCount || 0}
              </div>
              <p className="text-xs text-gray-600">
                Active policies
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-gray-200 bg-white shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-stone-700 mb-2">Quick Actions</CardTitle>
            <CardDescription className="text-gray-600">
              Common tasks to manage your home insurance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <Card className="cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-2 hover:shadow-xl border-gray-200">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className={`rounded-full p-4 text-white ${action.color === 'bg-insurance-blue' ? 'bg-stone-700' : action.color === 'bg-insurance-green' ? 'bg-green-600' : 'bg-orange-500'}`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-700">{action.title}</h3>
                        <p className="text-sm text-gray-600">
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
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-stone-700 mb-2">Recent Activity</CardTitle>
            <CardDescription className="text-gray-600">
              Your latest policy and claim updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-6 bg-stone-50/50">
                <div className="rounded-full bg-stone-100 p-3">
                  <FileText className="h-5 w-5 text-stone-700" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-stone-700">
                    Welcome to Lalisure Home Insurance!
                  </p>
                  <p className="text-sm text-gray-600">
                    Get started by creating your first home insurance policy
                  </p>
                </div>
                <Button size="md" asChild className="bg-stone-700 hover:bg-stone-800 text-white font-medium">
                  <Link href="/customer/policies/new" className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    New Home Policy
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
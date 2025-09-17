'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/trpc/react';
import { Users, UserPlus, UserCheck, Crown, TrendingUp } from 'lucide-react';

export default function UsersOverviewPage() {
  const { data: userStats } = api.user.getUserStats.useQuery();

  const stats = [
    {
      title: 'Total Users',
      value: userStats?.total || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active This Month',
      value: userStats?.activeThisMonth || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Customers',
      value: userStats?.byRole.CUSTOMER || 0,
      icon: UserCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Staff Members',
      value: (userStats?.byRole.AGENT || 0) + (userStats?.byRole.UNDERWRITER || 0) + (userStats?.byRole.ADMIN || 0),
      icon: Crown,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users Overview</h1>
        <p className="text-muted-foreground">
          Summary of user statistics and activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>User Roles Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {userStats?.byRole.CUSTOMER || 0}
              </div>
              <p className="text-sm text-muted-foreground">Customers</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {userStats?.byRole.AGENT || 0}
              </div>
              <p className="text-sm text-muted-foreground">Agents</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {userStats?.byRole.UNDERWRITER || 0}
              </div>
              <p className="text-sm text-muted-foreground">Underwriters</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {userStats?.byRole.ADMIN || 0}
              </div>
              <p className="text-sm text-muted-foreground">Administrators</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

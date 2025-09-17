'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Users, FileText } from 'lucide-react';

export default function AnalyticsOverviewPage() {
  const stats = [
    {
      title: 'Total Revenue',
      value: 'R 1,234,567',
      change: '+12.5%',
      icon: DollarSign,
      positive: true,
    },
    {
      title: 'Active Policies',
      value: '2,847',
      change: '+5.2%',
      icon: FileText,
      positive: true,
    },
    {
      title: 'Total Users',
      value: '1,923',
      change: '+8.1%',
      icon: Users,
      positive: true,
    },
    {
      title: 'Claims Settled',
      value: '156',
      change: '-2.3%',
      icon: TrendingUp,
      positive: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics Overview</h1>
        <p className="text-muted-foreground">
          Key performance indicators and business metrics
        </p>
      </div>

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
                  <p className={`text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-muted-foreground">Revenue chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policy Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-muted-foreground">Policy distribution chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

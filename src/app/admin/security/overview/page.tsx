'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Users } from 'lucide-react';

export default function SecurityOverviewPage() {
  const securityMetrics = [
    {
      title: 'Security Score',
      value: '98%',
      status: 'excellent',
      icon: Shield,
    },
    {
      title: 'Active Sessions',
      value: '147',
      status: 'normal',
      icon: Users,
    },
    {
      title: 'Security Alerts',
      value: '0',
      status: 'good',
      icon: CheckCircle,
    },
    {
      title: 'Failed Logins',
      value: '12',
      status: 'warning',
      icon: AlertTriangle,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50';
      case 'good':
        return 'text-green-600 bg-green-50';
      case 'normal':
        return 'text-blue-600 bg-blue-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Security Overview</h1>
        <p className="text-muted-foreground">
          Monitor system security status and threats
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {securityMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <Badge className={getStatusColor(metric.status)} variant="secondary">
                    {metric.status}
                  </Badge>
                </div>
                <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Successful admin login</p>
                <p className="text-sm text-muted-foreground">User: admin@lalisure.com • 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium">Failed login attempt</p>
                <p className="text-sm text-muted-foreground">IP: 192.168.1.100 • 15 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

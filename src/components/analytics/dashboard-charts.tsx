'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Shield,
  AlertTriangle
} from 'lucide-react';

interface ChartData {
  month: string;
  policies: number;
  claims: number;
  revenue: number;
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, change, changeType, icon }: MetricCardProps) => {
  const getTrendIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs">
          {getTrendIcon()}
          <span className={`ml-1 ${getChangeColor()}`}>
            {change}
          </span>
          <span className="text-muted-foreground ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
};

export function DashboardCharts() {
  const chartData: ChartData[] = [
    { month: 'Jan', policies: 45, claims: 12, revenue: 180000 },
    { month: 'Feb', policies: 52, claims: 15, revenue: 208000 },
    { month: 'Mar', policies: 48, claims: 18, revenue: 192000 },
    { month: 'Apr', policies: 61, claims: 14, revenue: 244000 },
    { month: 'May', policies: 55, claims: 20, revenue: 220000 },
    { month: 'Jun', policies: 67, claims: 16, revenue: 268000 },
  ];

  const metrics = [
    {
      title: 'Total Revenue',
      value: 'R2.4M',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      title: 'Active Policies',
      value: '328',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: <Shield className="h-4 w-4" />
    },
    {
      title: 'Total Customers',
      value: '284',
      change: '+5.7%',
      changeType: 'positive' as const,
      icon: <Users className="h-4 w-4" />
    },
    {
      title: 'Claims Ratio',
      value: '12.4%',
      change: '-2.1%',
      changeType: 'positive' as const,
      icon: <AlertTriangle className="h-4 w-4" />
    }
  ];

  const riskDistribution = [
    { risk: 'Low', count: 198, percentage: 60.4, color: 'bg-green-500' },
    { risk: 'Medium', count: 97, percentage: 29.6, color: 'bg-yellow-500' },
    { risk: 'High', count: 33, percentage: 10.1, color: 'bg-red-500' }
  ];

  const maxPolicies = Math.max(...chartData.map(d => d.policies));
  const maxClaims = Math.max(...chartData.map(d => d.claims));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of key metrics and performance indicators
          </p>
        </div>
        <Select defaultValue="6months">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Policy & Claims Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Policies vs Claims
            </CardTitle>
            <CardDescription>
              Monthly comparison of new policies and claims filed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Legend */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>New Policies</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Claims Filed</span>
                </div>
              </div>

              {/* Chart */}
              <div className="space-y-3">
                {chartData.map((data, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-8 text-xs text-muted-foreground">
                      {data.month}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="bg-blue-500 h-6 rounded-sm flex items-center justify-center text-white text-xs"
                          style={{ width: `${(data.policies / maxPolicies) * 200}px` }}
                        >
                          {data.policies}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="bg-red-500 h-6 rounded-sm flex items-center justify-center text-white text-xs"
                          style={{ width: `${(data.claims / maxClaims) * 200}px` }}
                        >
                          {data.claims}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of policies by risk level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Total */}
              <div className="text-center">
                <div className="text-3xl font-bold">328</div>
                <div className="text-sm text-muted-foreground">Total Active Policies</div>
              </div>

              {/* Risk Bars */}
              <div className="space-y-3">
                {riskDistribution.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${item.color}`}></div>
                        <span>{item.risk} Risk</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.count}</span>
                        <Badge variant="secondary" className="text-xs">
                          {item.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Monthly Revenue Trend
          </CardTitle>
          <CardDescription>
            Revenue generated from premiums over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Revenue values */}
            <div className="flex justify-between items-end h-48 px-2">
              {chartData.map((data, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div 
                    className="bg-green-500 rounded-t-sm flex items-end justify-center text-white text-xs p-1"
                    style={{ 
                      height: `${(data.revenue / 300000) * 160}px`,
                      width: '40px'
                    }}
                  >
                    {data.revenue > 250000 ? `${(data.revenue/1000).toFixed(0)}k` : ''}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {data.month}
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue details */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">R268K</div>
                <div className="text-sm text-muted-foreground">Best Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">R220K</div>
                <div className="text-sm text-muted-foreground">Average</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">+22%</div>
                <div className="text-sm text-muted-foreground">Growth Rate</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { AdminSubLayout } from '@/components/admin/admin-sub-layout';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  Users,
  FileText
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/admin/analytics/overview', icon: BarChart3 },
  { name: 'Revenue Analytics', href: '/admin/analytics/revenue', icon: DollarSign },
  { name: 'User Analytics', href: '/admin/analytics/users', icon: Users },
  { name: 'Claims Analytics', href: '/admin/analytics/claims', icon: FileText },
];

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSubLayout
      title="Analytics"
      description="Business insights and reports"
      icon={BarChart3}
      navigation={navigation}
    >
      {children}
    </AdminSubLayout>
  );
}

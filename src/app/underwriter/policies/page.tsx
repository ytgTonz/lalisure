'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UnderwriterPoliciesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-stone-700 mb-2">Policy Reviews</h1>
          <p className="text-lg text-gray-600">
            Review and assess insurance policies for risk evaluation
          </p>
        </div>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-stone-700">Policy Reviews Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Underwriter policy management features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
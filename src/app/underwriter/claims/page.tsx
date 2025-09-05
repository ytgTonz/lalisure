'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UnderwriterClaimsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-stone-700 mb-2">Claims Analysis</h1>
          <p className="text-lg text-gray-600">
            Analyze claims data for risk assessment and fraud detection
          </p>
        </div>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-stone-700">Claims Analysis Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Underwriter claims analysis features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function NewClaimPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const policyId = searchParams.get('policyId');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customer/claims" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Claims
            </Link>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">File a New Claim</h1>
            <p className="text-muted-foreground">
              Please provide details about your incident to start the claims process.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Claim Submission Form</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-lg mb-4">
                  Claim submission form is temporarily under maintenance.
                </p>
                {policyId && (
                  <p className="text-sm text-muted-foreground">
                    Policy ID: {policyId}
                  </p>
                )}
                <div className="mt-6">
                  <Button 
                    onClick={() => router.push('/customer/claims')}
                    variant="outline"
                  >
                    Return to Claims
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function NewClaimPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <NewClaimPageContent />
    </Suspense>
  );
}
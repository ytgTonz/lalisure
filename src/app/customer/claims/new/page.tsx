'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { ClaimSubmissionForm } from '@/components/forms/claim-submission-form';

export default function NewClaimPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const policyId = searchParams.get('policyId');

  const handleSuccess = (claim: any) => {
    router.push(`/customer/claims/${claim.id}`);
  };

  const handleCancel = () => {
    router.push('/customer/claims');
  };

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

          <ClaimSubmissionForm
            policyId={policyId || undefined}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
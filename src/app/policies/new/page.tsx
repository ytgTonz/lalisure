'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PolicyWizard } from '@/components/forms/policy-wizard';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewPolicyPage() {
  const router = useRouter();

  const handlePolicyComplete = (policy: any) => {
    // Redirect to the created policy's detail page
    router.push(`/policies/${policy.id}`);
  };

  const handleCancel = () => {
    router.push('/policies');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/policies" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Policies
            </Link>
          </Button>
        </div>

        {/* Policy Creation Wizard */}
        <PolicyWizard
          onComplete={handlePolicyComplete}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  );
}
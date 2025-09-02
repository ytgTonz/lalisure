'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { PolicyManagement } from '@/components/agent/policy-management';
import Link from 'next/link';

export default function AgentPoliciesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Policies</h1>
            <p className="text-muted-foreground">
              Manage and review customer policies
            </p>
          </div>
          <Button asChild>
            <Link href="/agent/quotes">
              New Quote
            </Link>
          </Button>
        </div>

        {/* Policy Management Component */}
        <PolicyManagement showFilters={true} />
      </div>
    </DashboardLayout>
  );
}
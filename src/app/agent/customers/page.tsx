'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { CustomerList } from '@/components/agent/customer-list';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function AgentCustomersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
            <p className="text-muted-foreground">
              View and manage all customer accounts and their policies
            </p>
          </div>
          <Button asChild>
            <Link href="/agent/quotes">
              <Plus className="h-4 w-4 mr-2" />
              New Customer Quote
            </Link>
          </Button>
        </div>

        {/* Customer List Component */}
        <CustomerList showFilters={true} compact={false} />
      </div>
    </DashboardLayout>
  );
}
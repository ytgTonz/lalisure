'use client';

// import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { QuoteGenerator } from '@/components/agent/quote-generator';

export default function AgentQuotesPage() {
  return (
    // <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Generate Customer Quote</h1>
          <p className="text-muted-foreground">
            Create personalized insurance quotes for potential customers
          </p>
        </div>

        {/* Quote Generator Component */}
        <QuoteGenerator />
      </div>
    // </DashboardLayout>
  );
}
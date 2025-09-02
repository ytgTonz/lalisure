'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AgentDashboard } from '@/components/agent/agent-dashboard';

export default function AgentDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Manage customer policies, process claims, and track your performance
          </p>
        </div>

        {/* Agent Dashboard Component */}
        <AgentDashboard />
      </div>
    </DashboardLayout>
  );
}
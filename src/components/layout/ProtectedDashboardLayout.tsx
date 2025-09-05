'use client';

import { DashboardLayout } from './dashboard-layout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@prisma/client';

interface ProtectedDashboardLayoutProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function ProtectedDashboardLayout({ allowedRoles, children }: ProtectedDashboardLayoutProps) {
  return (
    <RoleGuard allowedRoles={allowedRoles}>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}

// Convenience components for each role
export function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedDashboardLayout allowedRoles={[UserRole.ADMIN]}>
      {children}
    </ProtectedDashboardLayout>
  );
}

export function AgentDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedDashboardLayout allowedRoles={[UserRole.AGENT]}>
      {children}
    </ProtectedDashboardLayout>
  );
}

export function UnderwriterDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedDashboardLayout allowedRoles={[UserRole.UNDERWRITER]}>
      {children}
    </ProtectedDashboardLayout>
  );
}

export function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedDashboardLayout allowedRoles={[UserRole.CUSTOMER]}>
      {children}
    </ProtectedDashboardLayout>
  );
}
'use client';

import { AdminSubLayout } from '@/components/admin/admin-sub-layout';
import { 
  Shield, 
  FileText, 
  Lock,
  Eye
} from 'lucide-react';

const navigation = [
  { name: 'Security Overview', href: '/admin/security/overview', icon: Shield },
  { name: 'Audit Logs', href: '/admin/security/audit-logs', icon: FileText },
  { name: 'Access Control', href: '/admin/security/access-control', icon: Lock },
];

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSubLayout
      title="Security"
      description="Monitor security and access"
      icon={Shield}
      navigation={navigation}
    >
      {children}
    </AdminSubLayout>
  );
}

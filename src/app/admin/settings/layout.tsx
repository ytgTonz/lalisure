'use client';

import { AdminSubLayout } from '@/components/admin/admin-sub-layout';
import { 
  Settings, 
  Shield, 
  Bell,
  Plug,
  User
} from 'lucide-react';

const navigation = [
  { name: 'General', href: '/admin/settings/general', icon: Settings },
  { name: 'Security', href: '/admin/settings/security', icon: Shield },
  { name: 'Notifications', href: '/admin/settings/notifications', icon: Bell },
  { name: 'Integrations', href: '/admin/settings/integrations', icon: Plug },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSubLayout
      title="Settings"
      description="Configure system settings"
      icon={Settings}
      navigation={navigation}
    >
      {children}
    </AdminSubLayout>
  );
}

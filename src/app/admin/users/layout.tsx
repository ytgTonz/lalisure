'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Users, 
  BarChart3, 
  UserPlus, 
  Shield,
  Mail
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/admin/users/overview', icon: BarChart3 },
  { name: 'User Management', href: '/admin/users/management', icon: Users },
  { name: 'Roles & Permissions', href: '/admin/users/roles', icon: Shield },
  { name: 'Invitations', href: '/admin/users/invitations', icon: Mail },
];

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-6 w-6 text-insurance-blue" />
            <h2 className="text-lg font-semibold">User Management</h2>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-insurance-blue text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

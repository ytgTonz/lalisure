'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  FileText, 
  ClipboardList, 
  CreditCard, 
  Settings, 
  User,
  Shield,
  Users,
  BarChart3,
  Mail
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Policies', href: '/policies', icon: FileText },
  { name: 'Claims', href: '/claims', icon: ClipboardList },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const agentNavigation = [
  { name: 'Agent Dashboard', href: '/agent/dashboard', icon: Home },
  { name: 'All Policies', href: '/agent/policies', icon: FileText },
  { name: 'All Claims', href: '/agent/claims', icon: ClipboardList },
  { name: 'Customers', href: '/agent/customers', icon: Users },
  { name: 'Quotes', href: '/agent/quotes', icon: CreditCard },
];

const adminNavigation = [
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Invitations', href: '/admin/invitations', icon: Mail },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Security', href: '/admin/security', icon: Shield },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  
  const userRole = user?.publicMetadata?.role as string;
  const isAdmin = userRole === 'ADMIN';
  const isAgent = userRole === 'AGENT';
  const isUnderwriter = userRole === 'UNDERWRITER';

  return (
    <div className={cn('flex h-full w-64 flex-col bg-card border-r', className)}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold text-insurance-blue">Lalisure</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {/* Role-based navigation */}
        {isAgent ? (
          <>
            {agentNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </>
        ) : (
          <>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="border-t pt-6 mt-6">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admin
              </h3>
              <div className="mt-2 space-y-1">
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </nav>
    </div>
  );
}
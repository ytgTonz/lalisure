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

const agentNavigation = [
  { name: 'Agent Dashboard', href: '/agent/dashboard', icon: Home },
  { name: 'All Policies', href: '/agent/policies', icon: FileText },
  { name: 'All Claims', href: '/agent/claims', icon: ClipboardList },
  { name: 'Customers', href: '/agent/customers', icon: Users },
  { name: 'Quotes', href: '/agent/quotes', icon: CreditCard },
];

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Underwriters', href: '/admin/underwriters', icon: Shield },
  { name: 'Invitations', href: '/admin/invitations', icon: Mail },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Security', href: '/admin/security', icon: Shield },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const underwriterNavigation = [
  { name: 'Underwriter Dashboard', href: '/underwriter/dashboard', icon: Home },
  { name: 'Risk Assessment', href: '/underwriter/risk-assessment', icon: Shield },
  { name: 'Policy Reviews', href: '/underwriter/policies', icon: FileText },
  { name: 'Claims Analysis', href: '/underwriter/claims', icon: ClipboardList },
];

const customerNavigation = [
  { name: 'Dashboard', href: '/customer/dashboard', icon: Home },
  { name: 'Policies', href: '/customer/policies', icon: FileText },
  { name: 'Claims', href: '/customer/claims', icon: ClipboardList },
  { name: 'Payments', href: '/customer/payments', icon: CreditCard },
  { name: 'Profile', href: '/customer/profile', icon: User },
  { name: 'Settings', href: '/customer/settings', icon: Settings },
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
    <div className={cn('flex h-full w-64 flex-col', className)}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <img src="/lalisure-footer.svg" alt="Lalisure" className="h-8 w-auto" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {/* Role-based navigation */}
        {isAdmin && (
          <>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-stone-700 text-white transform hover:scale-105'
                      : 'text-gray-600 hover:bg-stone-100 hover:text-stone-700'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}

        {isAgent && (
          <>
            {agentNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-stone-700 text-white transform hover:scale-105'
                      : 'text-gray-600 hover:bg-stone-100 hover:text-stone-700'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}

        {isUnderwriter && (
          <>
            {underwriterNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-stone-700 text-white transform hover:scale-105'
                      : 'text-gray-600 hover:bg-stone-100 hover:text-stone-700'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}

        {/* Customer navigation - only show if not admin, agent, or underwriter */}
        {!isAdmin && !isAgent && !isUnderwriter && (
          <>
            {customerNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-stone-700 text-white transform hover:scale-105'
                      : 'text-gray-600 hover:bg-stone-100 hover:text-stone-700'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </div>
  );
}
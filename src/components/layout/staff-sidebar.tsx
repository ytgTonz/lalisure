
'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Mail,
  LogOut
} from 'lucide-react';
import { useStaffUser } from '@/hooks/use-staff-user';
import axios from 'axios';

const agentNavigation = [
  { name: 'Agent Dashboard', href: '/agent/dashboard', icon: Home },
  { name: 'All Policies', href: '/agent/policies', icon: FileText },
  { name: 'All Claims', href: '/agent/claims', icon: ClipboardList },
  { name: 'Customers', href: '/agent/customers', icon: Users },
  { name: 'Quotes', href: '/agent/quotes', icon: CreditCard },
  { name: 'Settings', href: '/agent/settings', icon: Settings },
];

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Underwriters', href: '/admin/underwriters', icon: Shield },
  { name: 'Invitations', href: '/admin/invitations', icon: Mail },
  { name: 'Email Templates', href: '/admin/email-templates', icon: FileText },
  { name: 'Email Analytics', href: '/admin/email-analytics', icon: BarChart3 },
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

interface StaffSidebarProps {
  className?: string;
}

export function StaffSidebar({ className }: StaffSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isLoading } = useStaffUser();

  const handleLogout = async () => {
    try {
      await axios.post('/api/staff/logout');
      router.push('/staff/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const userRole = user?.role;
  const isAdmin = userRole === 'ADMIN';
  const isAgent = userRole === 'AGENT';
  const isUnderwriter = userRole === 'UNDERWRITER';

  let navigation = adminNavigation;
  if (isAgent) {
    navigation = agentNavigation;
  } else if (isUnderwriter) {
    navigation = underwriterNavigation;
  }

  return (
    <div className={cn('flex h-full w-64 flex-col', className)}>
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <img src="/lalisure-footer.svg" alt="Lalisure" className="h-8 w-auto" />
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          navigation.map((item) => {
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
          })
        )}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-stone-100 hover:text-stone-700"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

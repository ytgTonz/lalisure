'use client';

import { Button } from '@/components/ui/button';
import { UserButton, useUser } from '@clerk/nextjs';
import { Menu } from 'lucide-react';
import { NotificationBell } from '@/components/ui/notification-bell-simple';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user } = useUser();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-sm px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden text-stone-700 hover:bg-stone-100"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div>
          <h1 className="text-lg font-bold text-stone-700">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-sm text-gray-600">
            Manage your home insurance policies and claims
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 ring-2 ring-stone-200 hover:ring-stone-300 transition-all",
            }
          }}
          afterSignOutUrl="/"
        />
      </div>
    </header>
  );
}
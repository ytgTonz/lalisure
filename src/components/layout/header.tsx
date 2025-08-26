'use client';

import { Button } from '@/components/ui/button';
import { UserButton, useUser } from '@clerk/nextjs';
import { Bell, Menu } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user } = useUser();
  const [notifications] = useState(3); // Mock notification count

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div>
          <h1 className="text-lg font-semibold">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your insurance policies and claims
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {notifications}
            </span>
          )}
        </Button>

        {/* User Menu */}
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            }
          }}
          afterSignOutUrl="/"
        />
      </div>
    </header>
  );
}
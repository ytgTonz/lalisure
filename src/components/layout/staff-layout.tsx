
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { StaffSidebar } from './staff-sidebar';
import { Header } from './header';

interface StaffLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function StaffLayout({ children, className }: StaffLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen dashboard-background">
      <div className={cn(
        'transition-all duration-300 ease-in-out bg-white/95 backdrop-blur-sm border-r border-gray-200',
        sidebarOpen ? 'w-64' : 'w-0',
        'md:w-64 md:block',
        !sidebarOpen && 'hidden'
      )}>
        <StaffSidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className={cn('flex-1 overflow-y-auto p-6 lg:p-8', className)}>
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

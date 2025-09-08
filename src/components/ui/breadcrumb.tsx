'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  href?: string;
  label: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm text-muted-foreground', className)}>
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
            )}
            {item.isCurrentPage ? (
              <span 
                className="font-medium text-foreground"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Helper function to create payment-related breadcrumbs
export function createPaymentBreadcrumbs(currentPage: string): BreadcrumbItem[] {
  const baseBreadcrumbs: BreadcrumbItem[] = [
    { href: '/customer/dashboard', label: 'Dashboard' },
    { href: '/customer/payments', label: 'Payments' },
  ];

  switch (currentPage) {
    case 'methods':
      return [
        ...baseBreadcrumbs,
        { label: 'Payment Methods', isCurrentPage: true }
      ];
    case 'add-method':
      return [
        ...baseBreadcrumbs,
        { href: '/customer/payments', label: 'Payment Methods' },
        { label: 'Add Payment Method', isCurrentPage: true }
      ];
    case 'method-success':
      return [
        ...baseBreadcrumbs,
        { href: '/customer/payments', label: 'Payment Methods' },
        { label: 'Setup Successful', isCurrentPage: true }
      ];
    case 'method-failure':
      return [
        ...baseBreadcrumbs,
        { href: '/customer/payments', label: 'Payment Methods' },
        { label: 'Setup Failed', isCurrentPage: true }
      ];
    default:
      return baseBreadcrumbs;
  }
}

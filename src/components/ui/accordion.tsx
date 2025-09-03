'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

interface AccordionProps {
  children: React.ReactNode;
  type?: 'single' | 'multiple';
  className?: string;
}

export const AccordionItem = ({ title, children, defaultOpen = false, className }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('border border-gray-200 rounded-lg mb-4', className)}>
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-inset"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <ChevronDown 
          className={cn(
            'h-5 w-5 text-gray-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 pt-2 text-gray-600 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

export const Accordion = ({ children, type = 'single', className }: AccordionProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  );
};
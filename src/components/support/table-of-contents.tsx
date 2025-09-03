'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  items: TOCItem[];
  className?: string;
}

const TableOfContents = ({ items, className }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const headings = items.map(item => document.getElementById(item.id)).filter(Boolean);
      const current = headings.find(heading => {
        if (!heading) return false;
        const rect = heading.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom > 100;
      });

      if (current) {
        setActiveId(current.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Set initial active state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className={cn("sticky top-24", className)}>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Table of Contents</h3>
        <nav className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={cn(
                "block text-left text-sm hover:text-stone-700 transition-colors duration-200 w-full",
                item.level === 1 && "font-medium",
                item.level === 2 && "pl-4 text-gray-600",
                item.level === 3 && "pl-8 text-gray-500",
                activeId === item.id && "text-stone-700 font-medium"
              )}
            >
              {item.title}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TableOfContents;
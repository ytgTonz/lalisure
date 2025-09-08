'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CreditCardProps {
  type?: 'default' | 'brand' | 'gradient' | 'transparent';
  company?: string;
  cardNumber?: string;
  cardHolder?: string;
  cardExpiration?: string;
  width?: number;
  className?: string;
}

export function CreditCard({
  type = 'default',
  company = 'Lalisure',
  cardNumber = '•••• •••• •••• ••••',
  cardHolder = 'YOUR NAME',
  cardExpiration = 'MM/YY',
  width = 316,
  className
}: CreditCardProps) {
  const height = (width * 190) / 316; // Maintain aspect ratio
  
  const getCardStyles = () => {
    switch (type) {
      case 'brand':
        return 'bg-gradient-to-br from-stone-700 to-stone-900 text-white';
      case 'gradient':
        return 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white';
      case 'transparent':
        return 'bg-white/10 backdrop-blur-sm border border-white/20 text-white';
      default:
        return 'bg-slate-900 text-white';
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-xl p-6 shadow-lg overflow-hidden',
        getCardStyles(),
        className
      )}
      style={{ width, height }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-white/20" />
        <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-white/10" />
      </div>
      
      {/* Card content */}
      <div className="relative h-full flex flex-col justify-between">
        {/* Top section */}
        <div className="flex justify-between items-start">
          <div className="text-sm font-medium opacity-90">{company}</div>
          <div className="text-right">
            {/* Card network logo placeholder */}
            <div className="w-8 h-5 bg-white/20 rounded-sm" />
          </div>
        </div>
        
        {/* Card number */}
        <div className="text-lg font-mono tracking-wider font-semibold">
          {cardNumber}
        </div>
        
        {/* Bottom section */}
        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs opacity-70 mb-1">CARDHOLDER</div>
            <div className="text-sm font-semibold">{cardHolder}</div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-70 mb-1">EXPIRES</div>
            <div className="text-sm font-semibold">{cardExpiration}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

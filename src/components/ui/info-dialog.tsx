'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface InfoDialogProps {
  title: string;
  description: string;
  children: React.ReactNode;
  triggerText: string;
  triggerVariant?: 'default' | 'outline' | 'ghost';
}

export function InfoDialog({
  title,
  description,
  children,
  triggerText,
  triggerVariant = 'outline'
}: InfoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className="w-full justify-start">
          <Info className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

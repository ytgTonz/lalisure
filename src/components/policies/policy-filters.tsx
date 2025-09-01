'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PolicyType, PolicyStatus } from '@prisma/client';
import { Calendar, Banknote } from 'lucide-react';

interface PolicyFiltersProps {
  filters: {
    search?: string;
    type?: PolicyType;
    status?: PolicyStatus;
    minPremium?: number;
    maxPremium?: number;
    startDate?: Date;
    endDate?: Date;
  };
  onFiltersChange: (filters: any) => void;
}

export function PolicyFilters({ filters, onFiltersChange }: PolicyFiltersProps) {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      type: undefined,
      status: undefined,
      minPremium: undefined,
      maxPremium: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Premium Range */}
      <div className="space-y-2">
        <Label>Premium Range</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder="Min"
              className="pl-8"
              value={filters.minPremium || ''}
              onChange={(e) => handleFilterChange('minPremium', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
          <div className="relative flex-1">
            <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder="Max"
              className="pl-8"
              value={filters.maxPremium || ''}
              onChange={(e) => handleFilterChange('maxPremium', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>
      </div>

      {/* Start Date */}
      <div className="space-y-2">
        <Label>Start Date From</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            className="pl-8"
            value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
          />
        </div>
      </div>

      {/* End Date */}
      <div className="space-y-2">
        <Label>Start Date To</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            className="pl-8"
            value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
          />
        </div>
      </div>

      {/* Clear Filters */}
      <div className="flex items-end">
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear All Filters
        </Button>
      </div>
    </div>
  );
}
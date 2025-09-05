'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PolicyList } from '@/components/policies/policy-list';
import { PolicyFilters } from '@/components/policies/policy-filters';
import { api } from '@/trpc/react';
import { PolicyStatus } from '@prisma/client';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function PoliciesPage() {
  const [filters, setFilters] = useState({
    search: '',
    status: undefined as PolicyStatus | undefined,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: policiesData, isLoading, fetchNextPage, hasNextPage } = api.policy.getAll.useInfiniteQuery(
    { 
      filters,
      limit: 12,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const { data: stats } = api.policy.getStats.useQuery();

  const policies = policiesData?.pages.flatMap(page => page.policies) ?? [];

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', status: undefined });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Home Insurance Policies</h1>
            <p className="text-muted-foreground">
              Manage your home insurance policies and coverage
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/customer/policies/new">
                <Plus className="h-4 w-4 mr-2" />
                New Home Policy
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Home Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPolicies}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Home Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-insurance-green">{stats.activePolicies}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.claimsCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Annual Premiums</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R  {stats.totalAnnualPremiums.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search home insurance policies..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex gap-2">
                <Select
                  value={filters.status || "ALL"}
                  onValueChange={(value) => handleFilterChange('status', value === "ALL" ? undefined : value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value={PolicyStatus.ACTIVE}>Active</SelectItem>
                    <SelectItem value={PolicyStatus.PENDING_REVIEW}>Pending</SelectItem>
                    <SelectItem value={PolicyStatus.DRAFT}>Draft</SelectItem>
                    <SelectItem value={PolicyStatus.EXPIRED}>Expired</SelectItem>
                    <SelectItem value={PolicyStatus.CANCELLED}>Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>

                {(filters.search || filters.status) && (
                  <Button variant="ghost" onClick={clearFilters}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Advanced Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <PolicyFilters 
                filters={filters}
                onFiltersChange={setFilters}
              />
            </CardContent>
          </Card>
        )}

        {/* Policies List */}
        <div>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-4/5"></div>
                      <div className="h-8 bg-muted rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : policies.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="mx-auto h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No home insurance policies found</h3>
                  <p className="text-muted-foreground mb-6">
                    {filters.search || filters.status
                      ? 'Try adjusting your filters to see more results.'
                      : 'Get started by creating your first home insurance policy.'}
                  </p>
                  <Button asChild>
                    <Link href="/customer/policies/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Home Policy
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <PolicyList policies={policies} />
              
              {/* Load More */}
              {hasNextPage && (
                <div className="flex justify-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
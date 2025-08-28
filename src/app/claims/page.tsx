'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  DollarSign,
  Car,
  Home,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { ClaimType, ClaimStatus } from '@prisma/client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api } from '@/trpc/react';

export default function ClaimsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') as ClaimType || undefined,
    status: searchParams.get('status') as ClaimStatus || undefined,
    policyId: searchParams.get('policyId') || undefined,
  });

  const {
    data: claimsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.claim.getAll.useInfiniteQuery(
    {
      filters,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const { data: stats } = api.claim.getStats.useQuery();

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: undefined,
      status: undefined,
      policyId: undefined,
    });
  };

  const getStatusIcon = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.SUBMITTED:
        return <Clock className="h-4 w-4" />;
      case ClaimStatus.UNDER_REVIEW:
        return <Search className="h-4 w-4" />;
      case ClaimStatus.INVESTIGATING:
        return <AlertCircle className="h-4 w-4" />;
      case ClaimStatus.APPROVED:
        return <CheckCircle className="h-4 w-4" />;
      case ClaimStatus.REJECTED:
        return <XCircle className="h-4 w-4" />;
      case ClaimStatus.SETTLED:
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.SUBMITTED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ClaimStatus.UNDER_REVIEW:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ClaimStatus.INVESTIGATING:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case ClaimStatus.APPROVED:
        return 'bg-green-100 text-green-800 border-green-200';
      case ClaimStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      case ClaimStatus.SETTLED:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: ClaimType) => {
    if (type.includes('AUTO')) return <Car className="h-4 w-4" />;
    if (type.includes('PROPERTY') || type.includes('FIRE') || type.includes('WATER') || type.includes('THEFT')) return <Home className="h-4 w-4" />;
    if (type.includes('PERSONAL') || type.includes('MEDICAL')) return <Shield className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const claims = claimsData?.pages.flatMap(page => page.claims) ?? [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Claims</h1>
            <p className="text-muted-foreground">
              Manage and track your insurance claims
            </p>
          </div>
          <Button asChild>
            <Link href="/claims/new">
              <Plus className="h-4 w-4 mr-2" />
              File New Claim
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.underReview}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Settled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.settled}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.totalAmount)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search claims..."
                    className="pl-9"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Claim Type</Label>
                <Select
                  value={filters.type || 'ALL'}
                  onValueChange={(value) => handleFilterChange('type', value === 'ALL' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All types</SelectItem>
                    {Object.values(ClaimType).map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(type)}
                          <span>{type.replace('_', ' ')}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status || 'ALL'}
                  onValueChange={(value) => handleFilterChange('status', value === 'ALL' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    {Object.values(ClaimStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span>{status.replace('_', ' ')}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claims List */}
        <div className="space-y-4">
          {claims.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No claims found</h3>
                  <p className="text-muted-foreground mb-4">
                    {Object.values(filters).some(f => f) 
                      ? "No claims match your current filters."
                      : "You haven't filed any claims yet."
                    }
                  </p>
                  <Button asChild>
                    <Link href="/claims/new">
                      <Plus className="h-4 w-4 mr-2" />
                      File Your First Claim
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            claims.map((claim) => (
              <Card key={claim.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        {getTypeIcon(claim.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {claim.claimNumber}
                          </h3>
                          <Badge className={getStatusColor(claim.status)}>
                            {claim.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {claim.type.replace('_', ' ')} • Policy: {claim.policy.policyNumber}
                        </p>
                        <p className="text-sm line-clamp-2 mb-3">
                          {claim.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(claim.incidentDate), 'MMM dd, yyyy')}</span>
                          </div>
                          {claim.amount && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{formatCurrency(claim.amount)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/claims/${claim.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Load More */}
          {hasNextPage && (
            <div className="text-center">
              <Button 
                onClick={() => fetchNextPage()} 
                disabled={isFetchingNextPage}
                variant="outline"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More Claims'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
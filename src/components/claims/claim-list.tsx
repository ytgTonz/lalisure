'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Eye, Filter, Search, Calendar, Banknote, FileText, Clock } from 'lucide-react';
import { ClaimStatus, ClaimType } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/trpc/react';

interface ClaimListProps {
  userId?: string;
  policyId?: string;
}

export function ClaimList({ userId, policyId }: ClaimListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<ClaimType | 'ALL'>('ALL');

  const { data, isLoading } = api.claim.getAll.useQuery({
    filters: {
      userId,
      policyId,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      type: typeFilter === 'ALL' ? undefined : typeFilter,
      search: searchQuery || undefined,
    },
    limit: 50,
  });

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
    switch (type) {
      case ClaimType.FIRE_DAMAGE:
      case ClaimType.WATER_DAMAGE:
      case ClaimType.STORM_DAMAGE:
      case ClaimType.STRUCTURAL_DAMAGE:
      case ClaimType.ELECTRICAL_DAMAGE:
      case ClaimType.PLUMBING_DAMAGE:
        return '🏠';
      case ClaimType.THEFT_BURGLARY:
      case ClaimType.VANDALISM:
        return '🔒';
      case ClaimType.LIABILITY:
        return '⚖️';
      default:
        return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const claims = data?.claims || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Claims
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by claim number, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value: ClaimStatus | 'ALL') => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {Object.values(ClaimStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(value: ClaimType | 'ALL') => setTypeFilter(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {Object.values(ClaimType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Claims List */}
      {claims.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">No claims found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                    ? 'Try adjusting your filters to see more results.'
                    : 'You haven\'t submitted any claims yet.'}
                </p>
              </div>
              {!policyId && (
                <Button asChild>
                  <Link href="/claims/new">Submit New Claim</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{getTypeIcon(claim.type)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{claim.claimNumber}</h3>
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground font-medium">
                        {claim.type.replace('_', ' ')}
                      </p>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {claim.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(claim.incidentDate), 'MMM dd, yyyy')}
                        </div>
                        
                        {claim.amount && (
                          <div className="flex items-center gap-1">
                            <Banknote className="h-4 w-4" />
                            ${claim.amount.toLocaleString()}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(claim.createdAt), 'MMM dd, yyyy')}
                        </div>
                        
                        {claim.documents && claim.documents.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {claim.documents.length} doc{claim.documents.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      
                      {claim.location && (
                        <p className="text-xs text-muted-foreground">
                          📍 {claim.location}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/claims/${claim.id}`} className="flex items-center">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {data?.nextCursor && (
        <div className="text-center">
          <Button variant="outline">
            Load More Claims
          </Button>
        </div>
      )}
    </div>
  );
}
'use client';

// import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/trpc/react';
import { Search, Filter, Eye, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ClaimStatus } from '@prisma/client';

const statusColors = {
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  INVESTIGATING: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  SETTLED: 'bg-green-100 text-green-800',
};

const statusIcons = {
  SUBMITTED: Clock,
  UNDER_REVIEW: AlertTriangle,
  INVESTIGATING: Search,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  SETTLED: CheckCircle,
};

export default function AgentClaimsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'ALL'>('ALL');

  // Get all policies first to access their claims
  const { data: policiesData, isLoading } = api.policy.getAllForAgents.useQuery({
    filters: {
      search: searchTerm || undefined,
    },
    limit: 100
  });

  // Extract all claims from policies
  const allClaims = policiesData?.policies?.flatMap(policy => 
    policy.claims.map(claim => ({
      ...claim,
      policyNumber: policy.policyNumber,
      propertyInfo: policy.propertyInfo
    }))
  ) || [];

  // Filter claims by status
  const filteredClaims = statusFilter !== 'ALL' 
    ? allClaims.filter(claim => claim.status === statusFilter)
    : allClaims;

  const getStatusIcon = (status: ClaimStatus) => {
    const IconComponent = statusIcons[status];
    return <IconComponent className="h-4 w-4" />;
  };

  const safeReplace = (str: string | undefined | null, searchValue: string, replaceValue: string) => {
    return str?.replace(searchValue, replaceValue) || 'Unknown';
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'TBD';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    
    // Handle both Date objects and date strings
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date value:', date);
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-ZA').format(dateObj);
  };

  const getPriorityLevel = (claim: any) => {
    if (!claim.createdAt) return 'low';
    
    const createdDate = new Date(claim.createdAt);
    if (isNaN(createdDate.getTime())) return 'low';
    
    const daysSinceSubmission = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceSubmission > 14) return 'high';
    if (daysSinceSubmission > 7) return 'medium';
    return 'low';
  };

  return (
    // <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Claims</h1>
            <p className="text-muted-foreground">
              Process and manage customer insurance claims
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by claim number, policy number, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ClaimStatus | 'ALL')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="SETTLED">Settled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Claims List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Claims ({isLoading ? '...' : filteredClaims.length})
            </CardTitle>
            <CardDescription>
              All customer claims in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-insurance-blue mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading claims...</p>
                </div>
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No claims found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClaims.map((claim: any) => {
                  const priority = getPriorityLevel(claim);
                  return (
                    <div key={claim.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{claim.claimNumber}</h3>
                            <Badge className={statusColors[claim.status as ClaimStatus]}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(claim.status as ClaimStatus)}
                                {safeReplace(claim.status, '_', ' ')}
                              </div>
                            </Badge>
                            {priority === 'high' && (
                              <Badge className="bg-red-100 text-red-800">
                                High Priority
                              </Badge>
                            )}
                            {priority === 'medium' && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Medium Priority
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-muted-foreground">Policy Number</p>
                              <p className="font-medium">{claim.policyNumber}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Claim Amount</p>
                              <p className="font-medium text-insurance-blue">
                                {formatCurrency(claim.amount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Incident Date</p>
                              <p className="font-medium">
                                {formatDate(claim.incidentDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Submitted</p>
                              <p className="font-medium">
                                {formatDate(claim.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-muted-foreground text-sm mb-1">Description</p>
                            <p className="text-sm">{claim.description}</p>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Type: {safeReplace(claim.type, '_', ' ')}
                            </span>
                            {claim.location && (
                              <span>
                                Location: {claim.location}
                              </span>
                            )}
                            {claim.what3words && (
                              <span>
                                What3Words: {claim.what3words}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/agent/claims/${claim.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          {claim.status === 'SUBMITTED' && (
                            <Button size="sm" className="bg-insurance-blue hover:bg-blue-600">
                              Start Review
                            </Button>
                          )}
                          {claim.status === 'UNDER_REVIEW' && (
                            <Button size="sm" className="bg-insurance-green hover:bg-green-600">
                              Investigate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {allClaims.filter(c => c.status === 'SUBMITTED').length}
              </div>
              <p className="text-sm text-muted-foreground">New Submissions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {allClaims.filter(c => c.status === 'UNDER_REVIEW').length}
              </div>
              <p className="text-sm text-muted-foreground">Under Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {allClaims.filter(c => c.status === 'INVESTIGATING').length}
              </div>
              <p className="text-sm text-muted-foreground">Investigating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {allClaims.filter(c => c.status === 'APPROVED').length}
              </div>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {allClaims.filter(c => getPriorityLevel(c) === 'high').length}
              </div>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </CardContent>
          </Card>
        </div>
      </div>
    // </DashboardLayout>
  );
}
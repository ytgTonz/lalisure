'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/trpc/react';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  User,
  Home,
  DollarSign,
  Calendar,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { PolicyStatus } from '@prisma/client';
import { toast } from 'sonner';

interface PolicyManagementProps {
  className?: string;
  showFilters?: boolean;
  limit?: number;
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-red-100 text-red-800',
  SUSPENDED: 'bg-orange-100 text-orange-800',
};

const statusIcons = {
  DRAFT: Clock,
  PENDING_REVIEW: AlertTriangle,
  ACTIVE: CheckCircle,
  EXPIRED: XCircle,
  CANCELLED: XCircle,
  SUSPENDED: XCircle,
};

export function PolicyManagement({ className, showFilters = true, limit = 50 }: PolicyManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PolicyStatus | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);

  const { data: policiesData, isLoading, refetch } = api.policy.getAllForAgents.useQuery({
    filters: {
      search: searchTerm || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
    },
    limit
  });

  const updateStatusMutation = api.policy.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Policy status updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    }
  });

  const policies = policiesData?.policies || [];

  const getStatusIcon = (status: PolicyStatus) => {
    const IconComponent = statusIcons[status];
    return <IconComponent className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-ZA').format(new Date(date));
  };

  const handleStatusUpdate = (policyId: string, newStatus: PolicyStatus) => {
    updateStatusMutation.mutate({
      id: policyId,
      status: newStatus,
      reason: 'Updated by agent'
    });
  };

  const getPolicyPriority = (policy: any) => {
    if (policy.status === 'PENDING_REVIEW') return 'high';
    if (policy.status === 'EXPIRED') return 'high';
    if (policy.claims.length > 0) return 'medium';
    return 'low';
  };

  const getCustomerName = (policy: any) => {
    if (policy.personalInfo && policy.personalInfo.firstName) {
      return `${policy.personalInfo.firstName} ${policy.personalInfo.lastName || ''}`.trim();
    }
    return 'Customer Name';
  };

  const getAddress = (policy: any) => {
    if (policy.propertyInfo && typeof policy.propertyInfo === 'object' && 'address' in policy.propertyInfo) {
      return (policy.propertyInfo as any).address;
    }
    return 'Address not specified';
  };

  const QuickActionButton = ({ policy, status, label, variant = 'outline' }: { 
    policy: any; 
    status: PolicyStatus; 
    label: string; 
    variant?: 'outline' | 'default' | 'destructive';
  }) => (
    <Button 
      size="sm" 
      variant={variant}
      onClick={() => handleStatusUpdate(policy.id, status)}
      disabled={updateStatusMutation.isPending}
    >
      {label}
    </Button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-insurance-blue mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Policy Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by policy number, customer name, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PolicyStatus | 'ALL')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                >
                  Cards
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policies List/Cards */}
      <Card>
        <CardHeader>
          <CardTitle>
            Policies ({policies.length})
          </CardTitle>
          <CardDescription>
            Manage customer policies and their statuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No policies found matching your criteria.</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-4">
              {policies.map((policy) => {
                const priority = getPolicyPriority(policy);
                const customerName = getCustomerName(policy);
                const address = getAddress(policy);
                
                return (
                  <div key={policy.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg truncate">{policy.policyNumber}</h3>
                          <Badge className={statusColors[policy.status]}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(policy.status)}
                              {policy.status.replace('_', ' ')}
                            </div>
                          </Badge>
                          {priority === 'high' && (
                            <Badge className="bg-red-100 text-red-800">High Priority</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-muted-foreground">Customer</p>
                            <p className="font-medium truncate">{customerName}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Address</p>
                            <p className="font-medium truncate">{address}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Premium</p>
                            <p className="font-medium text-insurance-blue">{formatCurrency(policy.premium)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Coverage</p>
                            <p className="font-medium">{formatCurrency(policy.coverage)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(policy.startDate)} - {formatDate(policy.endDate)}
                          </span>
                          <span>{policy.claims.length} Claims</span>
                          <span>{policy.payments.length} Payments</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/agent/policies/${policy.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        
                        {policy.status === 'PENDING_REVIEW' && (
                          <div className="flex gap-1">
                            <QuickActionButton 
                              policy={policy} 
                              status="ACTIVE" 
                              label="Approve"
                              variant="default"
                            />
                            <QuickActionButton 
                              policy={policy} 
                              status="SUSPENDED" 
                              label="Request Changes"
                            />
                          </div>
                        )}
                        
                        {policy.status === 'SUSPENDED' && (
                          <QuickActionButton 
                            policy={policy} 
                            status="ACTIVE" 
                            label="Reactivate"
                            variant="default"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {policies.map((policy) => {
                const customerName = getCustomerName(policy);
                const address = getAddress(policy);
                
                return (
                  <Card key={policy.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg truncate">{policy.policyNumber}</CardTitle>
                        <Badge className={statusColors[policy.status]}>
                          {getStatusIcon(policy.status)}
                        </Badge>
                      </div>
                      <CardDescription className="truncate">{customerName}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{address}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-insurance-blue" />
                          <span className="font-medium">{formatCurrency(policy.premium)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>{policy.claims.length} Claims</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/agent/policies/${policy.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        
                        {policy.status === 'PENDING_REVIEW' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Policy Actions</DialogTitle>
                                <DialogDescription>
                                  Choose an action for policy {policy.policyNumber}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex gap-2">
                                <QuickActionButton 
                                  policy={policy} 
                                  status="ACTIVE" 
                                  label="Approve Policy"
                                  variant="default"
                                />
                                <QuickActionButton 
                                  policy={policy} 
                                  status="SUSPENDED" 
                                  label="Request Changes"
                                />
                                <QuickActionButton 
                                  policy={policy} 
                                  status="CANCELLED" 
                                  label="Reject"
                                  variant="destructive"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {policies.filter(p => p.status === 'PENDING_REVIEW').length}
            </div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {policies.filter(p => p.status === 'ACTIVE').length}
            </div>
            <p className="text-sm text-muted-foreground">Active Policies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {policies.filter(p => p.status === 'SUSPENDED').length}
            </div>
            <p className="text-sm text-muted-foreground">Suspended</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {policies.filter(p => p.status === 'EXPIRED').length}
            </div>
            <p className="text-sm text-muted-foreground">Expired</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/trpc/react';
import { 
  Search, 
  Filter,
  User, 
  Phone, 
  Mail, 
  MapPin,
  FileText,
  ClipboardList,
  DollarSign,
  Calendar,
  MoreHorizontal,
  MessageSquare,
  UserPlus,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface CustomerListProps {
  className?: string;
  showFilters?: boolean;
  limit?: number;
  compact?: boolean;
}

type SortBy = 'name' | 'policies' | 'premiums' | 'recent';
type FilterBy = 'all' | 'active' | 'inactive' | 'high-value' | 'new';

export function CustomerList({ className, showFilters = true, limit = 50, compact = false }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const { data: policiesData, isLoading } = api.policy.getAllForAgents.useQuery({
    filters: {
      search: searchTerm || undefined,
    },
    limit: 100
  });

  // Group policies by customer
  const customerMap = new Map();
  policiesData?.policies?.forEach(policy => {
    const userId = policy.userId;
    if (!customerMap.has(userId)) {
      customerMap.set(userId, {
        userId,
        policies: [],
        claims: [],
        payments: [],
      });
    }
    const customer = customerMap.get(userId);
    customer.policies.push(policy);
    customer.claims.push(...policy.claims);
    customer.payments.push(...policy.payments);
  });

  let customers = Array.from(customerMap.values());

  // Apply filters
  if (filterBy !== 'all') {
    customers = customers.filter(customer => {
      const activePolicies = customer.policies.filter((p: any) => p.status === 'ACTIVE').length;
      const totalPremiums = customer.policies.reduce((sum: number, p: any) => sum + p.premium, 0);
      const recentCustomer = customer.policies.some((p: any) => 
        new Date(p.createdAt).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000)
      );
      
      switch (filterBy) {
        case 'active': return activePolicies > 0;
        case 'inactive': return activePolicies === 0;
        case 'high-value': return totalPremiums > 5000;
        case 'new': return recentCustomer;
        default: return true;
      }
    });
  }

  // Sort customers
  customers.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        const nameA = getCustomerName(a.policies[0]);
        const nameB = getCustomerName(b.policies[0]);
        return nameA.localeCompare(nameB);
      case 'policies':
        return b.policies.length - a.policies.length;
      case 'premiums':
        const premiumA = a.policies.reduce((sum: number, p: any) => sum + p.premium, 0);
        const premiumB = b.policies.reduce((sum: number, p: any) => sum + p.premium, 0);
        return premiumB - premiumA;
      case 'recent':
      default:
        const latestA = Math.max(...a.policies.map((p: any) => new Date(p.createdAt).getTime()));
        const latestB = Math.max(...b.policies.map((p: any) => new Date(p.createdAt).getTime()));
        return latestB - latestA;
    }
  });

  // Limit results
  if (limit > 0) {
    customers = customers.slice(0, limit);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-ZA').format(new Date(date));
  };

  const getCustomerName = (policy: any) => {
    if (policy.personalInfo && policy.personalInfo.firstName) {
      return `${policy.personalInfo.firstName} ${policy.personalInfo.lastName || ''}`.trim();
    }
    return 'Customer';
  };

  const getCustomerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCustomerAddress = (policies: any[]) => {
    const policy = policies[0];
    if (policy && policy.propertyInfo && typeof policy.propertyInfo === 'object' && 'address' in policy.propertyInfo) {
      return (policy.propertyInfo as any).address;
    }
    return 'Address not available';
  };

  const getTotalPremiums = (policies: any[]) => {
    return policies.reduce((sum, policy) => sum + policy.premium, 0);
  };

  const getActivePolicies = (policies: any[]) => {
    return policies.filter(policy => policy.status === 'ACTIVE').length;
  };

  const getOpenClaims = (claims: any[]) => {
    return claims.filter(claim => !['SETTLED', 'REJECTED'].includes(claim.status)).length;
  };

  const getCustomerType = (customer: any) => {
    const activePolicies = getActivePolicies(customer.policies);
    const totalPremiums = getTotalPremiums(customer.policies);
    const openClaims = getOpenClaims(customer.claims);
    
    if (openClaims > 0) return { type: 'Attention Needed', color: 'bg-red-100 text-red-800' };
    if (totalPremiums > 10000) return { type: 'High Value', color: 'bg-purple-100 text-purple-800' };
    if (activePolicies > 0) return { type: 'Active', color: 'bg-green-100 text-green-800' };
    return { type: 'Inactive', color: 'bg-gray-100 text-gray-800' };
  };

  const handleContactCustomer = (customer: any, method: 'phone' | 'email') => {
    const name = getCustomerName(customer.policies[0]);
    toast.success(`Initiating ${method} contact with ${name}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-insurance-blue mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading customers...</p>
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
              Customer Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by customer name or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterBy)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="active">Active Customers</SelectItem>
                  <SelectItem value="inactive">Inactive Customers</SelectItem>
                  <SelectItem value="high-value">High Value Customers</SelectItem>
                  <SelectItem value="new">New Customers (30 days)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="policies">Most Policies</SelectItem>
                  <SelectItem value="premiums">Highest Premiums</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Customers ({customers.length})
          </CardTitle>
          <CardDescription>
            Manage customer relationships and accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No customers found matching your criteria.</p>
            </div>
          ) : compact ? (
            <div className="space-y-3">
              {customers.map((customer) => {
                const firstPolicy = customer.policies[0];
                const customerName = getCustomerName(firstPolicy);
                const customerType = getCustomerType(customer);
                
                return (
                  <div key={customer.userId} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-insurance-blue text-white text-sm">
                        {getCustomerInitials(customerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.policies.length} policies • {formatCurrency(getTotalPremiums(customer.policies))}
                      </p>
                    </div>
                    <Badge className={customerType.color} variant="secondary">
                      {customerType.type}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/agent/customers/${customer.userId}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {customers.map((customer) => {
                const firstPolicy = customer.policies[0];
                const customerName = getCustomerName(firstPolicy);
                const customerAddress = getCustomerAddress(customer.policies);
                const totalPremiums = getTotalPremiums(customer.policies);
                const activePolicies = getActivePolicies(customer.policies);
                const openClaims = getOpenClaims(customer.claims);
                const customerType = getCustomerType(customer);
                const oldestPolicy = customer.policies.reduce((oldest: any, policy: any) => 
                  new Date(policy.createdAt) < new Date(oldest.createdAt) ? policy : oldest
                );
                
                return (
                  <div key={customer.userId} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-insurance-blue text-white">
                            {getCustomerInitials(customerName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg truncate">{customerName}</h3>
                            <Badge className={customerType.color} variant="secondary">
                              {customerType.type}
                            </Badge>
                            {openClaims > 0 && (
                              <Badge className="bg-red-100 text-red-800">
                                {openClaims} Open Claims
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{customerAddress}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Total Policies</p>
                              <p className="font-medium">{customer.policies.length}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Active Policies</p>
                              <p className="font-medium text-green-600">{activePolicies}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Premiums</p>
                              <p className="font-medium text-insurance-blue">{formatCurrency(totalPremiums)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Customer Since</p>
                              <p className="font-medium">{formatDate(oldestPolicy.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleContactCustomer(customer, 'phone')}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleContactCustomer(customer, 'email')}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/agent/customers/${customer.userId}`}>
                            View Details
                          </Link>
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Customer Actions</DialogTitle>
                              <DialogDescription>
                                Quick actions for {customerName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-2">
                              <Button variant="outline" className="justify-start">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Send Message
                              </Button>
                              <Button variant="outline" className="justify-start" asChild>
                                <Link href="/agent/quotes">
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Create New Quote
                                </Link>
                              </Button>
                              <Button variant="outline" className="justify-start">
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Follow-up
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-3 pt-3 border-t text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {customer.policies.length} Policies
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList className="h-4 w-4" />
                        {customer.claims.length} Claims
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {customer.payments.length} Payments
                      </span>
                      <div className="flex-1" />
                      <span>
                        Recent Policies: {customer.policies.slice(0, 2).map((p: any) => p.policyNumber).join(', ')}
                        {customer.policies.length > 2 && ` +${customer.policies.length - 2} more`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {!compact && (
        <div className="grid gap-4 md:grid-cols-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-insurance-blue">
                {customers.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {customers.filter(c => getActivePolicies(c.policies) > 0).length}
              </div>
              <p className="text-sm text-muted-foreground">Active Customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {customers.filter(c => getTotalPremiums(c.policies) > 10000).length}
              </div>
              <p className="text-sm text-muted-foreground">High Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {customers.filter(c => getOpenClaims(c.claims) > 0).length}
              </div>
              <p className="text-sm text-muted-foreground">Need Attention</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
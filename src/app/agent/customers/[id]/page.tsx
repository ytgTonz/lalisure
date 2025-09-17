'use client';

// import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/trpc/react';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  ClipboardList,
  CreditCard,
  Shield,
  MessageSquare,
  PhoneCall,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

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
  PENDING_REVIEW: Clock,
  ACTIVE: CheckCircle,
  EXPIRED: AlertTriangle,
  CANCELLED: AlertTriangle,
  SUSPENDED: AlertTriangle,
};

const claimStatusColors = {
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  SETTLED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  PENDING: 'bg-orange-100 text-orange-800',
};

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch customer data
  const { data: customerData, isLoading } = api.policy.getAllForAgents.useQuery({
    filters: {
      userId: customerId,
    },
    limit: 100
  });

  // Extract customer information from policies
  const customer = customerData?.policies?.[0];
  const allPolicies = customerData?.policies || [];
  const allClaims = allPolicies.flatMap(policy => policy.claims || []);
  const allPayments = allPolicies.flatMap(policy => policy.payments || []);

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: any) => {
    if (!date) return 'Not specified';

    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }

      return new Intl.DateTimeFormat('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(dateObj);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getCustomerName = () => {
    if (!customer?.personalInfo) return 'Customer';

    const info = typeof customer.personalInfo === 'object' ? customer.personalInfo as any : {};
    return `${info.firstName || ''} ${info.lastName || ''}`.trim() || 'Customer';
  };

  const getCustomerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCustomerAddress = () => {
    if (!customer?.propertyInfo) return 'Address not available';

    const info = typeof customer.propertyInfo === 'object' ? customer.propertyInfo as any : {};
    return info.address || 'Address not available';
  };

  const getCustomerContact = () => {
    if (!customer?.personalInfo) return { phone: null, email: null };

    const info = typeof customer.personalInfo === 'object' ? customer.personalInfo as any : {};
    return {
      phone: info.phone || null,
      email: customer.user?.email || null,
    };
  };

  const getTotalPremiums = () => {
    return allPolicies.reduce((sum, policy) => sum + (policy.premium || 0), 0);
  };

  const getActivePolicies = () => {
    return allPolicies.filter(policy => policy.status === 'ACTIVE').length;
  };

  const getOpenClaims = () => {
    return allClaims.filter(claim => !['SETTLED', 'REJECTED'].includes(claim.status)).length;
  };

  const handleContactCustomer = (method: 'phone' | 'email') => {
    const contact = getCustomerContact();
    const name = getCustomerName();

    if (method === 'phone' && contact.phone) {
      window.open(`tel:${contact.phone}`);
      toast.success(`Calling ${name}`);
    } else if (method === 'email' && contact.email) {
      window.open(`mailto:${contact.email}`);
      toast.success(`Opening email to ${name}`);
    } else {
      toast.error(`${method === 'phone' ? 'Phone' : 'Email'} not available for ${name}`);
    }
  };

  const handleSendMessage = () => {
    toast.success(`Message feature coming soon`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>

        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/agent/customers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Customer Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The customer you're looking for doesn't exist or you don't have access to view their information.
            </p>
            <Button asChild>
              <Link href="/agent/customers">Return to Customer List</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const customerName = getCustomerName();
  const customerAddress = getCustomerAddress();
  const customerContact = getCustomerContact();
  const totalPremiums = getTotalPremiums();
  const activePolicies = getActivePolicies();
  const openClaims = getOpenClaims();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/agent/customers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-100 text-blue-800">
                {getCustomerInitials(customerName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{customerName}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {customerAddress}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {customerContact.phone && (
            <Button variant="outline" onClick={() => handleContactCustomer('phone')}>
              <PhoneCall className="h-4 w-4 mr-2" />
              Call
            </Button>
          )}
          {customerContact.email && (
            <Button variant="outline" onClick={() => handleContactCustomer('email')}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          )}
          <Button onClick={handleSendMessage}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button asChild>
            <Link href="/agent/quotes">
              <UserPlus className="h-4 w-4 mr-2" />
              New Quote
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{allPolicies.length}</div>
                <p className="text-sm text-muted-foreground">Total Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{activePolicies}</div>
                <p className="text-sm text-muted-foreground">Active Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalPremiums)}</div>
                <p className="text-sm text-muted-foreground">Total Premiums</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ClipboardList className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{allClaims.length}</div>
                <p className="text-sm text-muted-foreground">Total Claims</p>
                {openClaims > 0 && (
                  <p className="text-xs text-red-600">{openClaims} open</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const personalInfo = typeof customer.personalInfo === 'object' ? customer.personalInfo as any : {};
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Full Name</span>
                        <span className="font-medium">{personalInfo.firstName || ''} {personalInfo.lastName || ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date of Birth</span>
                        <span className="font-medium">{formatDate(personalInfo.dateOfBirth)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">{personalInfo.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{customer.user?.email || 'Not provided'}</span>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Property Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Property Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const propertyInfo = typeof customer.propertyInfo === 'object' ? customer.propertyInfo as any : {};
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address</span>
                        <span className="font-medium text-right max-w-48 break-words">{propertyInfo.address || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property Type</span>
                        <span className="font-medium">{propertyInfo.propertyType || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property Value</span>
                        <span className="font-medium">{propertyInfo.propertyValue ? formatCurrency(propertyInfo.propertyValue) : 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Year Built</span>
                        <span className="font-medium">{propertyInfo.yearBuilt || 'Not specified'}</span>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest policy and claim activity</CardDescription>
            </CardHeader>
            <CardContent>
              {allPolicies.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {allPolicies.slice(0, 5).map((policy: any) => (
                    <div key={policy.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Policy {policy.policyNumber}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(policy.createdAt)}</p>
                        </div>
                      </div>
                      <Badge className={statusColors[policy.status as keyof typeof statusColors]}>
                        {policy.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Policies ({allPolicies.length})</h3>
            <Button asChild>
              <Link href="/agent/quotes">
                <UserPlus className="h-4 w-4 mr-2" />
                New Quote
              </Link>
            </Button>
          </div>

          <div className="grid gap-4">
            {allPolicies.map((policy: any) => {
              const StatusIcon = statusIcons[policy.status as keyof typeof statusIcons];
              return (
                <Card key={policy.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Policy {policy.policyNumber}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={statusColors[policy.status as keyof typeof statusColors]}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {policy.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Created {formatDate(policy.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{formatCurrency(policy.premium)}</div>
                        <div className="text-sm text-muted-foreground">Monthly Premium</div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Coverage Amount</span>
                        <div className="font-medium">{formatCurrency(policy.coverageAmount)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Start Date</span>
                        <div className="font-medium">{formatDate(policy.startDate)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">End Date</span>
                        <div className="font-medium">{formatDate(policy.endDate)}</div>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/agent/policies/${policy.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Claims Tab */}
        <TabsContent value="claims" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Claims ({allClaims.length})</h3>
          </div>

          <div className="grid gap-4">
            {allClaims.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="font-semibold mb-2">No Claims Found</h4>
                  <p className="text-muted-foreground">This customer hasn't filed any claims yet.</p>
                </CardContent>
              </Card>
            ) : (
              allClaims.map((claim: any) => (
                <Card key={claim.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                          <ClipboardList className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Claim #{claim.id.slice(-8)}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={claimStatusColors[claim.status as keyof typeof claimStatusColors] || 'bg-gray-100 text-gray-800'}>
                              {claim.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Filed {formatDate(claim.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{formatCurrency(claim.claimAmount || 0)}</div>
                        <div className="text-sm text-muted-foreground">Claim Amount</div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Incident Date</span>
                        <div className="font-medium">{formatDate(claim.incidentDate)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reported Date</span>
                        <div className="font-medium">{formatDate(claim.reportedDate)}</div>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/agent/claims/${claim.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Payments ({allPayments.length})</h3>
          </div>

          <div className="grid gap-4">
            {allPayments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="font-semibold mb-2">No Payments Found</h4>
                  <p className="text-muted-foreground">This customer hasn't made any payments yet.</p>
                </CardContent>
              </Card>
            ) : (
              allPayments.map((payment: any) => (
                <Card key={payment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <CreditCard className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Payment #{payment.id.slice(-8)}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Paid
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(payment.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</div>
                        <div className="text-sm text-muted-foreground">Payment Amount</div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Payment Method</span>
                        <div className="font-medium">{payment.paymentMethod || 'Not specified'}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reference</span>
                        <div className="font-medium">{payment.reference || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status</span>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Communication</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Customer's preferred contact methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {customerContact.phone && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleContactCustomer('phone')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call: {customerContact.phone}
                  </Button>
                )}
                {customerContact.email && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleContactCustomer('email')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email: {customerContact.email}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleSendMessage}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common customer service tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/agent/quotes">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create New Quote
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Follow-up
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

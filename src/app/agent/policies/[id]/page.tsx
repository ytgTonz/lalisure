'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/trpc/react';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Home, 
  User, 
  CreditCard,
  ClipboardList,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PolicyStatus } from '@prisma/client';
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
  EXPIRED: XCircle,
  CANCELLED: XCircle,
  SUSPENDED: XCircle,
};

export default function AgentPolicyDetailPage() {
  const params = useParams();
  const policyId = params.id as string;
  const [newStatus, setNewStatus] = useState<PolicyStatus | ''>('');

  const { data: policies, isLoading } = api.policy.getAllForAgents.useQuery({
    filters: {},
    limit: 1000
  });

  const updateStatusMutation = api.policy.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Policy status updated successfully');
      setNewStatus('');
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    }
  });

  const policy = policies?.policies?.find(p => p.id === policyId);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-insurance-blue mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading policy details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!policy) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Policy not found</p>
          <Button asChild className="mt-4">
            <Link href="/agent/policies">Back to Policies</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

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
    return new Intl.DateTimeFormat('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const propertyInfo = typeof policy.propertyInfo === 'object' ? policy.propertyInfo as any : {};
  const personalInfo = typeof policy.personalInfo === 'object' ? policy.personalInfo as any : {};

  const handleStatusUpdate = () => {
    if (!newStatus) return;
    updateStatusMutation.mutate({
      id: policy.id,
      status: newStatus,
      reason: 'Updated by agent'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/agent/policies">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Policies
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{policy.policyNumber}</h1>
              <Badge className={statusColors[policy.status]}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(policy.status)}
                  {policy.status.replace('_', ' ')}
                </div>
              </Badge>
            </div>
            <p className="text-muted-foreground">Policy Details and Management</p>
          </div>
          {policy.status === 'PENDING_REVIEW' && (
            <div className="flex gap-2">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Approve Policy</SelectItem>
                  <SelectItem value="SUSPENDED">Request Changes</SelectItem>
                  <SelectItem value="CANCELLED">Reject Policy</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleStatusUpdate}
                disabled={!newStatus || updateStatusMutation.isPending}
              >
                Update Status
              </Button>
            </div>
          )}
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-insurance-blue" />
                <span className="text-sm text-muted-foreground">Annual Premium</span>
              </div>
              <div className="text-2xl font-bold text-insurance-blue">
                {formatCurrency(policy.premium)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-insurance-green" />
                <span className="text-sm text-muted-foreground">Coverage</span>
              </div>
              <div className="text-2xl font-bold text-insurance-green">
                {formatCurrency(policy.coverage)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="h-4 w-4 text-insurance-orange" />
                <span className="text-sm text-muted-foreground">Claims</span>
              </div>
              <div className="text-2xl font-bold text-insurance-orange">
                {policy.claims.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-muted-foreground">Payments</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {policy.payments.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="property">Property Details</TabsTrigger>
            <TabsTrigger value="customer">Customer Info</TabsTrigger>
            <TabsTrigger value="claims">Claims ({policy.claims.length})</TabsTrigger>
            <TabsTrigger value="payments">Payments ({policy.payments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Policy Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Policy Number</span>
                      <span className="font-medium">{policy.policyNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium">{policy.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge className={statusColors[policy.status]}>
                        {policy.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deductible</span>
                      <span className="font-medium">{formatCurrency(policy.deductible)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Policy Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span className="font-medium">{formatDate(policy.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date</span>
                      <span className="font-medium">{formatDate(policy.endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium">{formatDate(policy.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="font-medium">{formatDate(policy.updatedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="property" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Address Information</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address</span>
                        <span className="font-medium">{propertyInfo.address || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">City</span>
                        <span className="font-medium">{propertyInfo.city || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Province</span>
                        <span className="font-medium">{propertyInfo.province || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Postal Code</span>
                        <span className="font-medium">{propertyInfo.postalCode || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Property Details</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property Type</span>
                        <span className="font-medium">{propertyInfo.propertyType || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Year Built</span>
                        <span className="font-medium">{propertyInfo.buildYear || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Square Feet</span>
                        <span className="font-medium">{propertyInfo.squareFeet || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bedrooms</span>
                        <span className="font-medium">{propertyInfo.bedrooms || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bathrooms</span>
                        <span className="font-medium">{propertyInfo.bathrooms || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-insurance-blue rounded-full flex items-center justify-center text-white font-semibold">
                      <User className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {personalInfo.firstName && personalInfo.lastName 
                          ? `${personalInfo.firstName} ${personalInfo.lastName}`
                          : 'Customer Name Not Available'
                        }
                      </h3>
                      <p className="text-sm text-muted-foreground">Customer ID: {policy.userId}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                    </div>
                  </div>

                  {personalInfo && Object.keys(personalInfo).length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Personal Details</h4>
                        <div className="text-sm space-y-1">
                          {personalInfo.dateOfBirth && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Date of Birth</span>
                              <span className="font-medium">{formatDate(personalInfo.dateOfBirth)}</span>
                            </div>
                          )}
                          {personalInfo.occupation && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Occupation</span>
                              <span className="font-medium">{personalInfo.occupation}</span>
                            </div>
                          )}
                          {personalInfo.maritalStatus && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Marital Status</span>
                              <span className="font-medium">{personalInfo.maritalStatus}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Claims History</CardTitle>
                <CardDescription>All claims associated with this policy</CardDescription>
              </CardHeader>
              <CardContent>
                {policy.claims.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No claims filed for this policy</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {policy.claims.map((claim) => (
                      <div key={claim.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{claim.claimNumber}</h4>
                          <Badge className={claim.status === 'SETTLED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {claim.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{claim.description}</p>
                        <div className="flex justify-between text-sm">
                          <span>Amount: {claim.amount ? formatCurrency(claim.amount) : 'TBD'}</span>
                          <span>Filed: {formatDate(claim.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>All payments associated with this policy</CardDescription>
              </CardHeader>
              <CardContent>
                {policy.payments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No payments recorded for this policy</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {policy.payments.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{formatCurrency(payment.amount)}</h4>
                          <Badge className={payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Type: {payment.type.replace('_', ' ')}</span>
                          <span>Date: {formatDate(payment.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  Banknote, 
  MapPin, 
  User, 
  FileText,
  Phone,
  Mail,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Car,
  Home,
  Download,
  Eye
} from 'lucide-react';
import { ClaimStatus } from '@prisma/client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LocationMap } from '@/components/ui/location-map';
import { api } from '@/trpc/react';

export default function ClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const claimId = params.id as string;

  const { data: claim, isLoading, error } = api.claim.getById.useQuery(
    { id: claimId },
    { enabled: !!claimId }
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
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

  if (error || !claim) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Claim Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The claim you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link href="/customer/claims">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Claims
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusIcon = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.SUBMITTED:
        return <Clock className="h-5 w-5 text-blue-500" />;
      case ClaimStatus.UNDER_REVIEW:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case ClaimStatus.INVESTIGATING:
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case ClaimStatus.APPROVED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case ClaimStatus.REJECTED:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case ClaimStatus.SETTLED:
        return <CheckCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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

  const getTypeIcon = (type: string) => {
    if (type.includes('AUTO')) return <Car className="h-5 w-5" />;
    if (type.includes('PROPERTY') || type.includes('FIRE') || type.includes('WATER') || type.includes('THEFT')) return <Home className="h-5 w-5" />;
    if (type.includes('PERSONAL') || type.includes('MEDICAL')) return <Shield className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/customer/claims" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Claims
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{claim.claimNumber}</h1>
              <p className="text-muted-foreground">
                {claim.type.replace('_', ' ')} Claim
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(claim.status)}>
              {claim.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Quick Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Claim Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-insurance-blue">
                {formatCurrency(claim.amount)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Incident Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {format(new Date(claim.incidentDate), 'MMM dd')}
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(claim.incidentDate), 'yyyy')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-sm font-bold">
                {claim.policy.policyNumber}
              </div>
              <p className="text-sm text-muted-foreground">
                {claim.policy.type} Insurance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon(claim.status)}
                <span className="font-medium">
                  {claim.status.replace('_', ' ')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Claim Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Incident Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-insurance-blue/10 rounded-lg">
                    {getTypeIcon(claim.type)}
                  </div>
                  <div>
                    <CardTitle>Incident Details</CardTitle>
                    <CardDescription>
                      Information about what happened
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{claim.description}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-1">Date & Time</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(claim.incidentDate), 'EEEE, MMMM dd, yyyy')}</span>
                    </div>
                  </div>

                  {claim.amount && (
                    <div>
                      <h4 className="font-medium mb-1">Estimated Amount</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                        <span>{formatCurrency(claim.amount)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            {claim.incidentLocation && (
              <LocationMap
                location={claim.incidentLocation}
                title="Incident Location"
                showDetails={true}
              />
            )}

            {/* Witnesses */}
            {claim.witnesses && claim.witnesses.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-insurance-green/10 rounded-lg">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Witnesses</CardTitle>
                      <CardDescription>
                        People who witnessed the incident
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {claim.witnesses.map((witness: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="font-medium mb-2">{witness.name}</div>
                        <div className="grid gap-2 md:grid-cols-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{witness.phone}</span>
                          </div>
                          {witness.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{witness.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {claim.documents && claim.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Supporting Documents</CardTitle>
                  <CardDescription>
                    Files uploaded with this claim
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {claim.documents.map((doc: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.type} • {formatFileSize(doc.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={doc.url} download={doc.name}>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Claim Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Claim Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Filed:</span>
                  <span>{format(new Date(claim.createdAt), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{format(new Date(claim.updatedAt), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Documents:</span>
                  <span>{claim.documents?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Witnesses:</span>
                  <span>{claim.witnesses?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Claim Summary
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
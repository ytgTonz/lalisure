'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { PolicyType, PolicyStatus } from '@prisma/client';
import { CheckCircle, Circle, MapPin, User, Car, Home, Shield, DollarSign } from 'lucide-react';

interface PolicyDetailsViewProps {
  policy: {
    id: string;
    policyNumber: string;
    type: PolicyType;
    status: PolicyStatus;
    coverage: number;
    premium: number;
    deductible: number;
    startDate: Date;
    endDate: Date;
    personalInfo?: any;
    vehicleInfo?: any;
    propertyInfo?: any;
    beneficiaries?: string[];
    documents?: any[];
  };
}

export function PolicyDetailsView({ policy }: PolicyDetailsViewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeIcon = (type: PolicyType) => {
    switch (type) {
      case PolicyType.AUTO:
        return <Car className="h-5 w-5" />;
      case PolicyType.HOME:
        return <Home className="h-5 w-5" />;
      case PolicyType.LIFE:
        return <User className="h-5 w-5" />;
      case PolicyType.HEALTH:
        return <Shield className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Policy Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-insurance-blue/10 rounded-lg">
              {getTypeIcon(policy.type)}
            </div>
            <div>
              <CardTitle>Policy Information</CardTitle>
              <CardDescription>
                {policy.type} Insurance Policy Details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Policy Number</label>
              <p className="font-mono text-sm">{policy.policyNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Policy Type</label>
              <p className="capitalize">{policy.type.toLowerCase()} Insurance</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Coverage Amount</label>
              <p className="text-lg font-semibold text-insurance-blue">
                {formatCurrency(policy.coverage)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Annual Premium</label>
              <p className="text-lg font-semibold">
                {formatCurrency(policy.premium)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Deductible</label>
              <p>{formatCurrency(policy.deductible)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Policy Period</label>
              <p>
                {format(new Date(policy.startDate), 'MMM dd, yyyy')} - {format(new Date(policy.endDate), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      {policy.personalInfo && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-insurance-orange/10 rounded-lg">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Policyholder details and contact information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p>{policy.personalInfo.firstName} {policy.personalInfo.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                <p>{format(new Date(policy.personalInfo.dateOfBirth), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p>{policy.personalInfo.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p>{policy.personalInfo.phone}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p>{policy.personalInfo.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {policy.personalInfo.city}, {policy.personalInfo.state} {policy.personalInfo.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Information */}
      {policy.vehicleInfo && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-insurance-green/10 rounded-lg">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Vehicle Information</CardTitle>
                <CardDescription>
                  Details about the insured vehicle
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Vehicle</label>
                <p>{policy.vehicleInfo.year} {policy.vehicleInfo.make} {policy.vehicleInfo.model}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">VIN</label>
                <p className="font-mono text-sm">{policy.vehicleInfo.vin}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">License Plate</label>
                <p className="font-mono">{policy.vehicleInfo.licensePlate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Mileage</label>
                <p>{policy.vehicleInfo.mileage?.toLocaleString()} miles</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Primary Use</label>
                <p className="capitalize">{policy.vehicleInfo.primaryUse?.toLowerCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Parking Location</label>
                <p className="capitalize">{policy.vehicleInfo.parkingLocation?.toLowerCase()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Information */}
      {policy.propertyInfo && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-insurance-blue/10 rounded-lg">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Property Information</CardTitle>
                <CardDescription>
                  Details about the insured property
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Property Type</label>
                <p className="capitalize">{policy.propertyInfo.propertyType?.toLowerCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Year Built</label>
                <p>{policy.propertyInfo.yearBuilt}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Square Footage</label>
                <p>{policy.propertyInfo.squareFootage?.toLocaleString()} sq ft</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Construction Type</label>
                <p className="capitalize">{policy.propertyInfo.constructionType?.toLowerCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Roof Type</label>
                <p className="capitalize">{policy.propertyInfo.roofType?.toLowerCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Foundation Type</label>
                <p className="capitalize">{policy.propertyInfo.foundationType?.toLowerCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Distance to Fire Station</label>
                <p>{policy.propertyInfo.distanceToFireStation} miles</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Distance to Coast</label>
                <p>{policy.propertyInfo.distanceToCoast} miles</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Security Features</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {policy.propertyInfo.securityFeatures?.map((feature: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Beneficiaries */}
      {policy.beneficiaries && policy.beneficiaries.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-insurance-orange/10 rounded-lg">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Beneficiaries</CardTitle>
                <CardDescription>
                  Listed beneficiaries for this policy
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {policy.beneficiaries.map((beneficiary, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <CheckCircle className="h-4 w-4 text-insurance-green" />
                  <span>{beneficiary}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      {policy.documents && policy.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Policy Documents</CardTitle>
            <CardDescription>
              Documents associated with this policy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {policy.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.type} • {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{doc.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
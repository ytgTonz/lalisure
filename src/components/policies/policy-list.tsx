'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PolicyType, PolicyStatus } from '@prisma/client';
import { Calendar, Banknote, Shield, FileText, MoreHorizontal, Edit } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Policy {
  id: string;
  policyNumber: string;
  type: PolicyType;
  status: PolicyStatus;
  premium: number;
  coverage: number;
  startDate: Date;
  endDate: Date;
  propertyInfo?: any;
  vehicleInfo?: any;
  personalInfo?: any;
  claims?: Array<{ id: string; status: string; amount?: number }>;
  payments?: Array<{ id: string; status: string; amount: number }>;
}

interface PolicyListProps {
  policies: Policy[];
  onPolicyUpdated?: (updatedPolicy: Policy) => void;
}

export function PolicyList({ policies, onPolicyUpdated }: PolicyListProps) {
  const getStatusColor = (status: PolicyStatus) => {
    switch (status) {
      case PolicyStatus.ACTIVE:
        return 'bg-insurance-green text-white';
      case PolicyStatus.PENDING_REVIEW:
        return 'bg-insurance-orange text-white';
      case PolicyStatus.DRAFT:
        return 'bg-gray-500 text-white';
      case PolicyStatus.EXPIRED:
        return 'bg-red-500 text-white';
      case PolicyStatus.CANCELLED:
        return 'bg-red-600 text-white';
      case PolicyStatus.SUSPENDED:
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: PolicyType) => {
    switch (type) {
      case PolicyType.HOME:
        return '🏠';
      default:
        return '🏠'; // Default to home icon for all policies
    }
  };

  const getPolicyDescription = (policy: Policy) => {
    switch (policy.type) {
      case PolicyType.HOME:
        if (policy.propertyInfo?.address) {
          const city = policy.propertyInfo?.city ? `, ${policy.propertyInfo.city}` : '';
          return `${policy.propertyInfo.address}${city}`;
        }
        return 'Home Insurance Policy';
      default:
        return 'Home Insurance Policy'; // Default to home insurance for all policies
    }
  };

  const getPropertyType = (policy: Policy) => {
    if (policy.type === PolicyType.HOME && policy.propertyInfo?.propertyType) {
      const typeMap: Record<string, string> = {
        'SINGLE_FAMILY': 'Single Family',
        'TOWNHOUSE': 'Townhouse',
        'CONDO': 'Condominium',
        'APARTMENT': 'Apartment',
        'FARMHOUSE': 'Farmhouse',
        'RURAL_HOMESTEAD': 'Rural Homestead',
        'COUNTRY_ESTATE': 'Country Estate',
        'SMALLHOLDING': 'Smallholding',
        'GAME_FARM_HOUSE': 'Game Farm House',
        'VINEYARD_HOUSE': 'Vineyard House',
        'MOUNTAIN_CABIN': 'Mountain Cabin',
        'COASTAL_COTTAGE': 'Coastal Cottage',
      };
      return typeMap[policy.propertyInfo.propertyType] || policy.propertyInfo.propertyType;
    }
    return null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {policies.map((policy) => (
        <Card key={policy.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTypeIcon(policy.type)}</span>
                <div>
                  <CardTitle className="text-sm font-medium">
                    {policy.policyNumber}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getPolicyDescription(policy)}
                  </p>
                </div>
              </div>
              <Badge className={`text-xs ${getStatusColor(policy.status)}`}>
                {policy.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Property Type */}
            {getPropertyType(policy) && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xs text-muted-foreground">Property Type:</span>
                <span className="font-medium">{getPropertyType(policy)}</span>
              </div>
            )}

            {/* Coverage and Premium */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Coverage</p>
                  <p className="font-medium">{formatCurrency(policy.coverage)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Banknote className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Premium</p>
                  <p className="font-medium">{formatCurrency(policy.premium)}/year</p>
                </div>
              </div>
            </div>

            {/* Policy Period */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Policy Period</p>
                <p className="font-medium">
                  {format(new Date(policy.startDate), 'MMM dd, yyyy')} - 
                  {format(new Date(policy.endDate), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>

            {/* Claims Summary */}
            {policy.claims && policy.claims.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Claims:</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{policy.claims.length}</span>
                  {policy.claims.some(claim => claim.status === 'APPROVED') && (
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Payment Status */}
            {policy.payments && policy.payments.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Payment:</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    {formatCurrency(policy.payments[0]?.amount || 0)}
                  </span>
                  <Badge 
                    variant={policy.payments[0]?.status === 'COMPLETED' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {policy.payments[0]?.status || 'Pending'}
                  </Badge>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/customer/policies/${policy.id}`}>
                  <FileText className="h-4 w-4 mr-1" />
                  View Details
                </Link>
              </Button>

              <div className="flex items-center gap-1">
                {(policy.status === PolicyStatus.DRAFT || policy.status === PolicyStatus.PENDING_REVIEW) && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/customer/policies/${policy.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                )}
                
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        ))}
      </div>

    </>
  );
}
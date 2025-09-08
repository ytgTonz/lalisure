'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PolicyType, PolicyStatus } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { updatePolicySchema, UpdatePolicyInput } from '@/lib/validations/policy';
import { api } from '@/trpc/react';
import { formatDateForDisplay, formatDateForInput } from '@/lib/utils/date-formatter';
import { Save, X, AlertTriangle, Home, Car, User, Shield } from 'lucide-react';

interface Policy {
  id: string;
  policyNumber: string;
  type: PolicyType;
  status: PolicyStatus;
  premium: number;
  coverage: number;
  deductible: number;
  startDate: Date;
  endDate: Date;
  propertyInfo?: any;
  vehicleInfo?: any;
  personalInfo?: any;
}

interface PolicyEditModalProps {
  policy: Policy;
  isOpen: boolean;
  onClose: () => void;
  onPolicyUpdated?: (updatedPolicy: Policy) => void;
}

export function PolicyEditModal({ 
  policy, 
  isOpen, 
  onClose, 
  onPolicyUpdated 
}: PolicyEditModalProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdatePolicyInput>({
    resolver: zodResolver(updatePolicySchema),
    defaultValues: {
      id: policy.id,
      policyType: policy.type,
      coverageAmount: policy.coverage,
      deductible: policy.deductible,
      propertyInfo: policy.propertyInfo || {},
      vehicleInfo: policy.vehicleInfo || {},
      personalInfo: policy.personalInfo || {},
    },
    mode: 'onChange',
  });

  const updatePolicy = api.policy.update.useMutation({
    onSuccess: (updatedPolicy) => {
      onPolicyUpdated?.(updatedPolicy as Policy);
      onClose();
      form.reset();
    },
    onError: (error) => {
      console.error('Failed to update policy:', error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Reset form when policy changes
  useEffect(() => {
    if (policy) {
      form.reset({
        id: policy.id,
        policyType: policy.type,
        coverageAmount: policy.coverage,
        deductible: policy.deductible,
        propertyInfo: policy.propertyInfo || {},
        vehicleInfo: policy.vehicleInfo || {},
        personalInfo: policy.personalInfo || {},
      });
    }
  }, [policy, form]);

  const handleSubmit = async (data: UpdatePolicyInput) => {
    setIsSubmitting(true);
    try {
      await updatePolicy.mutateAsync(data);
    } catch (error) {
      // Error handling is done in mutation callbacks
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const canEditPolicy = policy.status === PolicyStatus.DRAFT || policy.status === PolicyStatus.PENDING_REVIEW;

  const getStatusColor = (status: PolicyStatus) => {
    switch (status) {
      case PolicyStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case PolicyStatus.PENDING_REVIEW:
        return 'bg-yellow-100 text-yellow-800';
      case PolicyStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case PolicyStatus.EXPIRED:
        return 'bg-red-100 text-red-800';
      case PolicyStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case PolicyStatus.SUSPENDED:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Edit Policy</DialogTitle>
              <DialogDescription className="mt-1">
                Update policy details for {policy.policyNumber}
              </DialogDescription>
            </div>
            <Badge className={`text-xs ${getStatusColor(policy.status)}`}>
              {policy.status.replace('_', ' ')}
            </Badge>
          </div>
        </DialogHeader>

        {!canEditPolicy && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              This policy cannot be edited because its status is {policy.status.toLowerCase().replace('_', ' ')}.
              Only draft and pending review policies can be modified.
            </p>
          </div>
        )}

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <ScrollArea className="max-h-[60vh] pr-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="property" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Property
                  </TabsTrigger>
                  <TabsTrigger value="coverage">Coverage</TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Policy Information</CardTitle>
                      <CardDescription>
                        Update fundamental policy details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="policyNumber">Policy Number</Label>
                          <Input
                            id="policyNumber"
                            value={policy.policyNumber}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div>
                          <Label htmlFor="policyType">Policy Type</Label>
                          <Input
                            id="policyType"
                            value={policy.type}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={formatDateForInput(policy.startDate)}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={formatDateForInput(policy.endDate)}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="deductible">Deductible</Label>
                        <Input
                          id="deductible"
                          type="number"
                          placeholder="1000"
                          disabled={!canEditPolicy}
                          {...form.register('deductible', { valueAsNumber: true })}
                        />
                        {form.formState.errors.deductible && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.deductible.message}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Property Information Tab */}
                {policy.type === PolicyType.HOME && (
                  <TabsContent value="property" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Property Details</CardTitle>
                        <CardDescription>
                          Update property-specific information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="propertyInfo.address">Property Address</Label>
                          <Input
                            id="propertyInfo.address"
                            disabled={!canEditPolicy}
                            {...form.register('propertyInfo.address')}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="propertyInfo.city">City</Label>
                            <Input
                              id="propertyInfo.city"
                              disabled={!canEditPolicy}
                              {...form.register('propertyInfo.city')}
                            />
                          </div>
                          <div>
                            <Label htmlFor="propertyInfo.province">Province</Label>
                            <Input
                              id="propertyInfo.province"
                              disabled={!canEditPolicy}
                              {...form.register('propertyInfo.province')}
                            />
                          </div>
                          <div>
                            <Label htmlFor="propertyInfo.postalCode">Postal Code</Label>
                            <Input
                              id="propertyInfo.postalCode"
                              disabled={!canEditPolicy}
                              {...form.register('propertyInfo.postalCode')}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="propertyInfo.propertyType">Property Type</Label>
                            <Select
                              disabled={!canEditPolicy}
                              onValueChange={(value) => form.setValue('propertyInfo.propertyType', value)}
                              defaultValue={policy.propertyInfo?.propertyType}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SINGLE_FAMILY">Single Family Home</SelectItem>
                                <SelectItem value="CONDO">Condominium</SelectItem>
                                <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
                                <SelectItem value="APARTMENT">Apartment</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="propertyInfo.buildYear">Year Built</Label>
                            <Input
                              id="propertyInfo.buildYear"
                              type="number"
                              disabled={!canEditPolicy}
                              {...form.register('propertyInfo.buildYear', { valueAsNumber: true })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="propertyInfo.squareFeet">Square Footage</Label>
                          <Input
                            id="propertyInfo.squareFeet"
                            type="number"
                            disabled={!canEditPolicy}
                            {...form.register('propertyInfo.squareFeet', { valueAsNumber: true })}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}



                {/* Coverage Tab */}
                <TabsContent value="coverage" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Coverage Information</CardTitle>
                      <CardDescription>
                        View current coverage details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Current Coverage</Label>
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(policy.coverage)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Annual Premium</Label>
                          <p className="text-lg font-semibold" suppressHydrationWarning>
                            {formatCurrency(policy.premium)}
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Coverage amounts and premium calculations cannot be modified directly. 
                          To adjust coverage, please contact your agent or create a new quote.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </ScrollArea>

            <DialogFooter>
              <div className="flex justify-between w-full">
                <div className="flex items-center gap-2">
                  {!canEditPolicy && (
                    <p className="text-sm text-muted-foreground">
                      Read-only mode
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  {canEditPolicy && (
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || updatePolicy.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting || updatePolicy.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
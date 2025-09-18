'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updatePolicySchema, UpdatePolicyInput } from '@/lib/validations/policy';
import { api } from '@/trpc/react';
import { formatDateForInput } from '@/lib/utils/date-formatter';
import { useCurrentUser } from '@/hooks/use-current-user';
import { 
  ArrowLeft, 
  Save, 
  X, 
  AlertTriangle, 
  Home, 
  Car, 
  User, 
  Shield,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { PolicyType, PolicyStatus } from '@prisma/client';
import { toast } from 'sonner';

export default function PolicyEditPage() {
  const params = useParams();
  const router = useRouter();
  const policyId = params.id as string;
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: policy, isLoading, error, refetch } = api.policy.getById.useQuery(
    { id: policyId },
    { enabled: !!policyId }
  );

  const { user: currentUser, isLoading: userLoading } = useCurrentUser();

  const form = useForm<UpdatePolicyInput>({
    resolver: zodResolver(updatePolicySchema),
    defaultValues: {
      id: policyId,
      policyType: PolicyType.HOME,
      coverageAmount: 0,
      deductible: 0,
      propertyInfo: {},
      personalInfo: {},
    },
    mode: 'onChange',
  });

  const updatePolicy = api.policy.update.useMutation({
    onSuccess: (updatedPolicy) => {
      toast.success('Policy updated successfully');
      router.push(`/customer/policies/${policyId}`);
    },
    onError: (error) => {
      console.error('Failed to update policy:', error);
      toast.error('Failed to update policy. Please try again.');
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Reset form when policy data loads
  useEffect(() => {
    if (policy && currentUser) {
      form.reset({
        id: policy.id,
        policyType: policy.type,
        coverageAmount: policy.coverage,
        deductible: policy.deductible,
        propertyInfo: {
          address: policy.propertyInfo?.address || '',
          city: policy.propertyInfo?.city || '',
          province: policy.propertyInfo?.province || '',
          postalCode: policy.propertyInfo?.postalCode || '',
          propertyType: policy.propertyInfo?.propertyType || '',
          buildYear: policy.propertyInfo?.buildYear || 0,
          squareFeet: policy.propertyInfo?.squareFeet || 0,
          bedrooms: policy.propertyInfo?.bedrooms || 0,
          bathrooms: policy.propertyInfo?.bathrooms || 0,
        },
        personalInfo: {
          // Use current user's data as primary source, fallback to policy data
          firstName: currentUser.firstName || policy.personalInfo?.firstName || '',
          lastName: currentUser.lastName || policy.personalInfo?.lastName || '',
          dateOfBirth: currentUser.dateOfBirth ? 
            new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : 
            policy.personalInfo?.dateOfBirth || '',
          gender: currentUser.gender || policy.personalInfo?.gender || '',
        },
      });
    }
  }, [policy, currentUser, form]);

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

  const canEditPolicy = policy?.status === PolicyStatus.DRAFT || policy?.status === PolicyStatus.PENDING_REVIEW;

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

  if (isLoading || userLoading) {
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

  if (error || !policy) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Policy Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The policy you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button asChild>
              <Link href="/customer/policies">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Policies
              </Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/customer/policies/${policyId}`} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Policy
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Policy</h1>
              <p className="text-muted-foreground">
                {policy.policyNumber} - {policy.type} Insurance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(policy.status)}>
              {policy.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {!canEditPolicy && (
          <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Policy Cannot Be Edited</p>
              <p className="text-sm text-yellow-700">
                This policy cannot be edited because its status is {policy.status.toLowerCase().replace('_', ' ')}.
                Only draft and pending review policies can be modified.
              </p>
            </div>
          </div>
        )}

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Information</CardTitle>
                <CardDescription>
                  Update your policy details. Some fields may be read-only based on policy status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[70vh] pr-4">
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
                      <TabsTrigger value="personal" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Personal
                      </TabsTrigger>
                      <TabsTrigger value="coverage">Coverage</TabsTrigger>
                    </TabsList>

                    {/* Basic Information Tab */}
                    <TabsContent value="basic" className="space-y-4 mt-6">
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
                        <Label htmlFor="deductible">Deductible (ZAR)</Label>
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
                    </TabsContent>

                    {/* Property Information Tab */}
                    {policy.type === PolicyType.HOME && (
                      <TabsContent value="property" className="space-y-4 mt-6">
                        <div>
                          <Label htmlFor="propertyInfo.address">Property Address</Label>
                          <Input
                            id="propertyInfo.address"
                            disabled={!canEditPolicy}
                            {...form.register('propertyInfo.address')}
                          />
                          {form.formState.errors.propertyInfo?.address && (
                            <p className="text-sm text-red-500 mt-1">
                              {form.formState.errors.propertyInfo.address.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="propertyInfo.city">City</Label>
                            <Input
                              id="propertyInfo.city"
                              disabled={!canEditPolicy}
                              {...form.register('propertyInfo.city')}
                            />
                            {form.formState.errors.propertyInfo?.city && (
                              <p className="text-sm text-red-500 mt-1">
                                {form.formState.errors.propertyInfo.city.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="propertyInfo.province">Province</Label>
                            <Input
                              id="propertyInfo.province"
                              disabled={!canEditPolicy}
                              {...form.register('propertyInfo.province')}
                            />
                            {form.formState.errors.propertyInfo?.province && (
                              <p className="text-sm text-red-500 mt-1">
                                {form.formState.errors.propertyInfo.province.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="propertyInfo.postalCode">Postal Code</Label>
                            <Input
                              id="propertyInfo.postalCode"
                              disabled={!canEditPolicy}
                              {...form.register('propertyInfo.postalCode')}
                            />
                            {form.formState.errors.propertyInfo?.postalCode && (
                              <p className="text-sm text-red-500 mt-1">
                                {form.formState.errors.propertyInfo.postalCode.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="propertyInfo.propertyType">Property Type</Label>
                            <Select
                              disabled={!canEditPolicy}
                              onValueChange={(value) => form.setValue('propertyInfo.propertyType', value)}
                              value={form.watch('propertyInfo.propertyType')}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SINGLE_FAMILY">Single Family Home</SelectItem>
                                <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
                                <SelectItem value="CONDO">Condominium</SelectItem>
                                <SelectItem value="APARTMENT">Apartment</SelectItem>
                                <SelectItem value="FARMHOUSE">Farmhouse</SelectItem>
                                <SelectItem value="RURAL_HOMESTEAD">Rural Homestead</SelectItem>
                                <SelectItem value="COUNTRY_ESTATE">Country Estate</SelectItem>
                                <SelectItem value="SMALLHOLDING">Smallholding</SelectItem>
                                <SelectItem value="GAME_FARM_HOUSE">Game Farm House</SelectItem>
                                <SelectItem value="VINEYARD_HOUSE">Vineyard House</SelectItem>
                                <SelectItem value="MOUNTAIN_CABIN">Mountain Cabin</SelectItem>
                                <SelectItem value="COASTAL_COTTAGE">Coastal Cottage</SelectItem>
                              </SelectContent>
                            </Select>
                            {form.formState.errors.propertyInfo?.propertyType && (
                              <p className="text-sm text-red-500 mt-1">
                                {form.formState.errors.propertyInfo.propertyType.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="propertyInfo.buildYear">Year Built</Label>
                            <Input
                              id="propertyInfo.buildYear"
                              type="number"
                              disabled={!canEditPolicy}
                              {...form.register('propertyInfo.buildYear', { valueAsNumber: true })}
                            />
                            {form.formState.errors.propertyInfo?.buildYear && (
                              <p className="text-sm text-red-500 mt-1">
                                {form.formState.errors.propertyInfo.buildYear.message}
                              </p>
                            )}
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
                          {form.formState.errors.propertyInfo?.squareFeet && (
                            <p className="text-sm text-red-500 mt-1">
                              {form.formState.errors.propertyInfo.squareFeet.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="propertyInfo.bedrooms">Bedrooms</Label>
                            <Input
                              id="propertyInfo.bedrooms"
                              type="number"
                              disabled={!canEditPolicy}
                              {...form.register('propertyInfo.bedrooms', { valueAsNumber: true })}
                            />
                            {form.formState.errors.propertyInfo?.bedrooms && (
                              <p className="text-sm text-red-500 mt-1">
                                {form.formState.errors.propertyInfo.bedrooms.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="propertyInfo.bathrooms">Bathrooms</Label>
                            <Input
                              id="propertyInfo.bathrooms"
                              type="number"
                              disabled={!canEditPolicy}
                              {...form.register('propertyInfo.bathrooms', { valueAsNumber: true })}
                            />
                            {form.formState.errors.propertyInfo?.bathrooms && (
                              <p className="text-sm text-red-500 mt-1">
                                {form.formState.errors.propertyInfo.bathrooms.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    )}

                    {/* Personal Information Tab */}
                    <TabsContent value="personal" className="space-y-4 mt-6">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Personal information is automatically populated from your user profile. 
                          To update this information, please visit your profile settings.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="personalInfo.firstName">First Name</Label>
                          <Input
                            id="personalInfo.firstName"
                            disabled={true}
                            className="bg-muted"
                            {...form.register('personalInfo.firstName')}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            From your user profile
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="personalInfo.lastName">Last Name</Label>
                          <Input
                            id="personalInfo.lastName"
                            disabled={true}
                            className="bg-muted"
                            {...form.register('personalInfo.lastName')}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            From your user profile
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="personalInfo.dateOfBirth">Date of Birth</Label>
                        <Input
                          id="personalInfo.dateOfBirth"
                          type="date"
                          disabled={true}
                          className="bg-muted"
                          {...form.register('personalInfo.dateOfBirth')}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          From your user profile
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="personalInfo.gender">Gender</Label>
                        <Select
                          disabled={true}
                          value={form.watch('personalInfo.gender')}
                        >
                          <SelectTrigger className="bg-muted">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                            <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          From your user profile
                        </p>
                      </div>
                    </TabsContent>

                    {/* Coverage Tab */}
                    <TabsContent value="coverage" className="space-y-4 mt-6">
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
                    </TabsContent>
                  </Tabs>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {!canEditPolicy && (
                  <p className="text-sm text-muted-foreground">
                    Read-only mode - Policy cannot be edited
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/customer/policies/${policyId}`}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Link>
                </Button>
                {canEditPolicy && (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || updatePolicy.isPending}
                  >
                    {isSubmitting || updatePolicy.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSubmitting || updatePolicy.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </DashboardLayout>
  );
}

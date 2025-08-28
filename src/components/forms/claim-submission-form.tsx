'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Upload, X, Plus, MapPin, Phone, Mail, User, FileText, Car, Home, Shield } from 'lucide-react';
import { ClaimType } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/ui/file-upload';
import { LocationInput } from '@/components/ui/location-input';
import { api } from '@/trpc/react';
import { claimSubmissionSchema, type ClaimSubmissionInput } from '@/lib/validations/claim';

interface ClaimSubmissionFormProps {
  policyId?: string;
  onSuccess?: (claim: any) => void;
  onCancel?: () => void;
}

export function ClaimSubmissionForm({ policyId, onSuccess, onCancel }: ClaimSubmissionFormProps) {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [witnesses, setWitnesses] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClaimSubmissionInput>({
    resolver: zodResolver(claimSubmissionSchema),
    defaultValues: {
      policyId: policyId || '',
      witnesses: [],
      documents: [],
    },
  });

  const selectedType = watch('type');

  // Get user's policies for selection
  const { data: policies } = api.policy.getAll.useQuery(
    { limit: 100 },
    { enabled: !policyId }
  );

  const submitClaim = api.claim.submit.useMutation({
    onSuccess: (claim) => {
      if (onSuccess) {
        onSuccess(claim);
      } else {
        router.push(`/claims/${claim.id}`);
      }
    },
  });

  const onSubmit = async (data: ClaimSubmissionInput) => {
    try {
      await submitClaim.mutateAsync({
        ...data,
        documents: uploadedFiles,
        witnesses,
      });
    } catch (error) {
      console.error('Failed to submit claim:', error);
    }
  };

  const addWitness = () => {
    setWitnesses([...witnesses, { name: '', phone: '', email: '' }]);
  };

  const removeWitness = (index: number) => {
    setWitnesses(witnesses.filter((_, i) => i !== index));
  };

  const updateWitness = (index: number, field: string, value: string) => {
    const updated = witnesses.map((witness, i) => 
      i === index ? { ...witness, [field]: value } : witness
    );
    setWitnesses(updated);
  };

  const getTypeIcon = (type: ClaimType) => {
    return <Home className="h-5 w-5" />;
  };

  const getTypeDescription = (type: ClaimType) => {
    const descriptions = {
      [ClaimType.FIRE_DAMAGE]: 'Fire-related property damage',
      [ClaimType.WATER_DAMAGE]: 'Water or flood damage',
      [ClaimType.STORM_DAMAGE]: 'Storm-related property damage',
      [ClaimType.THEFT_BURGLARY]: 'Theft or break-in',
      [ClaimType.VANDALISM]: 'Intentional damage to property',
      [ClaimType.LIABILITY]: 'Personal liability claim',
      [ClaimType.STRUCTURAL_DAMAGE]: 'Structural damage to home',
      [ClaimType.ELECTRICAL_DAMAGE]: 'Electrical system damage',
      [ClaimType.PLUMBING_DAMAGE]: 'Plumbing or water system damage',
      [ClaimType.OTHER]: 'Other type of home claim',
    };
    return descriptions[type] || 'Home insurance claim';
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Policy Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Information</CardTitle>
          <CardDescription>
            Select the policy this claim is for
          </CardDescription>
        </CardHeader>
        <CardContent>
          {policyId ? (
            <Input {...register('policyId')} type="hidden" />
          ) : (
            <div className="space-y-2">
              <Label>Policy</Label>
              <Select onValueChange={(value) => setValue('policyId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a policy" />
                </SelectTrigger>
                <SelectContent>
                  {policies?.policies.map((policy) => (
                    <SelectItem key={policy.id} value={policy.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{policy.policyNumber}</span>
                        <span className="text-muted-foreground">
                          Home Insurance
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.policyId && (
                <p className="text-sm text-red-500">{errors.policyId.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claim Type */}
      <Card>
        <CardHeader>
          <CardTitle>Claim Type</CardTitle>
          <CardDescription>
            What type of claim are you filing?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.values(ClaimType).map((type) => (
              <Label key={type} className="relative">
                <input
                  {...register('type')}
                  type="radio"
                  value={type}
                  className="sr-only"
                />
                <div className={`
                  flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors
                  ${selectedType === type ? 'border-insurance-blue bg-insurance-blue/5' : 'border-border hover:bg-muted/50'}
                `}>
                  <div className={`
                    p-2 rounded-lg
                    ${selectedType === type ? 'bg-insurance-blue text-white' : 'bg-muted'}
                  `}>
                    {getTypeIcon(type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{type.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      {getTypeDescription(type)}
                    </p>
                  </div>
                </div>
              </Label>
            ))}
          </div>
          {errors.type && (
            <p className="text-sm text-red-500 mt-2">{errors.type.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Incident Details */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
          <CardDescription>
            Provide details about what happened
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="description">Description of Incident *</Label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Please describe what happened in detail..."
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="incidentDate">Date of Incident *</Label>
              <Input
                {...register('incidentDate', { valueAsDate: true })}
                id="incidentDate"
                type="date"
                max={format(new Date(), 'yyyy-MM-dd')}
              />
              {errors.incidentDate && (
                <p className="text-sm text-red-500 mt-1">{errors.incidentDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="estimatedAmount">Estimated Amount</Label>
              <Input
                {...register('estimatedAmount', { valueAsNumber: true })}
                id="estimatedAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Location</CardTitle>
          <CardDescription>
            Where did the incident occur?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationInput
            value={watch('incidentLocation')}
            onChange={(location) => setValue('incidentLocation', location)}
            required={true}
          />
          {(errors.incidentLocation?.address || 
            errors.incidentLocation?.city || 
            errors.incidentLocation?.state || 
            errors.incidentLocation?.zipCode) && (
            <div className="mt-2 space-y-1">
              {errors.incidentLocation?.address && (
                <p className="text-sm text-red-500">{errors.incidentLocation.address.message}</p>
              )}
              {errors.incidentLocation?.city && (
                <p className="text-sm text-red-500">{errors.incidentLocation.city.message}</p>
              )}
              {errors.incidentLocation?.state && (
                <p className="text-sm text-red-500">{errors.incidentLocation.state.message}</p>
              )}
              {errors.incidentLocation?.zipCode && (
                <p className="text-sm text-red-500">{errors.incidentLocation.zipCode.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Witnesses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Witnesses</CardTitle>
              <CardDescription>
                Add any witnesses to the incident
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addWitness}>
              <Plus className="h-4 w-4 mr-2" />
              Add Witness
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {witnesses.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No witnesses added
            </p>
          ) : (
            <div className="space-y-4">
              {witnesses.map((witness, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Witness {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWitness(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={witness.name}
                        onChange={(e) => updateWitness(index, 'name', e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={witness.phone}
                        onChange={(e) => updateWitness(index, 'phone', e.target.value)}
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <Label>Email (Optional)</Label>
                      <Input
                        value={witness.email}
                        onChange={(e) => updateWitness(index, 'email', e.target.value)}
                        placeholder="Email address"
                        type="email"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Supporting Documents</CardTitle>
          <CardDescription>
            Upload photos, reports, receipts, and other supporting documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            endpoint="claimDocuments"
            onChange={setUploadedFiles}
            value={uploadedFiles}
            maxFiles={15}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || submitClaim.isPending}
        >
          {isSubmitting || submitClaim.isPending ? 'Submitting...' : 'Submit Claim'}
        </Button>
      </div>
    </form>
  );
}
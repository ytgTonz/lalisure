'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreatePolicyInput } from '@/lib/validations/policy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PropertyInfoStepProps {
  form: UseFormReturn<CreatePolicyInput>;
}

export function PropertyInfoStep({ form }: PropertyInfoStepProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const policyType = watch('policyType');

  if (policyType !== 'HOME') return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="propertyInfo.address">Property Address</Label>
          <Input
            id="propertyInfo.address"
            {...register('propertyInfo.address')}
          />
          {errors.propertyInfo?.address && (
            <p className="text-sm text-red-500">{errors.propertyInfo.address.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="propertyInfo.propertyType">Property Type</Label>
          <Select onValueChange={(value) => setValue('propertyInfo.propertyType', value)}>
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
          {errors.propertyInfo?.propertyType && (
            <p className="text-sm text-red-500">{errors.propertyInfo.propertyType.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="propertyInfo.yearBuilt">Year Built</Label>
          <Input
            id="propertyInfo.yearBuilt"
            type="number"
            {...register('propertyInfo.yearBuilt', { valueAsNumber: true })}
          />
          {errors.propertyInfo?.yearBuilt && (
            <p className="text-sm text-red-500">{errors.propertyInfo.yearBuilt.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="propertyInfo.squareFootage">Square Footage</Label>
          <Input
            id="propertyInfo.squareFootage"
            type="number"
            {...register('propertyInfo.squareFootage', { valueAsNumber: true })}
          />
          {errors.propertyInfo?.squareFootage && (
            <p className="text-sm text-red-500">{errors.propertyInfo.squareFootage.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="propertyInfo.securityFeatures">Security Features</Label>
          <Select onValueChange={(value) => setValue('propertyInfo.securityFeatures', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select security features" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">None</SelectItem>
              <SelectItem value="BASIC">Basic (Locks, Deadbolts)</SelectItem>
              <SelectItem value="ALARM">Security Alarm System</SelectItem>
              <SelectItem value="MONITORED">Monitored Security System</SelectItem>
            </SelectContent>
          </Select>
          {errors.propertyInfo?.securityFeatures && (
            <p className="text-sm text-red-500">{errors.propertyInfo.securityFeatures.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
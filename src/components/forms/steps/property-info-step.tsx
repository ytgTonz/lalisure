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
  const policyType = watch('type');

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

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="propertyInfo.city">City</Label>
            <Input
              id="propertyInfo.city"
              {...register('propertyInfo.city')}
            />
            {errors.propertyInfo?.city && (
              <p className="text-sm text-red-500">{errors.propertyInfo.city.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="propertyInfo.province">Province</Label>
            <Input
              id="propertyInfo.province"
              {...register('propertyInfo.province')}
            />
            {errors.propertyInfo?.province && (
              <p className="text-sm text-red-500">{errors.propertyInfo.province.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="propertyInfo.postalCode">Postal Code</Label>
            <Input
              id="propertyInfo.postalCode"
              {...register('propertyInfo.postalCode')}
            />
            {errors.propertyInfo?.postalCode && (
              <p className="text-sm text-red-500">{errors.propertyInfo.postalCode.message}</p>
            )}
          </div>
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
          <Label htmlFor="propertyInfo.buildYear">Year Built</Label>
          <Input
            id="propertyInfo.buildYear"
            type="number"
            {...register('propertyInfo.buildYear', { valueAsNumber: true })}
          />
          {errors.propertyInfo?.buildYear && (
            <p className="text-sm text-red-500">{errors.propertyInfo.buildYear.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="propertyInfo.squareFeet">Square Footage</Label>
          <Input
            id="propertyInfo.squareFeet"
            type="number"
            {...register('propertyInfo.squareFeet', { valueAsNumber: true })}
          />
          {errors.propertyInfo?.squareFeet && (
            <p className="text-sm text-red-500">{errors.propertyInfo.squareFeet.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="propertyInfo.safetyFeatures">Security Features</Label>
          <Select onValueChange={(value) => setValue('propertyInfo.safetyFeatures', [value])}>
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
          {errors.propertyInfo?.safetyFeatures && (
            <p className="text-sm text-red-500">{errors.propertyInfo.safetyFeatures.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
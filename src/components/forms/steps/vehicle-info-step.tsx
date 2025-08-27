'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreatePolicyInput } from '@/lib/validations/policy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VehicleInfoStepProps {
  form: UseFormReturn<CreatePolicyInput>;
}

export function VehicleInfoStep({ form }: VehicleInfoStepProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const policyType = watch('policyType');

  if (policyType !== 'AUTO') return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="vehicleInfo.make">Make</Label>
          <Input
            id="vehicleInfo.make"
            {...register('vehicleInfo.make')}
          />
          {errors.vehicleInfo?.make && (
            <p className="text-sm text-red-500">{errors.vehicleInfo.make.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="vehicleInfo.model">Model</Label>
          <Input
            id="vehicleInfo.model"
            {...register('vehicleInfo.model')}
          />
          {errors.vehicleInfo?.model && (
            <p className="text-sm text-red-500">{errors.vehicleInfo.model.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="vehicleInfo.year">Year</Label>
          <Input
            id="vehicleInfo.year"
            type="number"
            {...register('vehicleInfo.year', { valueAsNumber: true })}
          />
          {errors.vehicleInfo?.year && (
            <p className="text-sm text-red-500">{errors.vehicleInfo.year.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="vehicleInfo.vin">VIN</Label>
          <Input
            id="vehicleInfo.vin"
            {...register('vehicleInfo.vin')}
          />
          {errors.vehicleInfo?.vin && (
            <p className="text-sm text-red-500">{errors.vehicleInfo.vin.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="vehicleInfo.mileage">Mileage</Label>
          <Input
            id="vehicleInfo.mileage"
            type="number"
            {...register('vehicleInfo.mileage', { valueAsNumber: true })}
          />
          {errors.vehicleInfo?.mileage && (
            <p className="text-sm text-red-500">{errors.vehicleInfo.mileage.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="vehicleInfo.safetyFeatures">Safety Features</Label>
          <Select onValueChange={(value) => setValue('vehicleInfo.safetyFeatures', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select safety features" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BASIC">Basic Safety Features</SelectItem>
              <SelectItem value="ADVANCED">Advanced Safety (ABS, ESC)</SelectItem>
              <SelectItem value="PREMIUM">Premium Safety (Auto-braking, Lane Assist)</SelectItem>
            </SelectContent>
          </Select>
          {errors.vehicleInfo?.safetyFeatures && (
            <p className="text-sm text-red-500">{errors.vehicleInfo.safetyFeatures.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
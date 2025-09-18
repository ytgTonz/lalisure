'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreatePolicyInput } from '@/lib/validations/policy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SOUTH_AFRICAN_PROVINCES } from '@/lib/data/south-africa';

interface RiskFactorsStepProps {
  form: UseFormReturn<CreatePolicyInput>;
}

export function RiskFactorsStep({ form }: RiskFactorsStepProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const policyType = watch('type');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Factors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="riskFactors.demographics.age">Age</Label>
          <Input
            id="riskFactors.demographics.age"
            type="number"
            {...register('riskFactors.demographics.age', { valueAsNumber: true })}
          />
          {errors.riskFactors?.demographics?.age && (
            <p className="text-sm text-red-500">{errors.riskFactors.demographics.age.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="riskFactors.location.province">Province</Label>
            <Select onValueChange={(value) => setValue('riskFactors.location.province', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {SOUTH_AFRICAN_PROVINCES.map((province) => (
                  <SelectItem key={province.code} value={province.code}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.riskFactors?.location?.province && (
              <p className="text-sm text-red-500">{errors.riskFactors.location.province.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="riskFactors.location.postalCode">Postal Code</Label>
            <Input
              id="riskFactors.location.postalCode"
              placeholder="e.g. 8001"
              maxLength={4}
              {...register('riskFactors.location.postalCode')}
            />
            {errors.riskFactors?.location?.postalCode && (
              <p className="text-sm text-red-500">{errors.riskFactors.location.postalCode.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="riskFactors.personal.creditScore">Credit Score</Label>
            <Select onValueChange={(value) => setValue('riskFactors.personal.creditScore', parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select credit score range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="350">Poor (300-579)</SelectItem>
                <SelectItem value="625">Fair (580-669)</SelectItem>
                <SelectItem value="705">Good (670-739)</SelectItem>
                <SelectItem value="770">Very Good (740-799)</SelectItem>
                <SelectItem value="825">Exceptional (800-850)</SelectItem>
              </SelectContent>
            </Select>
            {errors.riskFactors?.personal?.creditScore && (
              <p className="text-sm text-red-500">{errors.riskFactors.personal.creditScore.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="riskFactors.personal.employmentStatus">Employment Status</Label>
            <Select onValueChange={(value) => setValue('riskFactors.personal.employmentStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select employment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employed">Employed</SelectItem>
                <SelectItem value="self_employed">Self Employed</SelectItem>
                <SelectItem value="unemployed">Unemployed</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="riskFactors.personal.monthlyIncome">Monthly Income (R)</Label>
            <Input
              id="riskFactors.personal.monthlyIncome"
              type="number"
              placeholder="e.g. 25000"
              {...register('riskFactors.personal.monthlyIncome', { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label htmlFor="riskFactors.personal.claimsHistory">Previous Claims</Label>
            <Input
              id="riskFactors.personal.claimsHistory"
              type="number"
              placeholder="0"
              min="0"
              max="20"
              {...register('riskFactors.personal.claimsHistory', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Number of insurance claims in the last 5 years
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="riskFactors.location.distanceFromFireStation">Distance from Fire Station (km)</Label>
            <Input
              id="riskFactors.location.distanceFromFireStation"
              type="number"
              placeholder="e.g. 15"
              {...register('riskFactors.location.distanceFromFireStation', { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label htmlFor="riskFactors.location.distanceFromPoliceStation">Distance from Police Station (km)</Label>
            <Input
              id="riskFactors.location.distanceFromPoliceStation"
              type="number"
              placeholder="e.g. 25"
              {...register('riskFactors.location.distanceFromPoliceStation', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="ruralArea"
            onCheckedChange={(checked) => setValue('riskFactors.location.ruralArea', !!checked)}
          />
          <Label htmlFor="ruralArea">This is a rural area</Label>
        </div>
      </CardContent>
    </Card>
  );
}
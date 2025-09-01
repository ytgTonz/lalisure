'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreatePolicyInput } from '@/lib/validations/policy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
            <Input
              id="riskFactors.location.province"
              maxLength={2}
              placeholder="e.g. Western Cape"
              {...register('riskFactors.location.province')}
            />
            {errors.riskFactors?.location?.province && (
              <p className="text-sm text-red-500">{errors.riskFactors.location.province.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="riskFactors.location.postalCode">Postal Code</Label>
            <Input
              id="riskFactors.location.postalCode"
              placeholder="e.g. 8001"
              {...register('riskFactors.location.postalCode')}
            />
            {errors.riskFactors?.location?.postalCode && (
              <p className="text-sm text-red-500">{errors.riskFactors.location.postalCode.message}</p>
            )}
          </div>
        </div>

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
      </CardContent>
    </Card>
  );
}
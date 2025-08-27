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
  const policyType = watch('policyType');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Factors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            {...register('age', { valueAsNumber: true })}
          />
          {errors.age && <p className="text-sm text-red-500">{errors.age.message}</p>}
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register('location')}
          />
          {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
        </div>

        <div>
          <Label htmlFor="creditScore">Credit Score</Label>
          <Select onValueChange={(value) => setValue('creditScore', parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select credit score range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="300">Poor (300-579)</SelectItem>
              <SelectItem value="580">Fair (580-669)</SelectItem>
              <SelectItem value="670">Good (670-739)</SelectItem>
              <SelectItem value="740">Very Good (740-799)</SelectItem>
              <SelectItem value="800">Exceptional (800-850)</SelectItem>
            </SelectContent>
          </Select>
          {errors.creditScore && <p className="text-sm text-red-500">{errors.creditScore.message}</p>}
        </div>

        <div>
          <Label htmlFor="previousClaims">Previous Claims (last 5 years)</Label>
          <Input
            id="previousClaims"
            type="number"
            {...register('previousClaims', { valueAsNumber: true })}
          />
          {errors.previousClaims && <p className="text-sm text-red-500">{errors.previousClaims.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
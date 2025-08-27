'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreatePolicyInput } from '@/lib/validations/policy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PersonalInfoStepProps {
  form: UseFormReturn<CreatePolicyInput>;
}

export function PersonalInfoStep({ form }: PersonalInfoStepProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const policyType = watch('policyType');

  if (policyType !== 'LIFE' && policyType !== 'HEALTH') return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="personalInfo.firstName">First Name</Label>
          <Input
            id="personalInfo.firstName"
            {...register('personalInfo.firstName')}
          />
          {errors.personalInfo?.firstName && (
            <p className="text-sm text-red-500">{errors.personalInfo.firstName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="personalInfo.lastName">Last Name</Label>
          <Input
            id="personalInfo.lastName"
            {...register('personalInfo.lastName')}
          />
          {errors.personalInfo?.lastName && (
            <p className="text-sm text-red-500">{errors.personalInfo.lastName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="personalInfo.dateOfBirth">Date of Birth</Label>
          <Input
            id="personalInfo.dateOfBirth"
            type="date"
            {...register('personalInfo.dateOfBirth')}
          />
          {errors.personalInfo?.dateOfBirth && (
            <p className="text-sm text-red-500">{errors.personalInfo.dateOfBirth.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="personalInfo.gender">Gender</Label>
          <Select onValueChange={(value) => setValue('personalInfo.gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
              <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
          {errors.personalInfo?.gender && (
            <p className="text-sm text-red-500">{errors.personalInfo.gender.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="personalInfo.height">Height (cm)</Label>
          <Input
            id="personalInfo.height"
            type="number"
            {...register('personalInfo.height', { valueAsNumber: true })}
          />
          {errors.personalInfo?.height && (
            <p className="text-sm text-red-500">{errors.personalInfo.height.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="personalInfo.weight">Weight (kg)</Label>
          <Input
            id="personalInfo.weight"
            type="number"
            {...register('personalInfo.weight', { valueAsNumber: true })}
          />
          {errors.personalInfo?.weight && (
            <p className="text-sm text-red-500">{errors.personalInfo.weight.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="personalInfo.smokingStatus">Smoking Status</Label>
          <Select onValueChange={(value) => setValue('personalInfo.smokingStatus', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select smoking status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEVER">Never smoked</SelectItem>
              <SelectItem value="FORMER">Former smoker</SelectItem>
              <SelectItem value="CURRENT">Current smoker</SelectItem>
            </SelectContent>
          </Select>
          {errors.personalInfo?.smokingStatus && (
            <p className="text-sm text-red-500">{errors.personalInfo.smokingStatus.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="personalInfo.medicalHistory">Medical History</Label>
          <Input
            id="personalInfo.medicalHistory"
            {...register('personalInfo.medicalHistory')}
            placeholder="Brief summary of relevant medical history"
          />
          {errors.personalInfo?.medicalHistory && (
            <p className="text-sm text-red-500">{errors.personalInfo.medicalHistory.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
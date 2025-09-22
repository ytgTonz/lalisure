'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { InsuranceHelpButtons } from '@/components/ui/help-button';
import { createPolicySchema, CreatePolicyInput } from '@/lib/validations/policy';
import { PolicyType } from '@prisma/client';

export default function ValidationErrorsDemoPage() {
  const [showErrors, setShowErrors] = useState(false);

  const form = useForm<CreatePolicyInput>({
    resolver: zodResolver(createPolicySchema),
    mode: 'onChange',
    defaultValues: {
      type: PolicyType.HOME,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      deductible: 1000,
      coverage: {
        dwelling: 0, // This will trigger validation error
        personalProperty: 0, // This will trigger validation error
        liability: 0, // This will trigger validation error
        medicalPayments: 0, // This will trigger validation error
      },
      riskFactors: {
        location: { province: '', postalCode: '' },
        demographics: { age: 25 },
        personal: {},
      },
      propertyInfo: {
        address: '',
        city: '',
        province: '',
        postalCode: '',
        propertyType: '',
        buildYear: 2024,
        squareFeet: 1000,
        safetyFeatures: [],
      },
    },
  });

  const { register, handleSubmit, formState: { errors, isValid }, watch, setValue } = form;
  const watchedCoverage = watch('coverage') || {};

  // Helper functions
  const getErrorMessage = (fieldPath: string) => {
    const error = errors.coverage?.[fieldPath as keyof typeof errors.coverage];
    return error?.message;
  };

  const hasError = (fieldPath: string) => {
    return !!errors.coverage?.[fieldPath as keyof typeof errors.coverage];
  };

  const onSubmit = (data: CreatePolicyInput) => {
    console.log('Form submitted:', data);
    alert('Form submitted successfully! Check console for data.');
  };

  const triggerErrors = () => {
    setValue('coverage.dwelling', 1000); // Below minimum
    setValue('coverage.personalProperty', 5000); // Below minimum
    setValue('coverage.liability', 50000); // Below minimum
    setValue('coverage.medicalPayments', 500); // Below minimum
    setShowErrors(true);
  };

  const fixErrors = () => {
    setValue('coverage.dwelling', 300000);
    setValue('coverage.personalProperty', 150000);
    setValue('coverage.liability', 500000);
    setValue('coverage.medicalPayments', 5000);
    setShowErrors(false);
  };

  const hasValidationErrors = Object.keys(errors).length > 0 || 
    (errors.coverage && Object.keys(errors.coverage).length > 0);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Validation Errors Demo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This demo shows how validation errors are displayed to users when they enter improper values. 
          Try entering invalid amounts or use the buttons below to trigger/fix errors.
        </p>
      </div>

      {/* Demo Controls */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
          <CardDescription>
            Use these buttons to test validation error display
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={triggerErrors} variant="destructive">
              <XCircle className="h-4 w-4 mr-2" />
              Trigger Validation Errors
            </Button>
            <Button onClick={fixErrors} variant="default">
              <CheckCircle className="h-4 w-4 mr-2" />
              Fix All Errors
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Form Status:</span>
            {isValid ? (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                Valid
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 text-sm">
                <XCircle className="h-4 w-4" />
                Has Errors
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Home Insurance Coverage
              </CardTitle>
              <CardDescription>
                Enter coverage amounts. Invalid values will show error messages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Summary */}
              {hasValidationErrors && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-red-800 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Please fix the following errors:
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      {errors.coverage?.dwelling && (
                        <p className="text-xs text-red-700">• Dwelling Coverage: {errors.coverage.dwelling.message}</p>
                      )}
                      {errors.coverage?.personalProperty && (
                        <p className="text-xs text-red-700">• Personal Property: {errors.coverage.personalProperty.message}</p>
                      )}
                      {errors.coverage?.liability && (
                        <p className="text-xs text-red-700">• Liability Coverage: {errors.coverage.liability.message}</p>
                      )}
                      {errors.coverage?.medicalPayments && (
                        <p className="text-xs text-red-700">• Medical Payments: {errors.coverage.medicalPayments.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {/* Dwelling Coverage */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="dwelling">Dwelling Coverage</Label>
                    <InsuranceHelpButtons.DwellingCoverage />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">R</span>
                    <Input
                      id="dwelling"
                      type="number"
                      placeholder="300000"
                      className={`pl-8 ${hasError('dwelling') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...register('coverage.dwelling', { 
                        valueAsNumber: true,
                        required: 'Dwelling coverage is required',
                        min: { value: 50000, message: 'Minimum dwelling coverage is R50,000' },
                        max: { value: 5000000, message: 'Maximum dwelling coverage is R5,000,000' }
                      })}
                    />
                  </div>
                  {hasError('dwelling') ? (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <p className="text-xs text-red-500">{getErrorMessage('dwelling')}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      Coverage for your home structure (R50,000 - R5,000,000)
                    </p>
                  )}
                </div>

                {/* Personal Property */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="personalProperty">Personal Property</Label>
                    <InsuranceHelpButtons.PersonalProperty />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">R</span>
                    <Input
                      id="personalProperty"
                      type="number"
                      placeholder="150000"
                      className={`pl-8 ${hasError('personalProperty') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...register('coverage.personalProperty', { 
                        valueAsNumber: true,
                        min: { value: 10000, message: 'Minimum personal property coverage is R10,000' },
                        max: { value: 1000000, message: 'Maximum personal property coverage is R1,000,000' }
                      })}
                    />
                  </div>
                  {hasError('personalProperty') ? (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <p className="text-xs text-red-500">{getErrorMessage('personalProperty')}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      Coverage for belongings and furniture (R10,000 - R1,000,000)
                    </p>
                  )}
                </div>

                {/* Liability Coverage */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="liability">Liability Coverage</Label>
                    <InsuranceHelpButtons.LiabilityCoverage />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">R</span>
                    <Input
                      id="liability"
                      type="number"
                      placeholder="500000"
                      className={`pl-8 ${hasError('liability') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...register('coverage.liability', { 
                        valueAsNumber: true,
                        min: { value: 100000, message: 'Minimum liability coverage is R100,000' },
                        max: { value: 2000000, message: 'Maximum liability coverage is R2,000,000' }
                      })}
                    />
                  </div>
                  {hasError('liability') ? (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <p className="text-xs text-red-500">{getErrorMessage('liability')}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      Protection against lawsuits and claims (R100,000 - R2,000,000)
                    </p>
                  )}
                </div>

                {/* Medical Payments */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="medicalPayments">Medical Payments</Label>
                    <InsuranceHelpButtons.MedicalPayments />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">R</span>
                    <Input
                      id="medicalPayments"
                      type="number"
                      placeholder="5000"
                      className={`pl-8 ${hasError('medicalPayments') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...register('coverage.medicalPayments', { 
                        valueAsNumber: true,
                        min: { value: 1000, message: 'Minimum medical payments coverage is R1,000' },
                        max: { value: 50000, message: 'Maximum medical payments coverage is R50,000' }
                      })}
                    />
                  </div>
                  {hasError('medicalPayments') ? (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <p className="text-xs text-red-500">{getErrorMessage('medicalPayments')}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      Medical expenses for injuries on your property (R1,000 - R50,000)
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button 
              type="submit" 
              disabled={!isValid}
              className="min-w-32"
            >
              {isValid ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Policy
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Fix Errors First
                </>
              )}
            </Button>
          </div>
        </form>
      </FormProvider>

      {/* Validation Rules */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Validation Rules</CardTitle>
          <CardDescription>
            These are the validation rules applied to each field
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">Dwelling Coverage</h4>
              <p className="text-sm text-muted-foreground">Required, minimum R50,000, maximum R5,000,000</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium">Personal Property</h4>
              <p className="text-sm text-muted-foreground">Optional, minimum R10,000, maximum R1,000,000</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-medium">Liability Coverage</h4>
              <p className="text-sm text-muted-foreground">Optional, minimum R100,000, maximum R2,000,000</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-medium">Medical Payments</h4>
              <p className="text-sm text-muted-foreground">Optional, minimum R1,000, maximum R50,000</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

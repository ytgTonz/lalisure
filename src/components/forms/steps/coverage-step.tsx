'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PolicyType } from '@prisma/client';
import { CreatePolicyInput } from '@/lib/validations/policy';
import { Shield, Home, Car, Heart, AlertCircle } from 'lucide-react';
import { InsuranceHelpButtons } from '@/components/ui/help-button';

interface CoverageStepProps {
  policyType: PolicyType;
}

export function CoverageStep({ policyType }: CoverageStepProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext<CreatePolicyInput>();
  
  const watchedCoverage = watch('coverage') || {};
  const watchedDeductible = watch('deductible');

  // Helper function to display error messages
  const getErrorMessage = (fieldPath: string) => {
    const error = errors.coverage?.[fieldPath as keyof typeof errors.coverage];
    return error?.message;
  };

  // Helper function to check if field has error
  const hasError = (fieldPath: string) => {
    return !!errors.coverage?.[fieldPath as keyof typeof errors.coverage];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderHomeCoverage = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Home Insurance Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
    </div>
  );

  const renderAutoCoverage = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Auto Insurance Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="liability">Liability Coverage</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">R</span>
                <Input
                  id="liability"
                  type="number"
                  placeholder="100000"
                  className="pl-8"
                  {...register('coverage.liability', { 
                    valueAsNumber: true,
                    required: 'Liability coverage is required'
                  })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Covers damage to others and their property
              </p>
            </div>

            <div>
              <Label htmlFor="collision">Collision Coverage</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">R</span>
                <Input
                  id="collision"
                  type="number"
                  placeholder="50000"
                  className="pl-8"
                  {...register('coverage.collision', { valueAsNumber: true })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Covers damage to your vehicle from collisions
              </p>
            </div>

            <div>
              <Label htmlFor="comprehensive">Comprehensive Coverage</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">R</span>
                <Input
                  id="comprehensive"
                  type="number"
                  placeholder="50000"
                  className="pl-8"
                  {...register('coverage.comprehensive', { valueAsNumber: true })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Covers theft, vandalism, and weather damage
              </p>
            </div>

            <div>
              <Label htmlFor="medicalPayments">Medical Payments</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">R</span>
                <Input
                  id="medicalPayments"
                  type="number"
                  placeholder="10000"
                  className="pl-8"
                  {...register('coverage.medicalPayments', { valueAsNumber: true })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Medical expenses for you and passengers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLifeCoverage = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Life Insurance Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="deathBenefit">Death Benefit</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">R</span>
              <Input
                id="deathBenefit"
                type="number"
                placeholder="500000"
                className="pl-8"
                {...register('coverage.deathBenefit', { 
                  valueAsNumber: true,
                  required: 'Death benefit amount is required'
                })}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              The amount paid to beneficiaries upon your death
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Policy Term</Label>
              <Select onValueChange={(value) => setValue('personalInfo.policyTerm', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 Years</SelectItem>
                  <SelectItem value="20">20 Years</SelectItem>
                  <SelectItem value="30">30 Years</SelectItem>
                  <SelectItem value="whole">Whole Life</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Premium Payment</Label>
              <Select onValueChange={(value) => setValue('personalInfo.paymentFrequency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCoverageByType = () => {
    switch (policyType) {
      case PolicyType.HOME:
        return renderHomeCoverage();
      default:
        return renderHomeCoverage(); // Default to home coverage for all policies
    }
  };

  // Check if there are any validation errors
  const hasValidationErrors = Object.keys(errors).length > 0 || 
    (errors.coverage && Object.keys(errors.coverage).length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Coverage Options</h3>
        <p className="text-muted-foreground">
          Select the coverage amounts that best protect your needs. Higher coverage provides better protection but increases your premium.
        </p>
      </div>

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
              {errors.deductible && (
                <p className="text-xs text-red-700">• Deductible: {errors.deductible.message}</p>
              )}
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

      {renderCoverageByType()}

      {/* Deductible Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deductible</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="deductible">Your Deductible Amount</Label>
              <InsuranceHelpButtons.Deductible />
            </div>
            <Select 
              value={watchedDeductible?.toString()} 
              onValueChange={(value) => setValue('deductible', parseInt(value), { shouldValidate: true })}
            >
              <SelectTrigger className={errors.deductible ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}>
                <SelectValue placeholder="Select deductible" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="250">{formatCurrency(250)}</SelectItem>
                <SelectItem value="500">{formatCurrency(500)}</SelectItem>
                <SelectItem value="1000">{formatCurrency(1000)}</SelectItem>
                <SelectItem value="2500">{formatCurrency(2500)}</SelectItem>
                <SelectItem value="5000">{formatCurrency(5000)}</SelectItem>
              </SelectContent>
            </Select>
            {errors.deductible ? (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <p className="text-xs text-red-500">{errors.deductible.message}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Higher deductibles typically result in lower monthly premiums
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Coverage Summary */}
      {Object.keys(watchedCoverage).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Coverage Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(watchedCoverage).map(([key, value]) => {
                if (!value) return null;
                return (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="font-medium" suppressHydrationWarning>
                      {formatCurrency(value as number)}
                    </span>
                  </div>
                );
              })}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Total Coverage:</span>
                  <span suppressHydrationWarning>
                    {formatCurrency(
                      Object.values(watchedCoverage).reduce((sum, value) => sum + (value as number || 0), 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Deductible:</span>
                  <span suppressHydrationWarning>
                    {formatCurrency(watchedDeductible || 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
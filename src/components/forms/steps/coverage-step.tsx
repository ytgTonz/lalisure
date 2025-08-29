'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PolicyType } from '@prisma/client';
import { CreatePolicyInput } from '@/lib/validations/policy';
import { DollarSign, Shield, Home, Car, Heart } from 'lucide-react';

interface CoverageStepProps {
  policyType: PolicyType;
}

export function CoverageStep({ policyType }: CoverageStepProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext<CreatePolicyInput>();
  
  const watchedCoverage = watch('coverage') || {};
  const watchedDeductible = watch('deductible');

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
              <Label htmlFor="dwelling">Dwelling Coverage</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dwelling"
                  type="number"
                  placeholder="300000"
                  className="pl-8"
                  {...register('coverage.dwelling', { 
                    valueAsNumber: true,
                    required: 'Dwelling coverage is required'
                  })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Coverage for your home structure
              </p>
            </div>

            <div>
              <Label htmlFor="personalProperty">Personal Property</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="personalProperty"
                  type="number"
                  placeholder="150000"
                  className="pl-8"
                  {...register('coverage.personalProperty', { valueAsNumber: true })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Coverage for belongings and furniture
              </p>
            </div>

            <div>
              <Label htmlFor="liability">Liability Coverage</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="liability"
                  type="number"
                  placeholder="500000"
                  className="pl-8"
                  {...register('coverage.liability', { valueAsNumber: true })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Protection against lawsuits and claims
              </p>
            </div>

            <div>
              <Label htmlFor="medicalPayments">Medical Payments</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="medicalPayments"
                  type="number"
                  placeholder="5000"
                  className="pl-8"
                  {...register('coverage.medicalPayments', { valueAsNumber: true })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Medical expenses for injuries on your property
              </p>
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
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
      case PolicyType.AUTO:
        return renderAutoCoverage();
      case PolicyType.LIFE:
        return renderLifeCoverage();
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Basic Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="coverage">Coverage Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="coverage"
                    type="number"
                    placeholder="100000"
                    className="pl-8"
                    {...register('coverage.liability', { 
                      valueAsNumber: true,
                      required: 'Coverage amount is required'
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Coverage Options</h3>
        <p className="text-muted-foreground">
          Select the coverage amounts that best protect your needs. Higher coverage provides better protection but increases your premium.
        </p>
      </div>

      {renderCoverageByType()}

      {/* Deductible Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deductible</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="deductible">Your Deductible Amount</Label>
            <Select 
              value={watchedDeductible?.toString()} 
              onValueChange={(value) => setValue('deductible', parseInt(value), { shouldValidate: true })}
            >
              <SelectTrigger>
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
            <p className="text-xs text-muted-foreground mt-1">
              Higher deductibles typically result in lower monthly premiums
            </p>
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
                    <span className="font-medium">{formatCurrency(value as number)}</span>
                  </div>
                );
              })}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Total Coverage:</span>
                  <span>
                    {formatCurrency(
                      Object.values(watchedCoverage).reduce((sum, value) => sum + (value as number || 0), 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Deductible:</span>
                  <span>{formatCurrency(watchedDeductible || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, FileText, Calculator } from 'lucide-react';
import { PolicyType } from '@prisma/client';

// Step components
import { PolicyTypeStep } from './steps/policy-type-step';
import { CoverageStep } from './steps/coverage-step';
import { RiskFactorsStep } from './steps/risk-factors-step';
import { PropertyInfoStep } from './steps/property-info-step';
import { VehicleInfoStep } from './steps/vehicle-info-step';
import { PersonalInfoStep } from './steps/personal-info-step';
import { ReviewStep } from './steps/review-step';

import { createPolicySchema, CreatePolicyInput } from '@/lib/validations/policy';
import { api } from '@/trpc/react';

interface PolicyWizardProps {
  onComplete?: (policy: any) => void;
  onCancel?: () => void;
  initialData?: Partial<CreatePolicyInput>;
}

const steps = [
  { 
    id: 'type', 
    title: 'Policy Type', 
    description: 'Choose the type of insurance policy' 
  },
  { 
    id: 'coverage', 
    title: 'Coverage Options', 
    description: 'Select your coverage amounts' 
  },
  { 
    id: 'risk-factors', 
    title: 'Risk Assessment', 
    description: 'Provide information for risk evaluation' 
  },
  { 
    id: 'details', 
    title: 'Policy Details', 
    description: 'Additional information based on policy type' 
  },
  { 
    id: 'review', 
    title: 'Review & Submit', 
    description: 'Review your policy details and submit' 
  },
];

export function PolicyWizard({ onComplete, onCancel, initialData }: PolicyWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [quote, setQuote] = useState<any>(null);

  const form = useForm<CreatePolicyInput>({
    resolver: zodResolver(createPolicySchema),
    defaultValues: {
      type: PolicyType.HOME,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      deductible: 1000,
      coverage: {},
      riskFactors: {
        location: { state: '', zipCode: '' },
        demographics: { age: 25 },
      },
      ...initialData,
    },
    mode: 'onChange',
  });

  const generateQuote = api.policy.generateQuote.useMutation();
  const createPolicy = api.policy.create.useMutation();

  const watchedType = form.watch('type');
  const isStepValid = () => {
    // Basic validation for each step
    switch (currentStep) {
      case 0: // Type
        return !!watchedType;
      case 1: // Coverage
        const coverage = form.getValues('coverage');
        return Object.keys(coverage).length > 0;
      case 2: // Risk factors
        const riskFactors = form.getValues('riskFactors');
        return riskFactors.location.state && riskFactors.location.zipCode;
      case 3: // Details
        if (watchedType === PolicyType.HOME) {
          const propertyInfo = form.getValues('propertyInfo');
          return propertyInfo && propertyInfo.address;
        }
        if (watchedType === PolicyType.AUTO) {
          const vehicleInfo = form.getValues('vehicleInfo');
          return vehicleInfo && vehicleInfo.make && vehicleInfo.model;
        }
        if (watchedType === PolicyType.LIFE) {
          const personalInfo = form.getValues('personalInfo');
          return personalInfo && personalInfo.occupation;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      // Generate quote when moving to review step
      if (currentStep === steps.length - 2) {
        const formData = form.getValues();
        try {
          const quoteResult = await generateQuote.mutateAsync(formData);
          setQuote(quoteResult);
        } catch (error) {
          console.error('Failed to generate quote:', error);
        }
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = form.getValues();
      const policy = await createPolicy.mutateAsync(formData);
      onComplete?.(policy);
    } catch (error) {
      console.error('Failed to create policy:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <PolicyTypeStep />;
      case 1:
        return <CoverageStep policyType={watchedType} />;
      case 2:
        return <RiskFactorsStep />;
      case 3:
        return renderDetailsStep();
      case 4:
        return <ReviewStep quote={quote} />;
      default:
        return null;
    }
  };

  const renderDetailsStep = () => {
    switch (watchedType) {
      case PolicyType.HOME:
        return <PropertyInfoStep />;
      case PolicyType.AUTO:
        return <VehicleInfoStep />;
      case PolicyType.LIFE:
        return <PersonalInfoStep />;
      default:
        return (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No additional details required for this policy type.</p>
          </div>
        );
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <FormProvider {...form}>
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Create New Policy</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
            </div>
          </div>
          
          <Progress value={progress} className="mb-4" />
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{steps[currentStep].title}</h2>
              <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
            </div>
            
            {quote && (
              <div className="flex items-center gap-2 bg-insurance-blue/10 text-insurance-blue px-3 py-1 rounded-full text-sm">
                <Calculator className="h-4 w-4" />
                <span>Premium: ${quote.monthlyPremium}/month</span>
              </div>
            )}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            )}
            
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={createPolicy.isPending}
                className="flex items-center gap-2"
              >
                {createPolicy.isPending ? 'Creating Policy...' : 'Create Policy'}
                <FileText className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
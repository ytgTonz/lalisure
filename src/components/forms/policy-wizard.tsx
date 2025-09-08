'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, FileText, Calculator } from 'lucide-react';
import { PolicyType } from '@prisma/client';

// Step components
import { CoverageStep } from './steps/coverage-step';
import { RiskFactorsStep } from './steps/risk-factors-step';
import { PropertyInfoStep } from './steps/property-info-step';
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
    id: 'coverage', 
    title: 'Coverage Options', 
    description: 'Select your home insurance coverage amounts' 
  },
  { 
    id: 'risk-factors', 
    title: 'Risk Assessment', 
    description: 'Provide information for risk evaluation' 
  },
  { 
    id: 'property-details', 
    title: 'Property Details', 
    description: 'Information about your home' 
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
  const [isInitialized, setIsInitialized] = useState(false);

  const form = useForm<CreatePolicyInput>({
    resolver: zodResolver(createPolicySchema),
    defaultValues: {
      type: PolicyType.HOME,
      startDate: new Date(2024, 0, 1), // Static date for SSR
      endDate: new Date(2024, 11, 31), // Static date for SSR
      deductible: 1000,
      coverage: {},
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
        buildYear: 2024, // Static year for SSR
        squareFeet: 1000,
        safetyFeatures: [],
      },
      ...initialData,
    },
    mode: 'onChange',
  });

  // Initialize dynamic dates client-side to prevent hydration mismatches
  useEffect(() => {
    if (!isInitialized) {
      const now = new Date();
      const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      const currentYear = now.getFullYear();
      
      form.setValue('startDate', now);
      form.setValue('endDate', oneYearLater);
      form.setValue('propertyInfo.buildYear', currentYear);
      
      setIsInitialized(true);
    }
  }, [form, isInitialized]);

  const generateQuote = api.policy.generateQuote.useMutation();
  const createPolicy = api.policy.create.useMutation();

  const isStepValid = () => {
    // Basic validation for each step
    switch (currentStep) {
      case 0: // Coverage
        const coverage = form.getValues('coverage');
        return coverage && Object.keys(coverage).some(key => coverage[key] > 0);
      case 1: // Risk factors
        const riskFactors = form.getValues('riskFactors');
        return riskFactors?.location?.province && riskFactors?.location?.postalCode;
      case 2: // Property Details
        const propertyInfo = form.getValues('propertyInfo');
        return propertyInfo?.address && propertyInfo?.city && propertyInfo?.province && propertyInfo?.postalCode;
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
        return <CoverageStep policyType={PolicyType.HOME} />;
      case 1:
        return <RiskFactorsStep form={form} />;
      case 2:
        return <PropertyInfoStep form={form} />;
      case 3:
        return <ReviewStep form={form} calculatedPremium={quote?.monthlyPremium} />;
      default:
        return null;
    }
  };


  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <FormProvider {...form}>
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Create Home Insurance Policy</h1>
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
                <span suppressHydrationWarning>
                  Premium: R{quote.monthlyPremium}/month
                </span>
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
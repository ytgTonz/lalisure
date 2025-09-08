'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Home, DollarSign, Calculator, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';

interface CoverageCalculatorProps {
  onPremiumChange?: (premium: number, coverage: CoverageOptions) => void;
}

interface CoverageOptions {
  dwelling: number;
  contents: number;
  deductible: number;
  location: string;
  propertyAge: string;
  securityFeatures: string[];
}


export function CoverageCalculator({ onPremiumChange }: CoverageCalculatorProps) {
  const [coverage, setCoverage] = useState<CoverageOptions>({
    dwelling: 500000,
    contents: 250000,
    deductible: 5000,
    location: 'medium_risk',
    propertyAge: 'under_10',
    securityFeatures: []
  });

  const [premium, setPremium] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const validateCoverage = (coverageOptions: CoverageOptions) => {
    const errors: string[] = [];

    if (coverageOptions.dwelling < 100000) {
      errors.push('Dwelling coverage should be at least R100,000 for adequate protection');
    }

    if (coverageOptions.contents > coverageOptions.dwelling * 0.5) {
      errors.push('Contents coverage should not exceed 50% of dwelling coverage');
    }

    if (coverageOptions.deductible > coverageOptions.dwelling * 0.1) {
      errors.push('Deductible should not exceed 10% of dwelling coverage');
    }

    return errors;
  };

  const calculatePremium = async (coverageOptions: CoverageOptions) => {
    setIsCalculating(true);

    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    // Enhanced premium calculation
    const dwellingRate = 0.004; // Base rate: 0.4% of dwelling value
    const contentsRate = 0.003; // Contents rate: 0.3% of contents value

    let basePremium = (coverageOptions.dwelling * dwellingRate) +
                     (coverageOptions.contents * contentsRate);

    // Location adjustment
    const locationMultiplier = {
      'low_risk': 0.8,
      'medium_risk': 1.0,
      'high_risk': 1.3
    }[coverageOptions.location] || 1.0;

    // Property age adjustment
    const ageMultiplier = {
      'under_10': 0.9,
      '10_to_20': 1.0,
      '20_to_30': 1.1,
      'over_30': 1.2
    }[coverageOptions.propertyAge] || 1.0;

    // Security features discount
    const securityDiscount = coverageOptions.securityFeatures.length * 0.02; // 2% per feature

    // Deductible adjustment
    const deductibleMultiplier = coverageOptions.deductible > 10000 ? 0.85 : 1.0;

    const adjustedPremium = basePremium *
      locationMultiplier *
      ageMultiplier *
      (1 - Math.min(securityDiscount, 0.15)) * // Max 15% discount
      deductibleMultiplier;

    // Monthly premium (rounded to nearest R10)
    const monthlyPremium = Math.round(adjustedPremium / 12 / 10) * 10;

    setIsCalculating(false);
    return monthlyPremium;
  };

  useEffect(() => {
    const updatePremium = async () => {
      const errors = validateCoverage(coverage);
      setValidationErrors(errors);

      const newPremium = await calculatePremium(coverage);
      setPremium(newPremium);
      onPremiumChange?.(newPremium, coverage);
    };
    updatePremium();
  }, [coverage, onPremiumChange]);


  const getTotalCoverage = () => coverage.dwelling;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-stone-200">
        <CardHeader className="bg-gradient-to-r from-stone-50 to-gray-50">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calculator className="h-6 w-6 text-stone-700" />
            Coverage Calculator
          </CardTitle>
          <p className="text-muted-foreground">
            Customize your coverage amounts and see your estimated premium instantly
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          {/* Coverage Amount */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-base font-medium">Dwelling Coverage</Label>
              <Badge variant="outline" className="font-mono">
                {formatCurrency(coverage.dwelling)}
              </Badge>
            </div>
            <Slider
              value={[coverage.dwelling]}
              onValueChange={([value]) => setCoverage(prev => ({ ...prev, dwelling: value }))}
              max={200000}
              min={30000}
              step={10000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>R30K</span>
              <span>R200K</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Coverage for your home structure and attached fixtures
            </p>
          </div>

          {/* Contents Coverage */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-base font-medium">Contents Coverage</Label>
              <Badge variant="outline" className="font-mono">
                {formatCurrency(coverage.contents)}
              </Badge>
            </div>
            <Slider
              value={[coverage.contents]}
              onValueChange={([value]) => setCoverage(prev => ({ ...prev, contents: value }))}
              max={1000000}
              min={50000}
              step={25000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>R50K</span>
              <span>R1M</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Coverage for your personal belongings and household items
            </p>
          </div>

          {/* Advanced Options Toggle */}
          <div className="border-t pt-6">
            <Button
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-0 h-auto font-normal"
            >
              <span className="text-base font-medium">Advanced Options</span>
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showAdvanced && (
              <div className="space-y-6 mt-6">
                {/* Location Risk */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Location Risk Level</Label>
                  <Select
                    value={coverage.location}
                    onValueChange={(value) => setCoverage(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low_risk">Low Risk (Rural areas, low crime)</SelectItem>
                      <SelectItem value="medium_risk">Medium Risk (Suburban areas)</SelectItem>
                      <SelectItem value="high_risk">High Risk (Urban areas, high crime)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Age */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Property Age</Label>
                  <Select
                    value={coverage.propertyAge}
                    onValueChange={(value) => setCoverage(prev => ({ ...prev, propertyAge: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_10">Under 10 years</SelectItem>
                      <SelectItem value="10_to_20">10-20 years</SelectItem>
                      <SelectItem value="20_to_30">20-30 years</SelectItem>
                      <SelectItem value="over_30">Over 30 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Deductible */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-base font-medium">Deductible Amount</Label>
                    <Badge variant="outline" className="font-mono">
                      {formatCurrency(coverage.deductible)}
                    </Badge>
                  </div>
                  <Slider
                    value={[coverage.deductible]}
                    onValueChange={([value]) => setCoverage(prev => ({ ...prev, deductible: value }))}
                    max={25000}
                    min={1000}
                    step={1000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>R1K</span>
                    <span>R25K</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Amount you pay before insurance kicks in
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

        </CardContent>
      </Card>

      {/* Premium Summary */}
      <Card className="border-2 border-stone-300 bg-gradient-to-r from-stone-50 to-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-stone-600"></div>
                  Calculating...
                </>
              ) : (
                <>
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Your Premium
                </>
              )}
            </span>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {isCalculating ? '...' : `${formatCurrency(premium)}/month`}
              </div>
              <div className="text-sm text-muted-foreground">
                {isCalculating ? '...' : `${formatCurrency(premium * 12)}/year`}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="flex items-center gap-2">
                <Home className="h-4 w-4 text-stone-600" />
                Dwelling Coverage
              </span>
              <span className="font-semibold">{formatCurrency(coverage.dwelling)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-stone-600" />
                Contents Coverage
              </span>
              <span className="font-semibold">{formatCurrency(coverage.contents)}</span>
            </div>

            {/* Coverage Status */}
            {validationErrors.length === 0 && !isCalculating && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 font-medium">Coverage configuration looks good!</span>
              </div>
            )}
          </div>

          <Button className="w-full mt-6 bg-stone-700 hover:bg-stone-800" size="lg">
            Get This Quote
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
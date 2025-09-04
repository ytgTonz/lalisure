'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Shield, DollarSign, Calculator, TrendingUp, TrendingDown } from 'lucide-react';

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

const SECURITY_FEATURES = [
  { id: 'alarm', name: 'Burglar Alarm', discount: 0.1 },
  { id: 'cctv', name: 'CCTV System', discount: 0.08 },
  { id: 'security_gates', name: 'Security Gates', discount: 0.05 },
  { id: 'armed_response', name: 'Armed Response', discount: 0.12 },
  { id: 'electric_fence', name: 'Electric Fence', discount: 0.07 }
];

const LOCATION_RISK_MULTIPLIERS: { [key: string]: number } = {
  'low_risk': 0.85,
  'medium_risk': 1.0,
  'high_risk': 1.3,
  'very_high_risk': 1.6
};

const PROPERTY_AGE_MULTIPLIERS: { [key: string]: number } = {
  'new': 0.9,
  'under_10': 1.0,
  'under_20': 1.1,
  'over_20': 1.25
};

export function CoverageCalculator({ onPremiumChange }: CoverageCalculatorProps) {
  const [coverage, setCoverage] = useState<CoverageOptions>({
    dwelling: 1500000,
    contents: 500000,
    deductible: 5000,
    location: 'medium_risk',
    propertyAge: 'under_10',
    securityFeatures: []
  });

  const [premium, setPremium] = useState(0);

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

  const calculatePremium = (coverageOptions: CoverageOptions) => {
    // Base premium calculation
    const dwellingRate = 0.003; // 0.3% of dwelling value
    const contentsRate = 0.004; // 0.4% of contents value
    
    let basePremium = (coverageOptions.dwelling * dwellingRate) + (coverageOptions.contents * contentsRate);
    
    // Apply location risk multiplier
    const locationMultiplier = LOCATION_RISK_MULTIPLIERS[coverageOptions.location] || 1.0;
    basePremium *= locationMultiplier;
    
    // Apply property age multiplier
    const ageMultiplier = PROPERTY_AGE_MULTIPLIERS[coverageOptions.propertyAge] || 1.0;
    basePremium *= ageMultiplier;
    
    // Apply deductible adjustment (higher deductible = lower premium)
    const deductibleDiscount = Math.min(coverageOptions.deductible / 50000, 0.2); // Max 20% discount
    basePremium *= (1 - deductibleDiscount);
    
    // Apply security feature discounts
    let totalSecurityDiscount = 0;
    coverageOptions.securityFeatures.forEach(featureId => {
      const feature = SECURITY_FEATURES.find(f => f.id === featureId);
      if (feature) {
        totalSecurityDiscount += feature.discount;
      }
    });
    
    // Cap total security discount at 25%
    totalSecurityDiscount = Math.min(totalSecurityDiscount, 0.25);
    basePremium *= (1 - totalSecurityDiscount);
    
    // Monthly premium
    const monthlyPremium = Math.round(basePremium / 12);
    
    return monthlyPremium;
  };

  useEffect(() => {
    const newPremium = calculatePremium(coverage);
    setPremium(newPremium);
    onPremiumChange?.(newPremium, coverage);
  }, [coverage, onPremiumChange]);

  const handleSecurityFeatureToggle = (featureId: string) => {
    setCoverage(prev => ({
      ...prev,
      securityFeatures: prev.securityFeatures.includes(featureId)
        ? prev.securityFeatures.filter(id => id !== featureId)
        : [...prev.securityFeatures, featureId]
    }));
  };

  const getTotalCoverage = () => coverage.dwelling + coverage.contents;

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
          
          {/* Coverage Amounts */}
          <div className="space-y-6">
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
                max={10000000}
                min={500000}
                step={100000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>R500K</span>
                <span>R10M</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Coverage for your home structure and attached fixtures
              </p>
            </div>

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
                max={5000000}
                min={100000}
                step={50000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>R100K</span>
                <span>R5M</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Coverage for personal belongings, furniture, and electronics
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <Label className="text-base font-medium">Deductible</Label>
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
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Higher deductible = Lower monthly premium
              </p>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="space-y-4">
            <h3 className="text-base font-medium">Risk Factors</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="location">Area Risk Level</Label>
                <Select 
                  value={coverage.location} 
                  onValueChange={(value) => setCoverage(prev => ({ ...prev, location: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low_risk">Low Risk Area (-15%)</SelectItem>
                    <SelectItem value="medium_risk">Medium Risk Area</SelectItem>
                    <SelectItem value="high_risk">High Risk Area (+30%)</SelectItem>
                    <SelectItem value="very_high_risk">Very High Risk Area (+60%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="age">Property Age</Label>
                <Select 
                  value={coverage.propertyAge} 
                  onValueChange={(value) => setCoverage(prev => ({ ...prev, propertyAge: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Property (-10%)</SelectItem>
                    <SelectItem value="under_10">Under 10 Years</SelectItem>
                    <SelectItem value="under_20">10-20 Years (+10%)</SelectItem>
                    <SelectItem value="over_20">Over 20 Years (+25%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div>
            <h3 className="text-base font-medium mb-3">Security Features (Discounts)</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {SECURITY_FEATURES.map((feature) => (
                <div
                  key={feature.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    coverage.securityFeatures.includes(feature.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSecurityFeatureToggle(feature.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{feature.name}</span>
                    <Badge variant={coverage.securityFeatures.includes(feature.id) ? "default" : "secondary"}>
                      -{Math.round(feature.discount * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Summary */}
      <Card className="border-2 border-stone-300 bg-gradient-to-r from-stone-50 to-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Your Premium
            </span>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(premium)}/month
              </div>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(premium * 12)}/year
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="flex items-center gap-2">
                <Home className="h-4 w-4 text-stone-600" />
                Total Coverage
              </span>
              <span className="font-semibold">{formatCurrency(getTotalCoverage())}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-stone-600" />
                Deductible
              </span>
              <span className="font-semibold">{formatCurrency(coverage.deductible)}</span>
            </div>

            {coverage.securityFeatures.length > 0 && (
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  Security Discounts Applied
                </span>
                <span className="font-semibold text-green-600">
                  {coverage.securityFeatures.length} feature{coverage.securityFeatures.length > 1 ? 's' : ''}
                </span>
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
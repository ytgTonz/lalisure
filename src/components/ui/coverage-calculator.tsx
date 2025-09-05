'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Shield, DollarSign, Calculator, TrendingDown } from 'lucide-react';

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
    
    // Apply deductible adjustment (higher deductible = lower premium)
    const deductibleDiscount = Math.min(coverageOptions.deductible / 50000, 0.15); // Max 15% discount
    basePremium *= (1 - deductibleDiscount);
    
    // Monthly premium
    const monthlyPremium = Math.round(basePremium / 12);
    
    return monthlyPremium;
  };

  useEffect(() => {
    const newPremium = calculatePremium(coverage);
    setPremium(newPremium);
    onPremiumChange?.(newPremium, coverage);
  }, [coverage, onPremiumChange]);


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
                max={200000}
                min={30000}
                step={10000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>R30000</span>
                <span>R200K</span>
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
          </div>

          <Button className="w-full mt-6 bg-stone-700 hover:bg-stone-800" size="lg">
            Get This Quote
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
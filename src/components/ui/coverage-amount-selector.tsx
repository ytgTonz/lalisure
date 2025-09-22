'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import { api } from '@/trpc/react';
import { debounce } from 'lodash';

interface CoverageAmountSelectorProps {
  value: number;
  onChange: (amount: number) => void;
  onPremiumCalculated?: (premium: number, breakdown: any) => void;
  riskFactors?: any;
  minAmount?: number;
  maxAmount?: number;
  increment?: number;
  className?: string;
}

interface PremiumBreakdown {
  monthlyPremium: number;
  annualPremium: number;
  rate: number;
  riskMultiplier: number;
  discountApplied: number;
}

export function CoverageAmountSelector({
  value = 300000,
  onChange,
  onPremiumCalculated,
  riskFactors = {},
  minAmount = 25000,
  maxAmount = 5000000,
  increment = 5000,
  className = '',
}: CoverageAmountSelectorProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [sliderValue, setSliderValue] = useState([value]);
  const [premiumData, setPremiumData] = useState<PremiumBreakdown | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Real-time premium calculation query
  const premiumQuery = api.policy.calculatePremiumRealTime.useQuery(
    {
      coverageAmount: value,
      riskFactors,
    },
    {
      enabled: value >= minAmount && value <= maxAmount && value % increment === 0,
      refetchOnWindowFocus: false,
    }
  );

  // Debounced premium calculation
  const debouncedCalculatePremium = useCallback(
    debounce((amount: number) => {
      if (amount >= minAmount && amount <= maxAmount && amount % increment === 0) {
        setIsCalculating(true);
      }
    }, 300),
    [minAmount, maxAmount, increment]
  );

  // Update premium data when query succeeds
  useEffect(() => {
    if (premiumQuery.data && !premiumQuery.isLoading) {
      const breakdown: PremiumBreakdown = {
        monthlyPremium: premiumQuery.data.monthlyPremium,
        annualPremium: premiumQuery.data.annualPremium,
        rate: premiumQuery.data.rate || 0.008,
        riskMultiplier: premiumQuery.data.riskMultiplier || 1,
        discountApplied: premiumQuery.data.discountApplied || 0,
      };
      setPremiumData(breakdown);
      setIsCalculating(false);
      onPremiumCalculated?.(breakdown.monthlyPremium, breakdown);
    }
  }, [premiumQuery.data, premiumQuery.isLoading, onPremiumCalculated]);

  // Trigger calculation when amount changes
  useEffect(() => {
    debouncedCalculatePremium(value);
  }, [value, debouncedCalculatePremium]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `R${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `R${(amount / 1000).toFixed(0)}K`;
    }
    return formatCurrency(amount);
  };

  const validateAmount = (amount: number): boolean => {
    return amount >= minAmount && amount <= maxAmount && amount % increment === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^\d]/g, '');
    setInputValue(newValue);

    const numericValue = parseInt(newValue) || 0;
    if (validateAmount(numericValue)) {
      onChange(numericValue);
      setSliderValue([numericValue]);
    }
  };

  const handleSliderChange = (newValue: number[]) => {
    const amount = newValue[0];
    const roundedAmount = Math.round(amount / increment) * increment;

    setSliderValue([roundedAmount]);
    setInputValue(roundedAmount.toString());
    onChange(roundedAmount);
  };

  const adjustAmount = (direction: 'up' | 'down') => {
    const currentAmount = parseInt(inputValue) || value;
    const newAmount = direction === 'up'
      ? Math.min(currentAmount + increment, maxAmount)
      : Math.max(currentAmount - increment, minAmount);

    setInputValue(newAmount.toString());
    setSliderValue([newAmount]);
    onChange(newAmount);
  };

  const getDiscountMessage = () => {
    if (!premiumData) return null;

    if (premiumData.discountApplied > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600 text-xs">
          <TrendingDown className="h-3 w-3" />
          {premiumData.discountApplied}% discount applied for higher coverage
        </div>
      );
    }

    if (value < 500000) {
      return (
        <div className="flex items-center gap-1 text-blue-600 text-xs">
          <TrendingUp className="h-3 w-3" />
          Increase coverage to R500K+ for better rates
        </div>
      );
    }

    return null;
  };

  const isValid = validateAmount(value);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Choose Your Coverage Amount</CardTitle>
        <p className="text-sm text-muted-foreground">
          Select the total coverage amount that best protects your needs.
          Higher coverage amounts may qualify for better rates.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Input with Controls */}
        <div className="space-y-2">
          <Label htmlFor="coverage-amount">Coverage Amount</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => adjustAmount('down')}
              disabled={value <= minAmount}
              className="shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">R</span>
              <Input
                id="coverage-amount"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                className={`pl-8 text-lg font-medium ${!isValid ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="300000"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => adjustAmount('up')}
              disabled={value >= maxAmount}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {!isValid && (
            <p className="text-xs text-red-500">
              Amount must be between {formatCompactCurrency(minAmount)} and {formatCompactCurrency(maxAmount)} in {formatCompactCurrency(increment)} increments
            </p>
          )}
        </div>

        {/* Slider */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCompactCurrency(minAmount)}</span>
            <span>{formatCompactCurrency(maxAmount)}</span>
          </div>
          <Slider
            value={sliderValue}
            onValueChange={handleSliderChange}
            min={minAmount}
            max={maxAmount}
            step={increment}
            className="w-full"
          />
          <div className="text-center">
            <span className="text-sm font-medium">{formatCurrency(sliderValue[0])}</span>
          </div>
        </div>

        {/* Premium Display */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estimated Premium</span>
            {isCalculating && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
          </div>

          {premiumData && !isCalculating ? (
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">Monthly</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(premiumData.monthlyPremium)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">Annual</span>
                <span className="text-sm font-medium">
                  {formatCurrency(premiumData.annualPremium)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">Rate</span>
                <span className="text-xs">
                  {(premiumData.rate * 100).toFixed(2)}% of coverage
                </span>
              </div>
              {getDiscountMessage()}
            </div>
          ) : !isCalculating && isValid ? (
            <div className="text-center py-2">
              <span className="text-xs text-muted-foreground">Calculating premium...</span>
            </div>
          ) : !isValid ? (
            <div className="text-center py-2">
              <span className="text-xs text-red-500">Enter a valid amount to see premium</span>
            </div>
          ) : null}
        </div>

        {/* Quick Amount Buttons */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Quick Select</Label>
          <div className="grid grid-cols-2 gap-2">
            {[250000, 500000, 750000, 1000000].map((amount) => (
              <Button
                key={amount}
                type="button"
                variant={value === amount ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setInputValue(amount.toString());
                  setSliderValue([amount]);
                  onChange(amount);
                }}
                className="text-xs"
              >
                {formatCompactCurrency(amount)}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
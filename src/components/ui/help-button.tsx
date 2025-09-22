"use client"

import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HelpButtonProps {
  term: string;
  shortExplanation: string;
  detailedExplanation: string;
  examples?: string[];
  tips?: string[];
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function HelpButton({
  term,
  shortExplanation,
  detailedExplanation,
  examples = [],
  tips = [],
  icon = <HelpCircle className="h-4 w-4" />,
  variant = 'ghost',
  size = 'sm',
  className = ''
}: HelpButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="inline-flex items-center gap-1">
        {/* Quick tooltip for brief explanation */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              className={`h-6 w-6 p-0 ${className}`}
              onClick={() => setIsDialogOpen(true)}
            >
              {icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{term}</p>
              <p className="text-xs">{shortExplanation}</p>
              <p className="text-xs text-muted-foreground">Click for more details</p>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Detailed dialog for comprehensive explanation */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                {term}
              </DialogTitle>
              <DialogDescription>
                Detailed explanation and examples
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Main explanation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">What is {term}?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {detailedExplanation}
                  </p>
                </CardContent>
              </Card>

              {/* Examples */}
              {examples.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Examples</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {examples.map((example, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5 text-xs">
                            {index + 1}
                          </Badge>
                          <p className="text-sm text-muted-foreground">{example}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tips */}
              {tips.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">💡 Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

// Predefined help buttons for common insurance terms
export const InsuranceHelpButtons = {
  DwellingCoverage: () => (
    <HelpButton
      term="Dwelling Coverage"
      shortExplanation="Covers the physical structure of your home"
      detailedExplanation="Dwelling coverage protects the physical structure of your home, including walls, roof, floors, and built-in appliances. This coverage helps pay to repair or rebuild your home if it's damaged by covered perils like fire, wind, or theft."
      examples={[
        "If a fire damages your roof and walls, dwelling coverage pays for repairs",
        "If a storm destroys your home, dwelling coverage pays to rebuild it",
        "If a tree falls on your house, dwelling coverage pays for structural repairs"
      ]}
      tips={[
        "Set coverage to at least 80% of your home's replacement cost",
        "Consider inflation protection to keep up with rising construction costs",
        "Don't include land value in your dwelling coverage amount"
      ]}
    />
  ),

  PersonalProperty: () => (
    <HelpButton
      term="Personal Property"
      shortExplanation="Covers your belongings and furniture"
      detailedExplanation="Personal property coverage protects your belongings inside your home, such as furniture, electronics, clothing, and other personal items. This coverage helps replace your possessions if they're stolen, damaged, or destroyed by covered perils."
      examples={[
        "If your laptop is stolen during a break-in, personal property coverage pays to replace it",
        "If a fire damages your furniture, personal property coverage pays for replacement",
        "If a storm damages your electronics, personal property coverage pays for repairs"
      ]}
      tips={[
        "Take photos or videos of valuable items for documentation",
        "Consider additional coverage for expensive items like jewelry",
        "Keep receipts for major purchases to prove value"
      ]}
    />
  ),

  LiabilityCoverage: () => (
    <HelpButton
      term="Liability Coverage"
      shortExplanation="Protects you from lawsuits and claims"
      detailedExplanation="Liability coverage protects you if someone is injured on your property or if you accidentally damage someone else's property. It covers legal fees, medical expenses, and damages you're legally responsible for."
      examples={[
        "If a guest slips and falls on your property, liability coverage pays their medical bills",
        "If your dog bites someone, liability coverage pays for their medical treatment",
        "If you accidentally damage a neighbor's property, liability coverage pays for repairs"
      ]}
      tips={[
        "Higher liability limits provide better protection",
        "Consider umbrella insurance for additional liability coverage",
        "Liability coverage also protects you away from home in some cases"
      ]}
    />
  ),

  MedicalPayments: () => (
    <HelpButton
      term="Medical Payments"
      shortExplanation="Pays medical expenses for injuries on your property"
      detailedExplanation="Medical payments coverage pays for medical expenses if someone is injured on your property, regardless of who's at fault. This coverage helps pay for immediate medical care and can prevent small incidents from becoming lawsuits."
      examples={[
        "If a guest cuts their hand on broken glass, medical payments covers their ER visit",
        "If a delivery person trips on your steps, medical payments covers their medical bills",
        "If a child falls in your yard, medical payments covers their medical treatment"
      ]}
      tips={[
        "Medical payments coverage is usually limited to a few thousand rand",
        "This coverage pays regardless of fault, making it faster than liability claims",
        "Consider higher limits if you frequently have guests or workers on your property"
      ]}
    />
  ),

  Deductible: () => (
    <HelpButton
      term="Deductible"
      shortExplanation="Amount you pay before insurance kicks in"
      detailedExplanation="A deductible is the amount you pay out of pocket before your insurance coverage begins. Higher deductibles typically result in lower monthly premiums, but you'll pay more if you need to make a claim."
      examples={[
        "If you have a R1,000 deductible and R5,000 in damage, you pay R1,000 and insurance pays R4,000",
        "If you have a R5,000 deductible and R3,000 in damage, you pay the full R3,000",
        "If you have a R500 deductible and R10,000 in damage, you pay R500 and insurance pays R9,500"
      ]}
      tips={[
        "Choose a deductible you can comfortably afford to pay",
        "Higher deductibles = lower monthly premiums",
        "Consider your risk tolerance when choosing a deductible amount"
      ]}
    />
  ),

  AdditionalLivingExpenses: () => (
    <HelpButton
      term="Additional Living Expenses"
      shortExplanation="Covers temporary housing and living costs"
      detailedExplanation="Additional living expenses (ALE) coverage pays for temporary housing, meals, and other living expenses if your home becomes uninhabitable due to a covered loss. This coverage helps maintain your standard of living while your home is being repaired or rebuilt."
      examples={[
        "If a fire makes your home uninhabitable, ALE pays for a hotel stay",
        "If you need to rent an apartment during repairs, ALE covers the rent",
        "If you need to eat out more often, ALE covers the additional food costs"
      ]}
      tips={[
        "ALE coverage has limits, so choose appropriate coverage amounts",
        "Keep receipts for all additional expenses",
        "ALE coverage typically lasts for a limited time (12-24 months)"
      ]}
    />
  )
};

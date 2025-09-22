'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InsuranceHelpButtons, HelpButton } from '@/components/ui/help-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Home, Shield, DollarSign, Heart } from 'lucide-react';

export default function HelpButtonsDemoPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Insurance Help Buttons Demo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Interactive help buttons that provide quick tooltips and detailed explanations for insurance terms. 
          Hover over the help icons for quick info, or click them for detailed explanations.
        </p>
      </div>

      {/* Demo Form */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Home Insurance Coverage Demo
          </CardTitle>
          <CardDescription>
            Try the help buttons next to each field to understand what each coverage type means.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Coverage for your home structure
              </p>
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
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Coverage for belongings and furniture
              </p>
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
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Protection against lawsuits and claims
              </p>
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
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Medical expenses for injuries on your property
              </p>
            </div>
          </div>

          {/* Deductible */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="deductible">Your Deductible Amount</Label>
              <InsuranceHelpButtons.Deductible />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">R</span>
              <Input
                id="deductible"
                type="number"
                placeholder="1000"
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Higher deductibles typically result in lower monthly premiums
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Custom Help Button Examples */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Custom Help Button Examples</CardTitle>
          <CardDescription>
            Examples of help buttons with different icons and styles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label>Default Help Button:</Label>
            <HelpButton
              term="Default Help"
              shortExplanation="This is a default help button"
              detailedExplanation="This is a detailed explanation of the default help button functionality."
              examples={["Example 1", "Example 2"]}
              tips={["Tip 1", "Tip 2"]}
            />
          </div>

          <div className="flex items-center gap-4">
            <Label>Shield Icon Help:</Label>
            <HelpButton
              term="Shield Protection"
              shortExplanation="This uses a shield icon"
              detailedExplanation="This help button uses a shield icon to represent protection or security features."
              examples={["Security example 1", "Security example 2"]}
              tips={["Security tip 1", "Security tip 2"]}
              icon={<Shield className="h-4 w-4" />}
            />
          </div>

          <div className="flex items-center gap-4">
            <Label>Dollar Sign Icon Help:</Label>
            <HelpButton
              term="Cost Information"
              shortExplanation="This uses a dollar sign icon"
              detailedExplanation="This help button uses a dollar sign icon to represent cost or pricing information."
              examples={["Cost example 1", "Cost example 2"]}
              tips={["Cost tip 1", "Cost tip 2"]}
              icon={<DollarSign className="h-4 w-4" />}
            />
          </div>

          <div className="flex items-center gap-4">
            <Label>Heart Icon Help:</Label>
            <HelpButton
              term="Health Coverage"
              shortExplanation="This uses a heart icon"
              detailedExplanation="This help button uses a heart icon to represent health or medical coverage information."
              examples={["Health example 1", "Health example 2"]}
              tips={["Health tip 1", "Health tip 2"]}
              icon={<Heart className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>How to Use Help Buttons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Quick Help (Tooltip):</h4>
            <p className="text-sm text-muted-foreground">
              Hover over the help icon to see a quick explanation of the term.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Detailed Help (Dialog):</h4>
            <p className="text-sm text-muted-foreground">
              Click the help icon to open a detailed dialog with comprehensive explanations, examples, and tips.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Accessible with keyboard navigation</li>
              <li>• Mobile-friendly touch interactions</li>
              <li>• Consistent styling with your design system</li>
              <li>• Easy to customize and extend</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

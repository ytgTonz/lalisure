'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calculator, 
  MapPin, 
  Home, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  FileText,
  Shield
} from 'lucide-react';

export default function RiskAssessmentPage() {
  const [riskScore, setRiskScore] = useState(0);
  const [assessment, setAssessment] = useState({
    propertyValue: '',
    propertyType: '',
    buildYear: '',
    location: '',
    securityFeatures: '',
    naturalDisasterRisk: '',
    previousClaims: '',
    notes: ''
  });

  const calculateRiskScore = () => {
    let score = 50; // Base score
    
    // Property age factor
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(assessment.buildYear);
    if (age > 50) score += 20;
    else if (age > 20) score += 10;
    else score -= 5;

    // Security features
    if (assessment.securityFeatures === 'comprehensive') score -= 15;
    else if (assessment.securityFeatures === 'basic') score -= 5;

    // Natural disaster risk
    if (assessment.naturalDisasterRisk === 'high') score += 25;
    else if (assessment.naturalDisasterRisk === 'medium') score += 10;
    else score -= 5;

    // Previous claims
    if (assessment.previousClaims === 'multiple') score += 30;
    else if (assessment.previousClaims === 'single') score += 15;

    setRiskScore(Math.max(0, Math.min(100, score)));
  };

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: 'Low', color: 'bg-green-500', variant: 'success' as const };
    if (score <= 60) return { level: 'Medium', color: 'bg-yellow-500', variant: 'warning' as const };
    return { level: 'High', color: 'bg-red-500', variant: 'destructive' as const };
  };

  const riskLevel = getRiskLevel(riskScore);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Assessment Tools</h1>
          <p className="text-muted-foreground">
            Evaluate property risks and calculate insurance premiums
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Risk Calculator */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Property Risk Calculator
                </CardTitle>
                <CardDescription>
                  Enter property details to assess insurance risk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="propertyValue">Property Value (R)</Label>
                    <Input
                      id="propertyValue"
                      type="number"
                      placeholder="e.g., 2500000"
                      value={assessment.propertyValue}
                      onChange={(e) => setAssessment({...assessment, propertyValue: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select value={assessment.propertyType} onValueChange={(value) => setAssessment({...assessment, propertyType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="estate">Estate Property</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buildYear">Year Built</Label>
                    <Input
                      id="buildYear"
                      type="number"
                      placeholder="e.g., 2005"
                      value={assessment.buildYear}
                      onChange={(e) => setAssessment({...assessment, buildYear: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location/Area</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Sandton, Johannesburg"
                      value={assessment.location}
                      onChange={(e) => setAssessment({...assessment, location: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="securityFeatures">Security Features</Label>
                    <Select value={assessment.securityFeatures} onValueChange={(value) => setAssessment({...assessment, securityFeatures: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select security level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Security</SelectItem>
                        <SelectItem value="basic">Basic (Burglar Bars/Gates)</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive (Alarm + Armed Response)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="naturalDisasterRisk">Natural Disaster Risk</Label>
                    <Select value={assessment.naturalDisasterRisk} onValueChange={(value) => setAssessment({...assessment, naturalDisasterRisk: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Risk Area</SelectItem>
                        <SelectItem value="medium">Medium Risk Area</SelectItem>
                        <SelectItem value="high">High Risk Area (Flood/Fire prone)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="previousClaims">Previous Claims History</Label>
                    <Select value={assessment.previousClaims} onValueChange={(value) => setAssessment({...assessment, previousClaims: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select claims history" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Previous Claims</SelectItem>
                        <SelectItem value="single">1 Previous Claim</SelectItem>
                        <SelectItem value="multiple">Multiple Previous Claims</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional risk factors or observations..."
                    value={assessment.notes}
                    onChange={(e) => setAssessment({...assessment, notes: e.target.value})}
                  />
                </div>

                <Button onClick={calculateRiskScore} className="w-full">
                  Calculate Risk Score
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Risk Score Display */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Risk Assessment Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{riskScore}</div>
                  <div className="flex justify-center mb-4">
                    <Badge variant={riskLevel.variant} className="text-sm">
                      {riskLevel.level} Risk
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className={`h-3 rounded-full ${riskLevel.color}`}
                      style={{ width: `${riskScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Recommended Premium:</span>
                    <span className="font-medium">
                      {assessment.propertyValue ? 
                        `R${Math.round((parseInt(assessment.propertyValue) * (riskScore / 100) * 0.002) / 12)}` : 
                        'N/A'} /month
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coverage Limit:</span>
                    <span className="font-medium">
                      {assessment.propertyValue ? `R${parseInt(assessment.propertyValue).toLocaleString()}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deductible:</span>
                    <span className="font-medium">
                      {assessment.propertyValue ? `R${Math.round(parseInt(assessment.propertyValue) * 0.01).toLocaleString()}` : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Key Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Property Age</span>
                    <Badge variant={
                      assessment.buildYear && (new Date().getFullYear() - parseInt(assessment.buildYear)) > 30 
                        ? 'destructive' : 'secondary'
                    }>
                      {assessment.buildYear ? 
                        `${new Date().getFullYear() - parseInt(assessment.buildYear)} years` : 
                        'Not specified'
                      }
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Security Level</span>
                    <Badge variant={
                      assessment.securityFeatures === 'comprehensive' ? 'success' :
                      assessment.securityFeatures === 'basic' ? 'warning' : 'secondary'
                    }>
                      {assessment.securityFeatures || 'Not specified'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Natural Disaster Risk</span>
                    <Badge variant={
                      assessment.naturalDisasterRisk === 'high' ? 'destructive' :
                      assessment.naturalDisasterRisk === 'medium' ? 'warning' : 'success'
                    }>
                      {assessment.naturalDisasterRisk || 'Not assessed'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Risk Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment Guidelines</CardTitle>
            <CardDescription>
              Standard criteria for evaluating insurance risks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">Low Risk (0-30)</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Property less than 20 years old</li>
                  <li>• Comprehensive security system</li>
                  <li>• Low natural disaster area</li>
                  <li>• No previous claims</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-medium">Medium Risk (31-60)</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Property 20-50 years old</li>
                  <li>• Basic security measures</li>
                  <li>• Moderate risk area</li>
                  <li>• Single previous claim</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  <h3 className="font-medium">High Risk (61-100)</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Property over 50 years old</li>
                  <li>• Limited or no security</li>
                  <li>• High natural disaster risk</li>
                  <li>• Multiple previous claims</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
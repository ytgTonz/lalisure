'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/react';
import { 
  Calculator, 
  Send, 
  FileText, 
  User, 
  Home, 
  Shield,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Download,
  Save,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface QuoteGeneratorProps {
  className?: string;
  customerData?: any;
  onQuoteGenerated?: (quote: any) => void;
}

export function QuoteGenerator({ className, customerData, onQuoteGenerated }: QuoteGeneratorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [quoteData, setQuoteData] = useState({
    // Customer Information
    customerName: customerData?.name || '',
    customerEmail: customerData?.email || '',
    customerPhone: customerData?.phone || '',
    
    // Property Information
    address: '',
    city: '',
    province: '',
    postalCode: '',
    propertyType: '',
    buildYear: '',
    squareFeet: '',
    bedrooms: '',
    bathrooms: '',
    constructionType: '',
    roofType: '',
    hasPool: false,
    hasGarage: false,
    safetyFeatures: [] as string[],
    
    // Coverage Options
    dwellingCoverage: '',
    personalPropertyCoverage: '',
    liabilityCoverage: '',
    deductible: '',
    
    // Additional Information
    notes: '',
    urgency: 'normal',
    followUpDate: ''
  });

  const [calculatedQuote, setCalculatedQuote] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);

  const generateQuoteMutation = api.policy.generateQuote.useMutation({
    onSuccess: (data) => {
      setCalculatedQuote(data);
      setIsCalculating(false);
      toast.success('Quote generated successfully!');
      onQuoteGenerated?.(data);
    },
    onError: (error) => {
      setIsCalculating(false);
      toast.error('Failed to generate quote: ' + error.message);
    }
  });

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setQuoteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSafetyFeatureToggle = (feature: string) => {
    const current = quoteData.safetyFeatures;
    const updated = current.includes(feature)
      ? current.filter(f => f !== feature)
      : [...current, feature];
    handleInputChange('safetyFeatures', updated);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(quoteData.customerName && quoteData.customerEmail);
      case 2:
        return !!(quoteData.address && quoteData.city && quoteData.province);
      case 3:
        return !!(quoteData.dwellingCoverage && quoteData.deductible);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateQuote = () => {
    setIsCalculating(true);
    setCalculatedQuote(null);

    generateQuoteMutation.mutate({
      type: 'HOME',
      coverage: {
        dwelling: parseInt(quoteData.dwellingCoverage),
        personalProperty: parseInt(quoteData.personalPropertyCoverage) || 0,
        liability: parseInt(quoteData.liabilityCoverage) || 0,
      },
      riskFactors: {
        location: {
          province: quoteData.province,
          postalCode: quoteData.postalCode
        },
        demographics: {
          age: 35 // Default for quote generation
        },
        personal: {
          safetyFeatures: quoteData.safetyFeatures,
          propertyType: quoteData.propertyType,
          buildYear: parseInt(quoteData.buildYear) || 2000
        }
      },
      deductible: parseInt(quoteData.deductible)
    });
  };

  const sendQuoteToCustomer = async () => {
    if (!calculatedQuote || !quoteData.customerEmail) {
      toast.error('Please generate a quote and provide customer email');
      return;
    }
    
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1000));
    setQuoteSent(true);
    toast.success('Quote sent to customer via email!');
  };

  const copyQuoteLink = () => {
    if (!calculatedQuote) return;
    const link = `${window.location.origin}/quote/${calculatedQuote.quoteNumber}`;
    navigator.clipboard.writeText(link);
    toast.success('Quote link copied to clipboard!');
  };

  const saveQuote = () => {
    if (!calculatedQuote) return;
    toast.success('Quote saved to customer records');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  const StepIndicator = ({ step, title }: { step: number; title: string }) => {
    const status = getStepStatus(step);
    return (
      <div className={`flex items-center gap-2 ${status === 'current' ? 'text-insurance-blue' : status === 'completed' ? 'text-green-600' : 'text-muted-foreground'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          status === 'current' ? 'bg-insurance-blue text-white' : 
          status === 'completed' ? 'bg-green-600 text-white' : 
          'bg-gray-200 text-gray-600'
        }`}>
          {status === 'completed' ? <Check className="h-4 w-4" /> : step}
        </div>
        <span className="text-sm font-medium">{title}</span>
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quote Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Generate Customer Quote
              </CardTitle>
              <CardDescription>
                Create a personalized insurance quote for your customer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step Indicators */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <StepIndicator step={1} title="Customer" />
                <StepIndicator step={2} title="Property" />
                <StepIndicator step={3} title="Coverage" />
                <StepIndicator step={4} title="Review" />
              </div>

              {/* Step 1: Customer Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-insurance-blue" />
                    <h3 className="text-lg font-semibold">Customer Information</h3>
                  </div>
                  
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="customerName">Customer Name *</Label>
                      <Input
                        id="customerName"
                        value={quoteData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        placeholder="John Smith"
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerEmail">Email Address *</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={quoteData.customerEmail}
                          onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customerPhone">Phone Number</Label>
                        <Input
                          id="customerPhone"
                          value={quoteData.customerPhone}
                          onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                          placeholder="+27 11 123 4567"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="urgency">Quote Urgency</Label>
                        <Select value={quoteData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low - Within a week</SelectItem>
                            <SelectItem value="normal">Normal - Within 2-3 days</SelectItem>
                            <SelectItem value="high">High - Within 24 hours</SelectItem>
                            <SelectItem value="urgent">Urgent - Same day</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="followUpDate">Follow-up Date</Label>
                        <Input
                          id="followUpDate"
                          type="date"
                          value={quoteData.followUpDate}
                          onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Property Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Home className="h-5 w-5 text-insurance-blue" />
                    <h3 className="text-lg font-semibold">Property Information</h3>
                  </div>
                  
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="address">Property Address *</Label>
                      <Input
                        id="address"
                        value={quoteData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="123 Main Street"
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={quoteData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="Cape Town"
                        />
                      </div>
                      <div>
                        <Label htmlFor="province">Province *</Label>
                        <Select value={quoteData.province} onValueChange={(value) => handleInputChange('province', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="western-cape">Western Cape</SelectItem>
                            <SelectItem value="gauteng">Gauteng</SelectItem>
                            <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                            <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                            <SelectItem value="free-state">Free State</SelectItem>
                            <SelectItem value="limpopo">Limpopo</SelectItem>
                            <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                            <SelectItem value="north-west">North West</SelectItem>
                            <SelectItem value="northern-cape">Northern Cape</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={quoteData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          placeholder="8001"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="propertyType">Property Type</Label>
                        <Select value={quoteData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single-family">Single Family Home</SelectItem>
                            <SelectItem value="condo">Condominium</SelectItem>
                            <SelectItem value="townhouse">Townhouse</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="buildYear">Year Built</Label>
                        <Input
                          id="buildYear"
                          type="number"
                          value={quoteData.buildYear}
                          onChange={(e) => handleInputChange('buildYear', e.target.value)}
                          placeholder="2010"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="squareFeet">Square Feet</Label>
                        <Input
                          id="squareFeet"
                          type="number"
                          value={quoteData.squareFeet}
                          onChange={(e) => handleInputChange('squareFeet', e.target.value)}
                          placeholder="2000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          value={quoteData.bedrooms}
                          onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                          placeholder="3"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          step="0.5"
                          value={quoteData.bathrooms}
                          onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                          placeholder="2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Safety Features</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {['Smoke Detectors', 'Security System', 'Fire Extinguisher', 'Burglar Bars', 'Electric Fence', 'CCTV'].map((feature) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={feature}
                              checked={quoteData.safetyFeatures.includes(feature)}
                              onChange={() => handleSafetyFeatureToggle(feature)}
                              className="rounded"
                            />
                            <Label htmlFor={feature} className="text-sm">{feature}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Coverage Options */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-insurance-blue" />
                    <h3 className="text-lg font-semibold">Coverage Options</h3>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dwellingCoverage">Dwelling Coverage *</Label>
                        <Select value={quoteData.dwellingCoverage} onValueChange={(value) => handleInputChange('dwellingCoverage', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select amount" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="500000">R 500,000</SelectItem>
                            <SelectItem value="750000">R 750,000</SelectItem>
                            <SelectItem value="1000000">R 1,000,000</SelectItem>
                            <SelectItem value="1500000">R 1,500,000</SelectItem>
                            <SelectItem value="2000000">R 2,000,000</SelectItem>
                            <SelectItem value="3000000">R 3,000,000</SelectItem>
                            <SelectItem value="5000000">R 5,000,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="deductible">Deductible *</Label>
                        <Select value={quoteData.deductible} onValueChange={(value) => handleInputChange('deductible', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select deductible" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5000">R 5,000</SelectItem>
                            <SelectItem value="10000">R 10,000</SelectItem>
                            <SelectItem value="15000">R 15,000</SelectItem>
                            <SelectItem value="25000">R 25,000</SelectItem>
                            <SelectItem value="50000">R 50,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="personalPropertyCoverage">Personal Property Coverage</Label>
                        <Select value={quoteData.personalPropertyCoverage} onValueChange={(value) => handleInputChange('personalPropertyCoverage', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select amount" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="100000">R 100,000</SelectItem>
                            <SelectItem value="200000">R 200,000</SelectItem>
                            <SelectItem value="300000">R 300,000</SelectItem>
                            <SelectItem value="500000">R 500,000</SelectItem>
                            <SelectItem value="1000000">R 1,000,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="liabilityCoverage">Liability Coverage</Label>
                        <Select value={quoteData.liabilityCoverage} onValueChange={(value) => handleInputChange('liabilityCoverage', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select amount" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1000000">R 1,000,000</SelectItem>
                            <SelectItem value="2000000">R 2,000,000</SelectItem>
                            <SelectItem value="5000000">R 5,000,000</SelectItem>
                            <SelectItem value="10000000">R 10,000,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={quoteData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Any additional information, special considerations, or customer requirements..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-insurance-blue" />
                    <h3 className="text-lg font-semibold">Review Quote Information</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Customer Information</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                        <div>Name: {quoteData.customerName}</div>
                        <div>Email: {quoteData.customerEmail}</div>
                        <div>Phone: {quoteData.customerPhone || 'Not provided'}</div>
                        <div>Urgency: {quoteData.urgency}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Property Information</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                        <div>Address: {quoteData.address}</div>
                        <div>City: {quoteData.city}</div>
                        <div>Province: {quoteData.province}</div>
                        <div>Property Type: {quoteData.propertyType || 'Not specified'}</div>
                        <div>Year Built: {quoteData.buildYear || 'Not specified'}</div>
                        <div>Square Feet: {quoteData.squareFeet || 'Not specified'}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Coverage Options</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                        <div>Dwelling: {formatCurrency(parseInt(quoteData.dwellingCoverage))}</div>
                        <div>Deductible: {formatCurrency(parseInt(quoteData.deductible))}</div>
                        <div>Personal Property: {quoteData.personalPropertyCoverage ? formatCurrency(parseInt(quoteData.personalPropertyCoverage)) : 'Not selected'}</div>
                        <div>Liability: {quoteData.liabilityCoverage ? formatCurrency(parseInt(quoteData.liabilityCoverage)) : 'Not selected'}</div>
                      </div>
                    </div>

                    {quoteData.safetyFeatures.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Safety Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {quoteData.safetyFeatures.map((feature) => (
                            <Badge key={feature} variant="secondary">{feature}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep < 4 ? (
                  <Button onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={calculateQuote} 
                    disabled={isCalculating}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    {isCalculating ? 'Calculating...' : 'Generate Quote'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quote Result */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
              <CardDescription>
                Generated quote details and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {calculatedQuote ? (
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-r from-insurance-blue to-blue-600 text-white rounded-lg">
                    <h3 className="text-3xl font-bold mb-2">
                      {formatCurrency(calculatedQuote.annualPremium)}
                    </h3>
                    <p className="text-blue-100 mb-1">Annual Premium</p>
                    <p className="text-sm text-blue-200">
                      {formatCurrency(calculatedQuote.monthlyPremium)}/month
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      Quote #{calculatedQuote.quoteNumber}
                    </p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Dwelling Coverage</span>
                      <span className="font-medium">
                        {formatCurrency(calculatedQuote.coverage.dwelling)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Deductible</span>
                      <span className="font-medium">
                        {formatCurrency(calculatedQuote.deductible)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Valid Until</span>
                      <span className="font-medium">
                        {new Date(calculatedQuote.validUntil).toLocaleDateString('en-ZA')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={sendQuoteToCustomer}
                      className="w-full"
                      disabled={!quoteData.customerEmail || quoteSent}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {quoteSent ? 'Quote Sent' : 'Send to Customer'}
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={saveQuote}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={copyQuoteLink}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Link
                      </Button>
                    </div>

                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Complete the form and generate a quote to see pricing details.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Contact Card */}
          {quoteData.customerName && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{quoteData.customerName}</span>
                  </div>
                  {quoteData.customerEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{quoteData.customerEmail}</span>
                    </div>
                  )}
                  {quoteData.customerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{quoteData.customerPhone}</span>
                    </div>
                  )}
                  {quoteData.followUpDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Follow up: {quoteData.followUpDate}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
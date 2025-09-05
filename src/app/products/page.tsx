'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { CoverageCalculator } from '../../components/ui/coverage-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Calculator, Home, Shield, CheckCircle, Star, Users, Clock, Phone } from 'lucide-react';

interface CoverageOptions {
  dwelling: number;
  contents: number;
  deductible: number;
  location: string;
  propertyAge: string;
  securityFeatures: string[];
}

const ProductsPage = () => {
  const [selectedPremium, setSelectedPremium] = useState<number>(0);
  const [selectedCoverage, setSelectedCoverage] = useState<CoverageOptions | null>(null);

  const handlePremiumChange = (premium: number, coverage: CoverageOptions) => {
    setSelectedPremium(premium);
    setSelectedCoverage(coverage);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const features = [
    {
      icon: Shield,
      title: 'Comprehensive Protection',
      description: 'Coverage for your home structure, contents, and personal liability'
    },
    {
      icon: Clock,
      title: 'Fast Claims Processing',
      description: 'Quick and efficient claims handling with 24/7 support'
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: 'Dedicated insurance specialists to guide you through every step'
    },
    {
      icon: Star,
      title: 'Competitive Rates',
      description: 'Affordable premiums with discounts for security features'
    }
  ];

  const whatsCovered = [
    'Fire and lightning damage',
    'Theft and burglary',
    'Water damage from burst pipes',
    'Storm and hail damage',
    'Vandalism and malicious damage',
    'Earthquake coverage',
    'Personal liability protection',
    'Alternative accommodation',
    'Emergency repairs',
    'Garden and outbuilding coverage'
  ];

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-stone-50 to-gray-100">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Get Your Perfect
              <span className="block text-stone-700">Home Insurance Quote</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Use our interactive calculator to customize your coverage and see your premium instantly. 
              No hidden fees, no surprises - just transparent pricing for comprehensive protection.
            </p>
            <Badge variant="outline" className="bg-white text-stone-700 border-stone-300 px-4 py-2">
              <Calculator className="h-4 w-4 mr-2" />
              Interactive Coverage Calculator
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="calculator" className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto mb-12">
                <TabsTrigger value="calculator" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Calculator
                </TabsTrigger>
                <TabsTrigger value="coverage" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Coverage
                </TabsTrigger>
                <TabsTrigger value="features" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Features
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calculator" className="space-y-8">
                <div className="max-w-4xl mx-auto">
                  <CoverageCalculator onPremiumChange={handlePremiumChange} />
                </div>
              </TabsContent>

              <TabsContent value="coverage" className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        What's Covered
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {whatsCovered.map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Coverage Limits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Dwelling Coverage</h3>
                        <p className="text-sm text-muted-foreground">Up to R10 million for your home structure</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Contents Coverage</h3>
                        <p className="text-sm text-muted-foreground">Up to R5 million for personal belongings</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Personal Liability</h3>
                        <p className="text-sm text-muted-foreground">Up to R5 million for third-party claims</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Alternative Accommodation</h3>
                        <p className="text-sm text-muted-foreground">12 months temporary housing if needed</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-stone-100 rounded-full mb-4 mx-auto">
                            <Icon className="h-6 w-6 text-stone-700" />
                          </div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-stone-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Protected?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of South Africans who trust Lalisure to protect their homes and families.
          </p>
          {selectedPremium > 0 && (
            <div className="bg-white/10 rounded-lg p-6 max-w-md mx-auto mb-8">
              <h3 className="text-lg font-semibold mb-2">Your Calculated Premium</h3>
              <div className="text-3xl font-bold text-green-400 mb-2">
                {formatCurrency(selectedPremium)}/month
              </div>
              <p className="text-sm opacity-90">
                Based on {selectedCoverage ? formatCurrency(selectedCoverage.dwelling) : ''} dwelling coverage
              </p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-stone-700 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition-colors">
              Get This Quote
            </button>
            <button className="border-2 border-white text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-white hover:text-stone-700 transition-colors">
              Speak to an Expert
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductsPage;
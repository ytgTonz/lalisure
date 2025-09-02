'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Shield, FileText, Clock } from 'lucide-react';

const features = [
  {
    icon: Home,
    title: 'Home Protection',
    description: 'Comprehensive coverage for your dwelling, personal property, and liability protection.',
    benefits: ['Structure coverage', 'Personal belongings', 'Liability protection', 'Additional living expenses']
  },
  {
    icon: Shield,
    title: 'Claims Support',
    description: '24/7 claims processing with dedicated support agents to help you every step of the way.',
    benefits: ['24/7 availability', 'Fast processing', 'Dedicated agents', 'Digital claims filing']
  },
  {
    icon: FileText,
    title: 'Easy Application',
    description: 'Simple online application process with instant quotes and digital policy management.',
    benefits: ['Online application', 'Instant quotes', 'Digital policies', 'Mobile access']
  },
  {
    icon: Clock,
    title: 'Quick Approval',
    description: 'Get approved and covered in minutes with our streamlined underwriting process.',
    benefits: ['Fast approval', 'Instant coverage', 'No paperwork', 'Digital verification']
  }
];

export function ProductShowcase() {
  return (
    <section id="coverage" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Lalisure?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We make home insurance simple, affordable, and accessible. 
            Protect what matters most with coverage you can trust.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-insurance-blue rounded-full w-fit">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-6">
                  {feature.description}
                </CardDescription>
                <ul className="text-sm text-gray-500 space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 bg-insurance-green rounded-full"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Protected?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of homeowners who trust Lalisure to protect their most valuable asset.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-insurance-blue mb-2">10,000+</div>
                <div className="text-gray-600">Policies Issued</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-insurance-green mb-2">98%</div>
                <div className="text-gray-600">Customer Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-insurance-orange mb-2">24/7</div>
                <div className="text-gray-600">Claims Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
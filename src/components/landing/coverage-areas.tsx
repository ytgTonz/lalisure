'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

const provinces = [
  { name: 'Western Cape', cities: ['Cape Town', 'Stellenbosch', 'George'] },
  { name: 'Gauteng', cities: ['Johannesburg', 'Pretoria', 'Sandton'] },
  { name: 'KwaZulu-Natal', cities: ['Durban', 'Pietermaritzburg', 'Newcastle'] },
  { name: 'Eastern Cape', cities: ['Port Elizabeth', 'East London', 'Grahamstown'] },
  { name: 'Free State', cities: ['Bloemfontein', 'Welkom', 'Kroonstad'] },
  { name: 'Limpopo', cities: ['Polokwane', 'Tzaneen', 'Thohoyandou'] },
  { name: 'Mpumalanga', cities: ['Nelspruit', 'Witbank', 'Secunda'] },
  { name: 'North West', cities: ['Rustenburg', 'Klerksdorp', 'Potchefstroom'] },
  { name: 'Northern Cape', cities: ['Kimberley', 'Upington', 'Springbok'] }
];

export function CoverageAreas() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Coverage Across South Africa
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're proud to serve homeowners in all nine provinces. 
            No matter where you are in South Africa, we've got you covered.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {provinces.map((province, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-insurance-blue" />
                  {province.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {province.cities.map((city, cityIndex) => (
                    <div key={cityIndex} className="text-sm text-gray-600">
                      • {city}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6">
              Get your personalized home insurance quote in minutes, or contact our team for assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-insurance-blue hover:bg-blue-700"
                asChild
              >
                <Link href="/sign-up">
                  Get Your Quote
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-insurance-blue text-insurance-blue hover:bg-insurance-blue hover:text-white"
                asChild
              >
                <Link href="/sign-in">
                  Existing Customer
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center border-t pt-8">
            <div className="space-y-2">
              <Phone className="h-8 w-8 text-insurance-green mx-auto" />
              <h4 className="font-semibold text-gray-900">Call Us</h4>
              <p className="text-gray-600">0800 LALISURE</p>
              <p className="text-sm text-gray-500">(0800 525 478)</p>
            </div>
            
            <div className="space-y-2">
              <Mail className="h-8 w-8 text-insurance-orange mx-auto" />
              <h4 className="font-semibold text-gray-900">Email Us</h4>
              <p className="text-gray-600">info@lalisure.co.za</p>
              <p className="text-sm text-gray-500">24/7 support</p>
            </div>
            
            <div className="space-y-2">
              <MapPin className="h-8 w-8 text-insurance-blue mx-auto" />
              <h4 className="font-semibold text-gray-900">Visit Us</h4>
              <p className="text-gray-600">Cape Town Head Office</p>
              <p className="text-sm text-gray-500">Mon-Fri 8AM-5PM</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
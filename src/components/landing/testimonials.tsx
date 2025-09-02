'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    location: 'Cape Town, Western Cape',
    rating: 5,
    content: 'Lalisure made getting home insurance so easy! The online process was smooth, and when I had a claim after a storm, they handled everything quickly and professionally.',
    avatar: 'SM'
  },
  {
    name: 'David Johnson',
    location: 'Johannesburg, Gauteng',
    rating: 5,
    content: 'Best rates I found anywhere, and the customer service is outstanding. They actually answer the phone when you call, and the agents are knowledgeable and helpful.',
    avatar: 'DJ'
  },
  {
    name: 'Maria Rodriguez',
    location: 'Durban, KwaZulu-Natal',
    rating: 5,
    content: 'After comparing multiple insurers, Lalisure offered the best coverage for my budget. The mobile app makes managing my policy super convenient.',
    avatar: 'MR'
  },
  {
    name: 'Thabo Mthembu',
    location: 'Pretoria, Gauteng',
    rating: 5,
    content: 'Had a water damage claim processed in just 3 days. The adjuster was thorough and fair, and payment was quick. Highly recommend Lalisure.',
    avatar: 'TM'
  },
  {
    name: 'Lisa van der Merwe',
    location: 'Port Elizabeth, Eastern Cape',
    rating: 5,
    content: 'Switching to Lalisure saved me 30% on my premium without compromising coverage. Their online tools make everything transparent and easy to understand.',
    avatar: 'LM'
  },
  {
    name: 'Ahmed Hassan',
    location: 'Bloemfontein, Free State',
    rating: 5,
    content: 'Excellent experience from quote to claim. The team really cares about their customers and it shows in every interaction.',
    avatar: 'AH'
  }
];

export function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what homeowners across South Africa 
            have to say about their Lalisure experience.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-insurance-blue rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                  <Quote className="h-6 w-6 text-insurance-green opacity-50" />
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-700 leading-relaxed">
                  "{testimonial.content}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-insurance-green/10 text-insurance-green px-6 py-3 rounded-full">
            <Star className="h-5 w-5 fill-current" />
            <span className="font-semibold">4.9/5 Average Rating</span>
            <span className="text-gray-600">from 2,500+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
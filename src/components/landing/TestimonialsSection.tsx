
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const TestimonialCard = dynamic(() => import('./TestimonialCard'), { ssr: false });

const testimonials = [
  {
    testimonial: "The best decision I made for my home. The process was incredibly simple and the team was so helpful. I feel secure knowing Lalisure has my back.",
    customerName: "Thabo Nkosi",
    customerTitle: "Gauteng",
    avatarUrl: "/avatars/avatar-1.jpg"
  },
  {
    testimonial: "I was impressed by the affordable rates and the level of coverage offered. Lalisure is a game-changer for home insurance in South Africa.",
    customerName: "Anelisa van der Merwe",
    customerTitle: "Western Cape",
    avatarUrl: "/avatars/avatar-2.jpg"
  },
  {
    testimonial: "Switching to Lalisure was seamless. Their team guided me through every step, and I ended up with better coverage for a lower price. Highly recommended!",
    customerName: "Sipho Zulu",
    customerTitle: "KwaZulu-Natal",
    avatarUrl: "/SaneleVuza.jpg"
  },
  {
    testimonial: "Outstanding customer service! When I had a claim, they handled everything quickly and professionally. I couldn't be happier with my choice.",
    customerName: "Nomsa Mthembu",
    customerTitle: "Eastern Cape",
    avatarUrl: "/YolaGcolotela.jpg"
  },
  {
    testimonial: "Fair pricing and comprehensive coverage. Lalisure made it easy to understand exactly what I'm getting. Peace of mind is priceless!",
    customerName: "Johan van Zyl",
    customerTitle: "Free State",
    avatarUrl: "/BarringtonShirely.jpeg"
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  // Create extended array for seamless infinite scroll
  const extendedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-2">Loved by Homeowners Nationwide</h2>
          <p className="text-lg text-gray-600">Real stories from our satisfied customers.</p>
        </div>
        
        {/* Flowing testimonials container */}
        <div className="relative h-96">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="flex space-x-8 transition-transform duration-1000 ease-in-out"
              style={{ 
                transform: `translateX(-${(currentIndex * 320) + 160}px)`,
                width: 'calc(100% + 2000px)'
              }}
            >
              {extendedTestimonials.map((testimonial, index) => (
                <div 
                  key={`${index}-${Math.floor(index / testimonials.length)}`}
                  className="flex-shrink-0 w-80"
                >
                  <TestimonialCard
                    testimonial={testimonial.testimonial}
                    customerName={testimonial.customerName}
                    customerTitle={testimonial.customerTitle}
                    avatarUrl={testimonial.avatarUrl}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Gradient overlays to create fade effect */}
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10"></div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index === currentIndex 
                  ? 'bg-stone-700' 
                  : 'bg-stone-300 hover:bg-stone-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

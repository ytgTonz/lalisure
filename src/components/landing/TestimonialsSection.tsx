
'use client';

import dynamic from 'next/dynamic';

const TestimonialCard = dynamic(() => import('./TestimonialCard'), { ssr: false });

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-2">Loved by Homeowners Nationwide</h2>
          <p className="text-lg text-gray-600">Real stories from our satisfied customers.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <TestimonialCard
            testimonial="The best decision I made for my home. The process was incredibly simple and the team was so helpful. I feel secure knowing Lalisure has my back."
            customerName="Thabo Nkosi"
            customerTitle="Gauteng"
            avatarUrl="/avatars/avatar-1.jpg"
          />
          <TestimonialCard
            testimonial="I was impressed by the affordable rates and the level of coverage offered. Lalisure is a game-changer for home insurance in South Africa."
            customerName="Anelisa van der Merwe"
            customerTitle="Western Cape"
            avatarUrl="/avatars/avatar-2.jpg"
          />
          <TestimonialCard
            testimonial="Switching to Lalisure was seamless. Their team guided me through every step, and I ended up with better coverage for a lower price. Highly recommended!"
            customerName="Sipho Zulu"
            customerTitle="KwaZulu-Natal"
            avatarUrl="/SaneleVuza.jpg"
          />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

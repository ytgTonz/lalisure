'use client';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PricingCard from '../../components/PricingCard';
import { Shield } from 'lucide-react';

const ProductsPage = () => {
  const products = [
    {
      title: 'Essential Home',
      price: '199',
      description: 'Basic coverage for your home and belongings',
      features: [
        { feature: 'Building cover up to R1.5M', included: true },
        { feature: 'Contents cover up to R500K', included: true },
        { feature: 'Basic theft protection', included: true },
        { feature: 'Fire and natural disaster cover', included: true },
        { feature: '24/7 emergency assistance', included: false },
        { feature: 'Alternative accommodation', included: false },
        { feature: 'Personal liability cover', included: false },
      ],
      buttonText: 'Choose Essential'
    },
    {
      title: 'Comprehensive Home',
      price: '399',
      description: 'Complete protection with additional benefits',
      features: [
        { feature: 'Building cover up to R3M', included: true },
        { feature: 'Contents cover up to R1.5M', included: true },
        { feature: 'Advanced security system discount', included: true },
        { feature: 'Fire and natural disaster cover', included: true },
        { feature: '24/7 emergency assistance', included: true },
        { feature: 'Alternative accommodation', included: true },
        { feature: 'Personal liability cover up to R2M', included: true },
      ],
      highlighted: true,
      buttonText: 'Choose Comprehensive'
    },
    {
      title: 'Premium Home',
      price: '599',
      description: 'Ultimate coverage with luxury benefits',
      features: [
        { feature: 'Building cover up to R5M', included: true },
        { feature: 'Contents cover up to R3M', included: true },
        { feature: 'Luxury item specialist cover', included: true },
        { feature: 'Fire and natural disaster cover', included: true },
        { feature: '24/7 concierge emergency assistance', included: true },
        { feature: 'Premium alternative accommodation', included: true },
        { feature: 'Personal liability cover up to R5M', included: true },
      ],
      buttonText: 'Choose Premium'
    }
  ];


  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-stone-50 to-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Flexible home insurance plans designed to meet your specific needs and budget. 
            All plans include our commitment to exceptional service and fast claims processing.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-subtle-lines">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {products.map((product, index) => (
              <PricingCard
                key={index}
                title={product.title}
                price={product.price}
                description={product.description}
                features={product.features}
                highlighted={product.highlighted}
                buttonText={product.buttonText}
                onSelect={() => {
                  // Handle product selection
                  console.log(`Selected: ${product.title}`);
                }}
              />
            ))}
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-stone-700 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition-colors">
              Get Free Quote
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
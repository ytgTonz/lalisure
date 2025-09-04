'use client';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Button } from '../../components/ui/Button';
import { Shield, Users, Award, TrendingUp, Heart, Target, Eye } from 'lucide-react';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Barrington Shirely',
      role: 'CEO',
      description: 'Visionary leader with a passion for innovation and customer-centric solutions.',
      image: '/BarringtonShirely.jpeg'
    },
    {
      name: 'Sanele Vuza',
      role: 'Chief Technology Officer',
      description: 'Tech innovator focused on making insurance accessible and digital-first',
      image: '/SaneleVuza.jpg'
    },
    {
      name: 'David Nkomo',
      role: 'Head of Claims',
      description: 'Dedicated to fast, fair claims processing with a customer-first approach',
      image: null
    },
    {
      name: 'Yola Gcolotela',
      role: 'Head of Underwriting',
      description: 'Risk assessment expert ensuring competitive and fair pricing',
      image: '/YolaGcolotela.jpg'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Homes Protected', icon: Shield },
    { number: '98%', label: 'Customer Satisfaction', icon: Heart },
    { number: '24hrs', label: 'Average Claim Processing', icon: TrendingUp },
    { number: '50+', label: 'Team Members', icon: Users }
  ];

  const values = [
    {
      icon: Target,
      title: 'Customer First',
      description: 'Every decision we make puts our customers and their needs at the center.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'We protect your most valuable assets with unwavering reliability and transparency.'
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'We leverage technology to make insurance simpler, faster, and more accessible.'
    },
    {
      icon: Heart,
      title: 'Community',
      description: 'We\'re proudly South African, committed to building stronger communities.'
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-stone-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About Lalisure
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We're on a mission to make home insurance accessible, affordable, and 
              straightforward for every South African family.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-stone-50 p-8 rounded-2xl">
              <Target className="h-12 w-12 text-stone-700 mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                To democratize home insurance by providing modern, transparent, and 
                affordable protection that every South African homeowner can access 
                and understand. We believe insurance should be a safety net, not a burden.
              </p>
            </div>
            <div className="bg-blue-50 p-8 rounded-2xl">
              <Eye className="h-12 w-12 text-blue-700 mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                To become the most trusted home insurance provider in South Africa, 
                known for our exceptional service, fair pricing, and commitment to 
                protecting what matters most to our customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-stone-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl text-stone-200">The numbers that showcase our commitment to excellence</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-600 rounded-full mb-4">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-stone-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Story</h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p className="mb-6">
                Lalisure was founded in 2020 when our team of insurance veterans recognized 
                a fundamental problem: home insurance in South Africa was too complex, too 
                expensive, and too difficult to access for the average homeowner.
              </p>
              <p className="mb-6">
                Having worked at traditional insurers for decades, we saw firsthand how 
                outdated processes, complex jargon, and high operational costs were preventing 
                millions of South Africans from protecting their most valuable asset - their homes.
              </p>
              <p className="mb-6">
                We decided to build something different. Using modern technology, transparent 
                processes, and a customer-first approach, we created Lalisure to bridge the 
                gap between what homeowners need and what the insurance industry was providing.
              </p>
              <p>
                Today, we're proud to protect thousands of homes across South Africa, and we're 
                just getting started. Our commitment remains the same: to provide exceptional 
                home insurance that's accessible, affordable, and actually works when you need it most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md text-center">
                <value.icon className="h-12 w-12 text-stone-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-subtle-lines">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The people behind Lalisure's mission</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="h-16 w-16 text-stone-600" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-stone-700 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-stone-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
          <p className="text-xl mb-8 text-stone-200 max-w-2xl mx-auto">
            Experience the Lalisure difference. Get a quote in minutes and join thousands 
            of satisfied homeowners who trust us to protect their homes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              rounded="full"
              className="bg-white text-stone-700 hover:bg-gray-100"
            >
              Get Your Quote
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              rounded="full"
              className="border-white text-white hover:bg-white hover:text-stone-700"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
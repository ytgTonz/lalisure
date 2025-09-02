'use client';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ContactForm from '../../components/ContactForm';
import { MapPin, Phone, Mail, Clock, MessageCircle, Users, HeadphonesIcon } from 'lucide-react';

const ContactPage = () => {
  const contactMethods = [
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak directly with our team',
      details: '+27 11 123 4567',
      subDetails: 'Mon-Fri: 8AM-6PM, Sat: 9AM-1PM',
      action: 'Call Now'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      details: 'support@lalisure.co.za',
      subDetails: 'We respond within 24 hours',
      action: 'Send Email'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with us online',
      details: 'Available on our website',
      subDetails: 'Mon-Fri: 8AM-8PM',
      action: 'Start Chat'
    }
  ];

  const offices = [
    {
      city: 'Johannesburg',
      address: '123 Business District, Sandton, 2196',
      phone: '+27 11 123 4567',
      email: 'jhb@lalisure.co.za'
    },
    {
      city: 'Cape Town',
      address: '456 Waterfront Plaza, V&A Waterfront, 8001',
      phone: '+27 21 987 6543',
      email: 'cpt@lalisure.co.za'
    },
    {
      city: 'Durban',
      address: '789 Marine Drive, uMhlanga, 4319',
      phone: '+27 31 555 7890',
      email: 'dbn@lalisure.co.za'
    }
  ];

  const faqs = [
    {
      question: 'How quickly can I get a quote?',
      answer: 'You can get a personalized quote in under 5 minutes through our online platform.'
    },
    {
      question: 'What documents do I need for a claim?',
      answer: 'Generally, you\'ll need photos of damage, police report (if applicable), and any receipts for damaged items.'
    },
    {
      question: 'Can I adjust my coverage anytime?',
      answer: 'Yes, you can modify your coverage through your online dashboard or by contacting our support team.'
    },
    {
      question: 'Do you offer discounts?',
      answer: 'We offer various discounts including security system discounts, multi-year policies, and loyalty rewards.'
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
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We're here to help with all your home insurance questions and needs. 
              Reach out to us anytime – we're always ready to assist.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md border text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <method.icon className="h-8 w-8 text-stone-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <p className="font-medium text-stone-700 mb-1">{method.details}</p>
                <p className="text-sm text-gray-500 mb-6">{method.subDetails}</p>
                <button className="text-stone-700 font-medium hover:text-stone-800 transition-colors">
                  {method.action} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <ContactForm onSubmit={(data) => console.log('Form submitted:', data)} />
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-stone-700 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Head Office</h3>
                      <p className="text-gray-600">123 Business District, Sandton, Johannesburg, 2196</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-stone-700 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Phone</h3>
                      <p className="text-gray-600">+27 11 123 4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-stone-700 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">support@lalisure.co.za</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-stone-700 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Business Hours</h3>
                      <p className="text-gray-600">
                        Monday - Friday: 8:00 AM - 6:00 PM<br />
                        Saturday: 9:00 AM - 1:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <div className="flex items-center gap-3 mb-3">
                  <HeadphonesIcon className="h-6 w-6 text-red-600" />
                  <h3 className="font-semibold text-red-800">24/7 Emergency Claims</h3>
                </div>
                <p className="text-red-700 mb-2">
                  For urgent claims outside business hours:
                </p>
                <p className="font-semibold text-red-800">+27 82 911 HELP (4357)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Offices</h2>
            <p className="text-xl text-gray-600">Visit us at any of our locations across South Africa</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {offices.map((office, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{office.city}</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600 text-sm">{office.address}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <p className="text-gray-600 text-sm">{office.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <p className="text-gray-600 text-sm">{office.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">Quick answers to common questions</p>
            </div>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
              <button className="text-stone-700 font-medium hover:text-stone-800 transition-colors">
                View all FAQs →
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
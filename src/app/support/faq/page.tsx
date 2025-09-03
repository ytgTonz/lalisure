'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Phone, MessageCircle, Mail } from 'lucide-react';
import SupportLayout from '@/components/support/support-layout';
import SearchBar from '@/components/support/search-bar';
import { Accordion, AccordionItem } from '@/components/ui/accordion';

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'policies', name: 'Policies & Coverage' },
    { id: 'claims', name: 'Claims Process' },
    { id: 'billing', name: 'Billing & Payments' },
    { id: 'account', name: 'Account Management' },
    { id: 'general', name: 'General Information' }
  ];

  const faqs = [
    {
      category: 'policies',
      question: 'What types of home insurance coverage do you offer?',
      answer: `We offer comprehensive home insurance coverage including:
      
      • **Buildings Cover**: Protection for the structure of your home, including walls, roof, floors, and fixed features like built-in cupboards and bathroom fittings.
      
      • **Contents Cover**: Protection for your personal belongings including furniture, electronics, clothing, and other moveable items.
      
      • **All Risks Cover**: Additional protection for specified valuable items like jewelry, laptops, and cameras, even when taken outside your home.
      
      • **Public Liability**: Coverage for accidental damage or injury caused to third parties on your property.
      
      Our policies can be customized to suit your specific needs and budget. Contact us for a personalized quote.`
    },
    {
      category: 'policies',
      question: 'How are insurance premiums calculated?',
      answer: `Insurance premiums are calculated based on several factors:
      
      • **Property Value**: The replacement cost of your home and contents
      • **Location**: Crime statistics and natural disaster risk in your area  
      • **Security Features**: Burglar alarms, armed response, security gates
      • **Age and Condition**: Age of the property and maintenance status
      • **Claims History**: Your previous insurance claims record
      • **Excess Amount**: Higher excess typically means lower premiums
      • **Payment Method**: Annual payments often qualify for discounts
      
      We use advanced risk assessment tools to ensure fair and competitive pricing while maintaining comprehensive coverage.`
    },
    {
      category: 'claims',
      question: 'How do I file an insurance claim?',
      answer: `Filing a claim is simple with Lalisure:
      
      **Online (24/7)**:
      1. Log into your account at lalisure.co.za
      2. Navigate to "Claims" and click "File New Claim"
      3. Complete the online form with incident details
      4. Upload photos and supporting documents
      5. Submit your claim for review
      
      **By Phone**:
      • Call our claims hotline: +27 82 911 HELP (4357)
      • Available 24/7 for emergencies
      • Have your policy number ready
      
      **Required Information**:
      • Policy number and personal details
      • Date, time, and location of incident
      • Detailed description of what happened
      • Photos of damage (if applicable)
      • Police case number (for theft/malicious damage)
      • Contact details for any witnesses`
    },
    {
      category: 'claims',
      question: 'How long does the claims process take?',
      answer: `Our claims process is designed to be as quick as possible:
      
      **Immediate**: Claim acknowledgment within 24 hours
      **Day 1-3**: Assessor appointment scheduled
      **Day 3-7**: Assessment conducted and report submitted
      **Day 7-14**: Claim decision communicated
      **Day 14-21**: Payment processed for approved claims
      
      **Factors affecting timeline**:
      • Complexity of the claim
      • Availability of supporting documentation
      • Need for specialist assessments
      • Third-party investigations (police reports, etc.)
      
      We keep you updated throughout the process via SMS, email, and through your online account. For urgent repairs, we can authorize emergency work within 48 hours.`
    },
    {
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: `We offer flexible payment options to suit your needs:
      
      **Monthly Debit Orders**:
      • Bank account debit order
      • Credit card debit order
      • Most convenient option with no processing fees
      
      **Annual Payments**:
      • 5% discount for annual payments
      • EFT bank transfer
      • Credit card payment
      
      **Other Methods**:
      • Online banking payments
      • Branch deposits (major banks)
      • Premium collection at your workplace
      
      **Payment Schedule**:
      • Monthly: 1st or 15th of each month
      • Quarterly: Every 3 months
      • Annually: On your policy anniversary
      
      Set up automatic payments to ensure your coverage never lapses and to qualify for payment method discounts.`
    },
    {
      category: 'billing',
      question: 'What happens if I miss a payment?',
      answer: `We understand that payment delays can happen:
      
      **Grace Period**: 15-day grace period after missed payment
      **Notifications**: SMS and email reminders sent immediately
      **Coverage**: Policy remains active during grace period
      
      **After Grace Period**:
      • Policy may be suspended
      • No claims can be processed
      • Additional fees may apply
      
      **Reinstatement**:
      • Pay outstanding amount plus any fees
      • Coverage resumes immediately
      • No waiting period for existing conditions
      
      **Prevention Tips**:
      • Set up automatic debit orders
      • Update payment details promptly
      • Contact us if experiencing financial difficulties
      
      We're here to help find solutions that work for your situation. Early communication is key to avoiding policy lapses.`
    },
    {
      category: 'account',
      question: 'How do I update my personal information?',
      answer: `Keeping your information current is important for policy accuracy:
      
      **Online (24/7)**:
      1. Log into your Lalisure account
      2. Navigate to "My Profile"
      3. Update relevant information
      4. Save changes (some updates require verification)
      
      **Information You Can Update**:
      • Contact details (phone, email, address)
      • Emergency contact information
      • Banking details for payments
      • Security preferences
      • Communication preferences
      
      **Documents Required** (for certain changes):
      • ID document (address changes)
      • Bank statements (banking detail changes)
      • Marriage certificate (surname changes)
      
      **Important Changes to Report**:
      • Change of address
      • Structural alterations to property
      • New security installations
      • Change in property use (e.g., home office)
      
      Contact us immediately for major changes that might affect your coverage or premium.`
    },
    {
      category: 'account',
      question: 'How do I cancel my policy?',
      answer: `While we'd hate to see you go, cancellation is straightforward:
      
      **Notice Period**: 31 days written notice required
      
      **Cancellation Methods**:
      • Online through your account portal
      • Email: cancellations@lalisure.co.za
      • Phone: +27 11 123 4567
      • Written letter to our offices
      
      **Required Information**:
      • Policy number
      • Reason for cancellation
      • Effective cancellation date
      • Signed confirmation
      
      **Financial Implications**:
      • Pro-rata refund for unused premium
      • Deduction of outstanding premiums/claims
      • Administration fees may apply
      
      **Before You Cancel**:
      • Ensure alternative coverage is in place
      • Consider policy adjustments instead
      • Speak to our retention team about options
      
      **Cooling-off Period**: 14 days to reverse cancellation if you change your mind.`
    },
    {
      category: 'general',
      question: 'Do you offer discounts on premiums?',
      answer: `Yes! We offer various discounts to help reduce your premiums:
      
      **Security Discounts** (up to 15%):
      • Burglar alarms monitored by security companies
      • Armed response services
      • Security gates and burglar bars
      • CCTV surveillance systems
      
      **Payment Discounts**:
      • 5% discount for annual premium payments
      • 2% discount for 6-monthly payments
      • No-fee debit order collections
      
      **Loyalty Discounts**:
      • Claim-free discount (increases annually)
      • Long-term client discounts
      • Multiple policy discounts
      
      **Special Offers**:
      • New client introductory rates
      • Referral bonuses
      • Seasonal promotions
      
      **Qualification Requirements**:
      • Security certificates for security discounts
      • Proof of installation for new security features
      • Clean claims record for loyalty discounts
      
      Contact us for a comprehensive review to ensure you're getting all applicable discounts.`
    },
    {
      category: 'general',
      question: 'What areas do you provide coverage in?',
      answer: `Lalisure provides comprehensive home insurance coverage throughout South Africa:
      
      **Primary Coverage Areas**:
      • Gauteng (Johannesburg, Pretoria, East Rand, West Rand)
      • Western Cape (Cape Town, Stellenbosch, Somerset West)
      • KwaZulu-Natal (Durban, Pietermaritzburg, Ballito)
      
      **Expanding Coverage**:
      • Eastern Cape (Port Elizabeth, East London)
      • Free State (Bloemfontein)
      • Mpumalanga (Nelspruit, Witbank)
      
      **Risk Assessment Factors by Area**:
      • Crime statistics and security risk
      • Natural disaster probability
      • Emergency service availability
      • Local building regulations
      
      **Special Considerations**:
      • Coastal properties (additional wind/storm cover)
      • Rural properties (special assessment required)
      • Sectional title properties
      • Luxury homes and estates
      
      Contact us with your specific location for coverage availability and customized risk assessment. We're continuously expanding our service areas.`
    },
    {
      category: 'general',
      question: 'How quickly can I get coverage after applying?',
      answer: `We pride ourselves on fast, efficient service:
      
      **Instant Online Quotes**: Get a quote in under 5 minutes
      **Same-Day Coverage**: Available for standard residential properties
      **Next-Day Coverage**: For properties requiring additional assessment
      
      **Application Process**:
      1. **Online Quote** (5 minutes): Basic property information
      2. **Detailed Application** (15 minutes): Complete property details
      3. **Document Upload** (10 minutes): ID, bank details, photos
      4. **Assessment** (Same day/24 hours): Risk evaluation
      5. **Policy Issuance** (Immediate): Coverage begins
      
      **Required Documents**:
      • Copy of ID document
      • Proof of banking details
      • Recent property photos
      • Municipal rates notice (address verification)
      
      **Factors Affecting Processing Time**:
      • Property type and condition
      • Coverage amount requested
      • Security features present
      • Previous insurance history
      
      **Emergency Coverage**: Contact us for urgent coverage needs - we can often provide immediate temporary coverage while processing your full application.`
    }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <SupportLayout
      title="Frequently Asked Questions"
      description="Find quick answers to the most common questions about home insurance, claims, billing, and your account."
      breadcrumbText="FAQ"
    >
      <div className="container mx-auto px-4">
        {/* Search Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <SearchBar 
            placeholder="Search frequently asked questions..."
            onSearch={handleSearch}
          />
        </div>

        {/* Category Filter */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-stone-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto mb-16">
          {searchQuery && (
            <div className="mb-6">
              <p className="text-gray-600">
                {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} found for "{searchQuery}"
              </p>
            </div>
          )}

          <Accordion>
            {filteredFAQs.map((faq, index) => (
              <AccordionItem
                key={index}
                title={faq.question}
                className="mb-4"
              >
                <div 
                  className="prose prose-stone max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: faq.answer.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/•/g, '<span class="text-stone-700">•</span>') 
                  }}
                />
              </AccordionItem>
            ))}
          </Accordion>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No FAQs found matching your search criteria.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-stone-700 hover:text-stone-800 font-medium"
              >
                Clear filters and view all FAQs
              </button>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-stone-50 rounded-xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h3>
              <p className="text-gray-600">
                Can't find the answer you're looking for? Our support team is ready to help.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/contact"
                className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200 text-center group"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Call Us</h4>
                <p className="text-sm text-gray-600 mb-3">Speak directly with our support team</p>
                <p className="text-sm font-medium text-blue-600">+27 11 123 4567</p>
              </Link>

              <Link
                href="/contact"
                className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200 text-center group"
              >
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-green-100 transition-colors">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Email Support</h4>
                <p className="text-sm text-gray-600 mb-3">Get help via email within 24 hours</p>
                <p className="text-sm font-medium text-green-600">support@lalisure.co.za</p>
              </Link>

              <Link
                href="/support/help-center"
                className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200 text-center group"
              >
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-100 transition-colors">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Help Center</h4>
                <p className="text-sm text-gray-600 mb-3">Browse our comprehensive guides</p>
                <p className="text-sm font-medium text-purple-600">Visit Help Center</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SupportLayout>
  );
};

export default FAQPage;
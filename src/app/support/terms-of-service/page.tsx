'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Mail, Phone, Scale } from 'lucide-react';
import SupportLayout from '@/components/support/support-layout';
import TableOfContents from '@/components/support/table-of-contents';

const TermsOfServicePage = () => {
  const tocItems = [
    { id: 'introduction', title: '1. Introduction and Acceptance', level: 1 },
    { id: 'definitions', title: '2. Definitions', level: 1 },
    { id: 'services', title: '3. Insurance Services', level: 1 },
    { id: 'eligibility', title: '4. Eligibility Requirements', level: 1 },
    { id: 'account', title: '5. Account Registration and Management', level: 1 },
    { id: 'policies', title: '6. Insurance Policies and Coverage', level: 1 },
    { id: 'premiums', title: '7. Premiums and Payments', level: 1 },
    { id: 'claims', title: '8. Claims Process and Procedures', level: 1 },
    { id: 'responsibilities', title: '9. Your Responsibilities', level: 1 },
    { id: 'prohibited', title: '10. Prohibited Uses and Conduct', level: 1 },
    { id: 'intellectual', title: '11. Intellectual Property Rights', level: 1 },
    { id: 'privacy', title: '12. Privacy and Data Protection', level: 1 },
    { id: 'disclaimers', title: '13. Disclaimers and Warranties', level: 1 },
    { id: 'limitation', title: '14. Limitation of Liability', level: 1 },
    { id: 'indemnification', title: '15. Indemnification', level: 1 },
    { id: 'termination', title: '16. Termination and Suspension', level: 1 },
    { id: 'governing', title: '17. Governing Law and Jurisdiction', level: 1 },
    { id: 'disputes', title: '18. Dispute Resolution', level: 1 },
    { id: 'modifications', title: '19. Modifications to Terms', level: 1 },
    { id: 'general', title: '20. General Provisions', level: 1 },
    { id: 'contact', title: '21. Contact Information', level: 1 },
  ];

  return (
    <SupportLayout
      title="Terms of Service"
      description="Read our terms and conditions governing the use of Lalisure insurance services and platform."
      breadcrumbText="Terms of Service"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Table of Contents */}
            <div className="lg:col-span-1">
              <TableOfContents items={tocItems} />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border p-8">
                {/* Last Updated */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-8 pb-6 border-b border-gray-200">
                  <Calendar className="h-4 w-4" />
                  <span>Last updated: January 15, 2025</span>
                </div>

                {/* Section 1: Introduction */}
                <section id="introduction" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Introduction and Acceptance</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      These Terms of Service ("Terms") constitute a legally binding agreement between you and 
                      Lalisure (Pty) Ltd, a company incorporated in South Africa with registration number 
                      [Registration Number], ("Lalisure," "we," "us," or "our").
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      By accessing or using our website (lalisure.co.za), mobile applications, or any of our 
                      insurance services, you acknowledge that you have read, understood, and agree to be bound by these Terms.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      If you do not agree to these Terms, you must not use our services. We may modify these 
                      Terms at any time, and such modifications will be effective upon posting on our website.
                    </p>
                  </div>
                </section>

                {/* Section 2: Definitions */}
                <section id="definitions" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Definitions</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      For the purposes of these Terms, the following definitions apply:
                    </p>
                    <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                      <li><strong>"Services"</strong> means all insurance products, digital platforms, customer support, and related services provided by Lalisure.</li>
                      <li><strong>"Platform"</strong> refers to our website, mobile applications, and any other digital interfaces.</li>
                      <li><strong>"User" or "You"</strong> means any individual or entity accessing or using our Services.</li>
                      <li><strong>"Policy"</strong> means any insurance contract between you and Lalisure or our underwriting partners.</li>
                      <li><strong>"Claim"</strong> means a formal request for compensation under an insurance policy.</li>
                      <li><strong>"Premium"</strong> means the amount payable for insurance coverage.</li>
                    </ul>
                  </div>
                </section>

                {/* Section 3: Services */}
                <section id="services" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Insurance Services</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Lalisure provides home insurance services including but not limited to:
                    </p>
                    <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                      <li>Buildings and contents insurance</li>
                      <li>All risks insurance for specified items</li>
                      <li>Public liability coverage</li>
                      <li>Digital platform for policy management</li>
                      <li>Claims processing and management</li>
                      <li>Customer support and advisory services</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We act as an insurance broker and may arrange coverage with various underwriting partners. 
                      The specific terms of your insurance coverage are detailed in your policy documents.
                    </p>
                  </div>
                </section>

                {/* Section 4: Eligibility */}
                <section id="eligibility" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Eligibility Requirements</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      To use our Services, you must:
                    </p>
                    <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                      <li>Be at least 18 years old or the legal age of majority in your jurisdiction</li>
                      <li>Be a South African resident or have a valid South African address</li>
                      <li>Provide accurate, current, and complete information</li>
                      <li>Have legal capacity to enter into binding agreements</li>
                      <li>Own or have insurable interest in the property being insured</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We reserve the right to verify your eligibility and may request additional documentation 
                      at any time. Failure to meet eligibility requirements may result in service termination.
                    </p>
                  </div>
                </section>

                {/* Section 5: Account */}
                <section id="account" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Account Registration and Management</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      To access our Services, you must create an account by providing required information. You are responsible for:
                    </p>
                    <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                      <li>Maintaining the confidentiality of your account credentials</li>
                      <li>All activities that occur under your account</li>
                      <li>Keeping your account information accurate and up-to-date</li>
                      <li>Immediately notifying us of any unauthorized use</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We reserve the right to suspend or terminate accounts that violate these Terms or 
                      show suspicious activity. You may not share, transfer, or sell your account to others.
                    </p>
                  </div>
                </section>

                {/* Section 6: Policies */}
                <section id="policies" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Insurance Policies and Coverage</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Insurance coverage is subject to:
                    </p>
                    <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                      <li>Completion of application and underwriting process</li>
                      <li>Payment of required premiums</li>
                      <li>Acceptance by our underwriting partners</li>
                      <li>Compliance with policy terms and conditions</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Your policy documents contain the complete terms of coverage, including exclusions, 
                      limitations, and conditions. These Terms supplement but do not replace your policy terms.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Coverage begins on the date specified in your policy schedule, provided premiums are paid. 
                      You have a 14-day cooling-off period to cancel your policy for a full refund.
                    </p>
                  </div>
                </section>

                {/* Section 7: Premiums */}
                <section id="premiums" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Premiums and Payments</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Premium payments are due as specified in your policy schedule. You agree to:
                    </p>
                    <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                      <li>Pay premiums by the due date to maintain coverage</li>
                      <li>Provide valid payment information</li>
                      <li>Notify us immediately of payment method changes</li>
                      <li>Pay any applicable fees, taxes, or charges</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Late payments may result in policy suspension or termination. A 15-day grace period 
                      applies for missed payments, after which coverage may be suspended.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Premium adjustments may occur at renewal or due to coverage changes, risk reassessment, 
                      or regulatory requirements. We will provide 30 days' notice of premium changes.
                    </p>
                  </div>
                </section>

                {/* Section 8: Claims */}
                <section id="claims" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Claims Process and Procedures</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      When filing a claim, you must:
                    </p>
                    <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                      <li>Notify us as soon as reasonably possible after an incident</li>
                      <li>Provide complete and accurate information</li>
                      <li>Submit all required documentation</li>
                      <li>Cooperate fully with our investigation</li>
                      <li>Take reasonable steps to prevent further damage</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We reserve the right to investigate all claims, appoint assessors, and determine 
                      coverage according to policy terms. Claims settlements are subject to policy limits and deductibles.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Fraudulent claims will be denied and may result in policy cancellation and legal action. 
                      We may share fraud information with industry databases and law enforcement.
                    </p>
                  </div>
                </section>

                {/* Section 9: Responsibilities */}
                <section id="responsibilities" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Your Responsibilities</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      As a user of our Services, you agree to:
                    </p>
                    <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                      <li>Provide truthful, accurate, and complete information</li>
                      <li>Notify us promptly of any material changes</li>
                      <li>Maintain your property in good condition</li>
                      <li>Comply with all applicable laws and regulations</li>
                      <li>Use our Services only for lawful purposes</li>
                      <li>Protect your account credentials</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      You are responsible for ensuring that all information provided remains current and accurate. 
                      Failure to disclose material information may void your coverage.
                    </p>
                  </div>
                </section>

                {/* Section 10: Prohibited Uses */}
                <section id="prohibited" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Prohibited Uses and Conduct</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      You may not:
                    </p>
                    <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                      <li>Submit false, misleading, or fraudulent information</li>
                      <li>Use our Services for illegal activities</li>
                      <li>Attempt to circumvent security measures</li>
                      <li>Access systems without authorization</li>
                      <li>Interfere with or disrupt our Services</li>
                      <li>Violate intellectual property rights</li>
                      <li>Harass, threaten, or abuse our staff or other users</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Violation of these prohibitions may result in immediate termination of Services 
                      and potential legal action.
                    </p>
                  </div>
                </section>

                {/* Section 11: Intellectual Property */}
                <section id="intellectual" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Intellectual Property Rights</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      All content, trademarks, logos, and intellectual property on our platform are owned by 
                      Lalisure or our licensors. You may not:
                    </p>
                    <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                      <li>Copy, reproduce, or distribute our content without permission</li>
                      <li>Use our trademarks or logos without authorization</li>
                      <li>Create derivative works based on our content</li>
                      <li>Reverse engineer our software or systems</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Limited use for personal, non-commercial purposes related to your insurance needs is permitted. 
                      All rights not expressly granted are reserved.
                    </p>
                  </div>
                </section>

                {/* Section 12: Privacy */}
                <section id="privacy" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">12. Privacy and Data Protection</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Your privacy is important to us. Our collection, use, and protection of personal information 
                      is governed by our Privacy Policy, which complies with the Protection of Personal Information Act (POPIA).
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      By using our Services, you consent to the collection, use, and disclosure of information 
                      as described in our Privacy Policy.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      <Link href="/support/privacy-policy" className="text-stone-700 hover:text-stone-800 font-medium">
                        View our Privacy Policy
                      </Link> for detailed information about our data practices.
                    </p>
                  </div>
                </section>

                {/* Section 13: Disclaimers */}
                <section id="disclaimers" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">13. Disclaimers and Warranties</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Our Services are provided "as is" without warranties of any kind. We disclaim all warranties, 
                      express or implied, including but not limited to:
                    </p>
                    <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                      <li>Merchantability and fitness for a particular purpose</li>
                      <li>Uninterrupted or error-free service</li>
                      <li>Accuracy or reliability of information</li>
                      <li>Security or virus-free operation</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      This disclaimer does not affect warranties that cannot be excluded under South African law 
                      or warranties related to your insurance coverage.
                    </p>
                  </div>
                </section>

                {/* Section 14: Limitation of Liability */}
                <section id="limitation" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">14. Limitation of Liability</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      To the maximum extent permitted by law, Lalisure's liability is limited to the amount 
                      of premiums paid by you in the 12 months preceding the event giving rise to liability.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We shall not be liable for indirect, consequential, special, or punitive damages, 
                      including but not limited to loss of profits, data, or business opportunities.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      This limitation does not apply to liability that cannot be excluded under South African law, 
                      including liability for death, personal injury, or fraud.
                    </p>
                  </div>
                </section>

                {/* Section 15: Indemnification */}
                <section id="indemnification" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">15. Indemnification</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      You agree to indemnify and hold harmless Lalisure, its affiliates, officers, directors, 
                      employees, and agents from any claims, damages, losses, or expenses arising from:
                    </p>
                    <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                      <li>Your use of our Services</li>
                      <li>Violation of these Terms</li>
                      <li>Infringement of third-party rights</li>
                      <li>False or misleading information provided</li>
                      <li>Negligent or wrongful conduct</li>
                    </ul>
                  </div>
                </section>

                {/* Section 16: Termination */}
                <section id="termination" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">16. Termination and Suspension</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We may suspend or terminate your access to Services immediately for:
                    </p>
                    <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                      <li>Violation of these Terms</li>
                      <li>Fraudulent or illegal activity</li>
                      <li>Non-payment of premiums</li>
                      <li>Providing false information</li>
                      <li>Risk management reasons</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      You may terminate your account at any time by providing written notice. 
                      Termination does not affect existing policy obligations or our rights under these Terms.
                    </p>
                  </div>
                </section>

                {/* Section 17: Governing Law */}
                <section id="governing" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">17. Governing Law and Jurisdiction</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      These Terms are governed by the laws of South Africa. Any disputes shall be subject to 
                      the exclusive jurisdiction of the South African courts.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      All interactions and transactions are subject to South African regulatory requirements, 
                      including the Insurance Act and Financial Services Conduct Authority regulations.
                    </p>
                  </div>
                </section>

                {/* Section 18: Dispute Resolution */}
                <section id="disputes" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">18. Dispute Resolution</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Before initiating legal proceedings, you agree to attempt resolution through:
                    </p>
                    <ol className="text-gray-700 leading-relaxed mb-4 space-y-2">
                      <li>Direct negotiation with our customer service team</li>
                      <li>Formal complaint through our internal procedures</li>
                      <li>Mediation through an agreed neutral mediator</li>
                    </ol>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      You may also lodge complaints with the FAIS Ombud or other relevant regulatory bodies 
                      as provided by South African law.
                    </p>
                  </div>
                </section>

                {/* Section 19: Modifications */}
                <section id="modifications" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">19. Modifications to Terms</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We reserve the right to modify these Terms at any time. Changes will be effective 
                      when posted on our website with an updated effective date.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We will notify registered users of material changes by email or prominent notice 
                      on our platform. Continued use after changes constitutes acceptance of modified Terms.
                    </p>
                  </div>
                </section>

                {/* Section 20: General Provisions */}
                <section id="general" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">20. General Provisions</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      <strong>Severability:</strong> If any provision is found invalid, the remainder of these Terms remains in effect.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      <strong>Entire Agreement:</strong> These Terms, together with your policy documents and our Privacy Policy, 
                      constitute the entire agreement between parties.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      <strong>No Waiver:</strong> Failure to enforce any provision does not constitute a waiver of rights.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      <strong>Assignment:</strong> We may assign these Terms without notice. You may not assign your obligations without our consent.
                    </p>
                  </div>
                </section>

                {/* Section 21: Contact */}
                <section id="contact" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">21. Contact Information</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      For questions about these Terms of Service, please contact us:
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Scale className="h-5 w-5 text-stone-600" />
                        <div>
                          <p className="font-medium text-gray-900">Legal Department</p>
                          <p className="text-gray-700">legal@lalisure.co.za</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-stone-600" />
                        <div>
                          <p className="font-medium text-gray-900">Customer Service</p>
                          <p className="text-gray-700">+27 11 123 4567</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Postal Address</p>
                        <div className="text-gray-700">
                          <p>Lalisure (Pty) Ltd</p>
                          <p>Legal Department</p>
                          <p>123 Business District</p>
                          <p>Sandton, 2196</p>
                          <p>South Africa</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Footer Note */}
                <div className="border-t border-gray-200 pt-6 mt-8">
                  <p className="text-sm text-gray-600 text-center">
                    These Terms of Service were last updated on January 15, 2025. 
                    For questions about these terms, please <Link href="/contact" className="text-stone-700 hover:text-stone-800 font-medium">contact us</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SupportLayout>
  );
};

export default TermsOfServicePage;
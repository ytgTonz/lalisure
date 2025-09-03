'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Mail, Phone } from 'lucide-react';
import SupportLayout from '@/components/support/support-layout';
import TableOfContents from '@/components/support/table-of-contents';

const PrivacyPolicyPage = () => {
  const tocItems = [
    { id: 'introduction', title: 'Introduction', level: 1 },
    { id: 'information-we-collect', title: 'Information We Collect', level: 1 },
    { id: 'personal-information', title: 'Personal Information', level: 2 },
    { id: 'usage-information', title: 'Usage Information', level: 2 },
    { id: 'how-we-use-information', title: 'How We Use Your Information', level: 1 },
    { id: 'policy-administration', title: 'Policy Administration', level: 2 },
    { id: 'claims-processing', title: 'Claims Processing', level: 2 },
    { id: 'marketing-communications', title: 'Marketing Communications', level: 2 },
    { id: 'information-sharing', title: 'Information Sharing and Disclosure', level: 1 },
    { id: 'third-party-services', title: 'Third-Party Services', level: 2 },
    { id: 'legal-requirements', title: 'Legal Requirements', level: 2 },
    { id: 'data-protection', title: 'Data Protection and Security', level: 1 },
    { id: 'security-measures', title: 'Security Measures', level: 2 },
    { id: 'data-retention', title: 'Data Retention', level: 2 },
    { id: 'your-rights', title: 'Your Rights Under POPIA', level: 1 },
    { id: 'access-rights', title: 'Access Rights', level: 2 },
    { id: 'correction-rights', title: 'Correction Rights', level: 2 },
    { id: 'deletion-rights', title: 'Deletion Rights', level: 2 },
    { id: 'cookies', title: 'Cookies and Tracking', level: 1 },
    { id: 'third-party-links', title: 'Third-Party Links', level: 1 },
    { id: 'changes', title: 'Changes to Privacy Policy', level: 1 },
    { id: 'contact', title: 'Contact Information', level: 1 },
  ];

  return (
    <SupportLayout
      title="Privacy Policy"
      description="Learn how Lalisure collects, uses, and protects your personal information in compliance with South African privacy laws."
      breadcrumbText="Privacy Policy"
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

                {/* Introduction */}
                <section id="introduction" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Introduction</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Lalisure (Pty) Ltd ("we," "us," or "our") is committed to protecting your privacy and personal information. 
                      This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit 
                      our website, use our services, or interact with us.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      This policy is designed to comply with the Protection of Personal Information Act (POPIA) of South Africa 
                      and other applicable privacy laws. By using our services, you consent to the practices described in this policy.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      We recommend that you read this policy carefully and contact us if you have any questions about how we 
                      handle your personal information.
                    </p>
                  </div>
                </section>

                {/* Information We Collect */}
                <section id="information-we-collect" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Information We Collect</h2>
                  
                  <div id="personal-information" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="prose prose-stone max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We collect personal information that you provide directly to us, including:
                      </p>
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li><strong>Identity Information:</strong> Full name, ID number, date of birth, nationality</li>
                        <li><strong>Contact Information:</strong> Phone numbers, email addresses, physical addresses</li>
                        <li><strong>Financial Information:</strong> Banking details, payment information, income details</li>
                        <li><strong>Property Information:</strong> Property addresses, descriptions, valuations, security features</li>
                        <li><strong>Insurance Information:</strong> Coverage preferences, claims history, risk assessments</li>
                        <li><strong>Employment Information:</strong> Occupation, employer details, work address</li>
                      </ul>
                    </div>
                  </div>

                  <div id="usage-information" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Usage Information</h3>
                    <div className="prose prose-stone max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We automatically collect certain information about your device and usage:
                      </p>
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
                        <li><strong>Usage Data:</strong> Pages visited, time spent on site, click patterns, session duration</li>
                        <li><strong>Location Data:</strong> General location based on IP address (not precise GPS location)</li>
                        <li><strong>Communication Records:</strong> Records of communications with our support team</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* How We Use Information */}
                <section id="how-we-use-information" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How We Use Your Information</h2>
                  
                  <div id="policy-administration" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Policy Administration</h3>
                    <div className="prose prose-stone max-w-none">
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li>Processing insurance applications and issuing policies</li>
                        <li>Calculating premiums and managing billing</li>
                        <li>Conducting risk assessments and underwriting</li>
                        <li>Managing policy renewals and modifications</li>
                        <li>Providing customer support and account management</li>
                      </ul>
                    </div>
                  </div>

                  <div id="claims-processing" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Claims Processing</h3>
                    <div className="prose prose-stone max-w-none">
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li>Investigating and validating insurance claims</li>
                        <li>Coordinating with assessors, contractors, and service providers</li>
                        <li>Processing claim payments and settlements</li>
                        <li>Fraud detection and prevention</li>
                        <li>Maintaining claims history records</li>
                      </ul>
                    </div>
                  </div>

                  <div id="marketing-communications" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Marketing Communications</h3>
                    <div className="prose prose-stone max-w-none">
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li>Sending policy updates and important notifications</li>
                        <li>Providing information about new products and services</li>
                        <li>Conducting customer satisfaction surveys</li>
                        <li>Offering personalized insurance recommendations</li>
                        <li>Sending promotional offers and discounts (with consent)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Information Sharing */}
                <section id="information-sharing" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Information Sharing and Disclosure</h2>
                  
                  <div id="third-party-services" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Third-Party Services</h3>
                    <div className="prose prose-stone max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We may share your information with trusted third parties to provide our services:
                      </p>
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li><strong>Underwriters and Reinsurers:</strong> For risk assessment and policy underwriting</li>
                        <li><strong>Claims Service Providers:</strong> Assessors, contractors, and repair services</li>
                        <li><strong>Payment Processors:</strong> For secure payment processing</li>
                        <li><strong>Technology Partners:</strong> Cloud hosting, security, and analytics services</li>
                        <li><strong>Professional Services:</strong> Attorneys, auditors, and consultants</li>
                      </ul>
                    </div>
                  </div>

                  <div id="legal-requirements" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Legal Requirements</h3>
                    <div className="prose prose-stone max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We may disclose your information when required by law or to:
                      </p>
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li>Comply with legal obligations and regulatory requirements</li>
                        <li>Respond to court orders, subpoenas, or government requests</li>
                        <li>Investigate fraud or other illegal activities</li>
                        <li>Protect our rights, property, or safety, or that of others</li>
                        <li>Enforce our terms of service and other agreements</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Data Protection */}
                <section id="data-protection" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Protection and Security</h2>
                  
                  <div id="security-measures" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Measures</h3>
                    <div className="prose prose-stone max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We implement comprehensive security measures to protect your personal information:
                      </p>
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li><strong>Encryption:</strong> All data transmitted is encrypted using industry-standard SSL/TLS</li>
                        <li><strong>Access Controls:</strong> Strict access controls and user authentication</li>
                        <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                        <li><strong>Employee Training:</strong> Staff training on data protection and security</li>
                        <li><strong>Incident Response:</strong> Procedures for detecting and responding to breaches</li>
                      </ul>
                    </div>
                  </div>

                  <div id="data-retention" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Retention</h3>
                    <div className="prose prose-stone max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We retain your personal information for as long as necessary to:
                      </p>
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li>Provide ongoing insurance services and policy administration</li>
                        <li>Process claims and maintain claims history</li>
                        <li>Comply with legal and regulatory requirements</li>
                        <li>Resolve disputes and enforce agreements</li>
                      </ul>
                      <p className="text-gray-700 leading-relaxed">
                        Generally, we retain policy and claims information for 5 years after policy termination, 
                        or longer if required by law or ongoing legal proceedings.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Your Rights */}
                <section id="your-rights" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Rights Under POPIA</h2>
                  
                  <div id="access-rights" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Access Rights</h3>
                    <div className="prose prose-stone max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        You have the right to request access to your personal information, including:
                      </p>
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li>What personal information we hold about you</li>
                        <li>How we use your information</li>
                        <li>Who we share your information with</li>
                        <li>How long we retain your information</li>
                      </ul>
                    </div>
                  </div>

                  <div id="correction-rights" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Correction Rights</h3>
                    <div className="prose prose-stone max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        You can request correction of inaccurate or incomplete personal information. 
                        We will update your information promptly and notify relevant third parties if necessary.
                      </p>
                    </div>
                  </div>

                  <div id="deletion-rights" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Deletion Rights</h3>
                    <div className="prose prose-stone max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        You may request deletion of your personal information in certain circumstances, 
                        such as when it's no longer necessary for the purposes collected or if you withdraw consent. 
                        Note that we may need to retain some information for legal or regulatory requirements.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Cookies */}
                <section id="cookies" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookies and Tracking</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We use cookies and similar tracking technologies to improve your experience on our website. 
                      Cookies help us remember your preferences, analyze site usage, and provide personalized content.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      You can control cookie settings through your browser preferences. However, disabling cookies 
                      may affect the functionality of our website.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      For more detailed information about our use of cookies, please refer to our Cookie Policy.
                    </p>
                  </div>
                </section>

                {/* Third-Party Links */}
                <section id="third-party-links" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Links</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Our website may contain links to third-party websites or services. This Privacy Policy 
                      does not apply to these external sites. We encourage you to read the privacy policies 
                      of any third-party sites you visit.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      We are not responsible for the privacy practices or content of third-party websites.
                    </p>
                  </div>
                </section>

                {/* Changes */}
                <section id="changes" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Changes to Privacy Policy</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We may update this Privacy Policy from time to time to reflect changes in our practices 
                      or legal requirements. We will notify you of any material changes by:
                    </p>
                    <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                      <li>Posting the updated policy on our website</li>
                      <li>Sending email notifications to registered users</li>
                      <li>Displaying prominent notices on our platform</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                      Your continued use of our services after the effective date of the updated policy 
                      constitutes acceptance of the changes.
                    </p>
                  </div>
                </section>

                {/* Contact */}
                <section id="contact" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      If you have questions about this Privacy Policy, want to exercise your rights, 
                      or need to report a privacy concern, please contact us:
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-stone-600" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <p className="text-gray-700">privacy@lalisure.co.za</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-stone-600" />
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <p className="text-gray-700">+27 11 123 4567</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Postal Address</p>
                        <div className="text-gray-700">
                          <p>Lalisure (Pty) Ltd</p>
                          <p>Privacy Officer</p>
                          <p>123 Business District</p>
                          <p>Sandton, 2196</p>
                          <p>South Africa</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed mt-4">
                      We will respond to your privacy requests within 30 days as required by POPIA.
                    </p>
                  </div>
                </section>

                {/* Footer Note */}
                <div className="border-t border-gray-200 pt-6 mt-8">
                  <p className="text-sm text-gray-600 text-center">
                    This Privacy Policy was last updated on January 15, 2025. 
                    For questions about this policy, please <Link href="/contact" className="text-stone-700 hover:text-stone-800 font-medium">contact us</Link>.
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

export default PrivacyPolicyPage;
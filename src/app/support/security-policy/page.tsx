'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Mail, 
  Phone, 
  Shield, 
  Lock, 
  Eye, 
  Server, 
  AlertTriangle,
  CheckCircle,
  FileCheck,
  Users
} from 'lucide-react';
import SupportLayout from '@/components/support/support-layout';
import TableOfContents from '@/components/support/table-of-contents';

const SecurityPolicyPage = () => {
  const tocItems = [
    { id: 'introduction', title: 'Introduction', level: 1 },
    { id: 'commitment', title: 'Our Security Commitment', level: 1 },
    { id: 'data-security', title: 'Data Security Measures', level: 1 },
    { id: 'encryption', title: 'Encryption and Data Protection', level: 2 },
    { id: 'access-controls', title: 'Access Controls and Authentication', level: 2 },
    { id: 'infrastructure', title: 'Infrastructure Security', level: 2 },
    { id: 'privacy-protection', title: 'Privacy Protection', level: 1 },
    { id: 'data-handling', title: 'Data Handling Practices', level: 2 },
    { id: 'third-party', title: 'Third-Party Security', level: 2 },
    { id: 'incident-response', title: 'Security Incident Response', level: 1 },
    { id: 'monitoring', title: 'Continuous Monitoring', level: 2 },
    { id: 'breach-notification', title: 'Breach Notification Procedures', level: 2 },
    { id: 'compliance', title: 'Regulatory Compliance', level: 1 },
    { id: 'user-security', title: 'User Security Guidelines', level: 1 },
    { id: 'account-security', title: 'Account Security Best Practices', level: 2 },
    { id: 'phishing-protection', title: 'Phishing and Fraud Protection', level: 2 },
    { id: 'security-updates', title: 'Security Updates and Communication', level: 1 },
    { id: 'contact-security', title: 'Security Contact Information', level: 1 },
  ];

  const securityFeatures = [
    {
      icon: Lock,
      title: '256-bit SSL Encryption',
      description: 'All data transmission is protected with bank-grade encryption'
    },
    {
      icon: Server,
      title: 'Secure Cloud Infrastructure',
      description: 'ISO 27001 certified data centers with 24/7 monitoring'
    },
    {
      icon: Eye,
      title: 'Multi-Factor Authentication',
      description: 'Additional security layer for account access protection'
    },
    {
      icon: Shield,
      title: 'Regular Security Audits',
      description: 'Continuous vulnerability assessments and penetration testing'
    },
    {
      icon: Users,
      title: 'Access Controls',
      description: 'Role-based permissions and principle of least privilege'
    },
    {
      icon: FileCheck,
      title: 'Compliance Monitoring',
      description: 'Adherence to POPIA, PCI DSS, and industry standards'
    }
  ];

  const userSecurityTips = [
    {
      title: 'Use Strong Passwords',
      description: 'Create unique, complex passwords with a mix of letters, numbers, and symbols',
      icon: Lock
    },
    {
      title: 'Enable Two-Factor Authentication',
      description: 'Add an extra layer of security to your account with 2FA',
      icon: Shield
    },
    {
      title: 'Keep Software Updated',
      description: 'Regularly update your browser and device software for security patches',
      icon: CheckCircle
    },
    {
      title: 'Verify Communications',
      description: 'Always verify the authenticity of emails or calls requesting sensitive information',
      icon: Eye
    }
  ];

  return (
    <SupportLayout
      title="Security Policy"
      description="Learn how Lalisure protects your personal and financial information with industry-leading security measures and best practices."
      breadcrumbText="Security Policy"
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
                      At Lalisure, we understand that the security of your personal and financial information is paramount. 
                      This Security Policy outlines the comprehensive measures we have implemented to protect your data 
                      and maintain the highest standards of information security.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We are committed to transparency in our security practices and continuously evolve our security 
                      measures to address emerging threats and maintain compliance with applicable regulations.
                    </p>
                  </div>
                </section>

                {/* Security Features Grid */}
                <div className="mb-12">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Our Security Features</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {securityFeatures.map((feature, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-6 text-center">
                        <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <feature.icon className="h-6 w-6 text-stone-700" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Our Security Commitment */}
                <section id="commitment" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Security Commitment</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Lalisure is committed to maintaining the confidentiality, integrity, and availability of all 
                      information entrusted to us. Our security program is built on industry best practices and 
                      continuously updated to address evolving threats.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We employ a defense-in-depth security strategy that includes multiple layers of protection, 
                      from physical security at our data centers to application-level security controls.
                    </p>
                    <div className="bg-stone-50 rounded-lg p-6 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-stone-700" />
                        Security Principles
                      </h4>
                      <ul className="text-gray-700 space-y-2">
                        <li><strong>Confidentiality:</strong> Ensuring information is accessible only to authorized individuals</li>
                        <li><strong>Integrity:</strong> Maintaining the accuracy and completeness of data</li>
                        <li><strong>Availability:</strong> Ensuring information and services are accessible when needed</li>
                        <li><strong>Accountability:</strong> Maintaining audit trails and responsibility for security actions</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Data Security Measures */}
                <section id="data-security" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Security Measures</h2>
                  
                  <div id="encryption" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Encryption and Data Protection</h3>
                    <div className="prose prose-stone max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We implement comprehensive encryption to protect your data both in transit and at rest:
                      </p>
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li><strong>Transport Layer Security (TLS 1.3):</strong> All data transmission between your device and our servers is encrypted</li>
                        <li><strong>Database Encryption:</strong> Sensitive data is encrypted using AES-256 encryption standards</li>
                        <li><strong>File System Encryption:</strong> Full disk encryption on all servers and storage systems</li>
                        <li><strong>Key Management:</strong> Secure key management with regular key rotation and hardware security modules</li>
                      </ul>
                    </div>
                  </div>

                  <div id="access-controls" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Access Controls and Authentication</h3>
                    <div className="prose prose-stone max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We maintain strict access controls to ensure only authorized personnel can access sensitive information:
                      </p>
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li><strong>Role-Based Access Control (RBAC):</strong> Permissions granted based on job responsibilities</li>
                        <li><strong>Principle of Least Privilege:</strong> Users receive only the minimum access necessary</li>
                        <li><strong>Multi-Factor Authentication:</strong> Required for all administrative access</li>
                        <li><strong>Regular Access Reviews:</strong> Quarterly reviews of all access permissions</li>
                        <li><strong>Automated Deprovisioning:</strong> Immediate revocation of access when employees leave</li>
                      </ul>
                    </div>
                  </div>

                  <div id="infrastructure" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Infrastructure Security</h3>
                    <div className="prose prose-stone max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Our infrastructure security includes multiple layers of protection:
                      </p>
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li><strong>ISO 27001 Certified Data Centers:</strong> Physically secure facilities with biometric access controls</li>
                        <li><strong>Network Segmentation:</strong> Isolated networks to limit the scope of potential breaches</li>
                        <li><strong>Intrusion Detection Systems:</strong> 24/7 monitoring for suspicious activities</li>
                        <li><strong>DDoS Protection:</strong> Advanced protection against distributed denial-of-service attacks</li>
                        <li><strong>Regular Penetration Testing:</strong> Third-party security assessments and vulnerability scanning</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Privacy Protection */}
                <section id="privacy-protection" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Protection</h2>
                  
                  <div id="data-handling" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Handling Practices</h3>
                    <div className="prose prose-stone max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We follow strict data handling practices in compliance with POPIA and international standards:
                      </p>
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li><strong>Data Minimization:</strong> We collect only the information necessary for our services</li>
                        <li><strong>Purpose Limitation:</strong> Data is used only for the purposes it was collected</li>
                        <li><strong>Retention Policies:</strong> Information is retained only as long as necessary</li>
                        <li><strong>Secure Disposal:</strong> Secure destruction of data when no longer needed</li>
                        <li><strong>Data Anonymization:</strong> Personal identifiers removed from analytical data</li>
                      </ul>
                    </div>
                  </div>

                  <div id="third-party" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Third-Party Security</h3>
                    <div className="prose prose-stone max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We carefully vet all third-party service providers and ensure they meet our security standards:
                      </p>
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li><strong>Vendor Security Assessments:</strong> Comprehensive evaluation of security controls</li>
                        <li><strong>Contractual Security Requirements:</strong> Binding security obligations in all contracts</li>
                        <li><strong>Regular Security Reviews:</strong> Ongoing monitoring of third-party security practices</li>
                        <li><strong>Data Processing Agreements:</strong> Specific agreements governing data handling</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Security Incident Response */}
                <section id="incident-response" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Incident Response</h2>
                  
                  <div id="monitoring" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Continuous Monitoring</h3>
                    <div className="prose prose-stone max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Our security operations center provides 24/7 monitoring and threat detection:
                      </p>
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li><strong>Security Information and Event Management (SIEM):</strong> Real-time analysis of security alerts</li>
                        <li><strong>Threat Intelligence:</strong> Proactive identification of emerging threats</li>
                        <li><strong>Behavioral Analytics:</strong> Detection of unusual user or system behavior</li>
                        <li><strong>Log Management:</strong> Comprehensive logging and audit trails</li>
                      </ul>
                    </div>
                  </div>

                  <div id="breach-notification" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Breach Notification Procedures</h3>
                    <div className="prose prose-stone max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        In the unlikely event of a security incident, we have established procedures for:
                      </p>
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li><strong>Immediate Containment:</strong> Rapid response to limit the scope of incidents</li>
                        <li><strong>Impact Assessment:</strong> Evaluation of potential data exposure</li>
                        <li><strong>Regulatory Notification:</strong> Compliance with POPIA notification requirements</li>
                        <li><strong>Customer Communication:</strong> Prompt notification of affected customers</li>
                        <li><strong>Remediation:</strong> Swift action to address vulnerabilities</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Regulatory Compliance */}
                <section id="compliance" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Regulatory Compliance</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Lalisure maintains compliance with all applicable security and privacy regulations:
                    </p>
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Data Protection</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Protection of Personal Information Act (POPIA)</li>
                          <li>• Financial Services Conduct Authority (FSCA) regulations</li>
                          <li>• Insurance industry data protection standards</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Security Standards</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• ISO/IEC 27001 Information Security Management</li>
                          <li>• PCI DSS for payment card processing</li>
                          <li>• SOC 2 Type II compliance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* User Security Guidelines */}
                <section id="user-security" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">User Security Guidelines</h2>
                  
                  <div id="account-security" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Security Best Practices</h3>
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      {userSecurityTips.map((tip, index) => (
                        <div key={index} className="bg-stone-50 rounded-lg p-6">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-stone-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <tip.icon className="h-5 w-5 text-stone-700" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">{tip.title}</h4>
                              <p className="text-sm text-gray-700">{tip.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div id="phishing-protection" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Phishing and Fraud Protection</h3>
                    <div className="prose prose-stone max-w-none">
                      <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200 mb-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-yellow-800 mb-2">Important Security Reminder</h4>
                            <p className="text-yellow-700 mb-2">
                              Lalisure will never ask for your password, PIN, or sensitive information via email, SMS, or phone calls.
                            </p>
                            <p className="text-yellow-700 text-sm">
                              Always verify the authenticity of communications by logging into your account directly or calling our official number.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed mb-4">
                        To protect yourself from phishing and fraud attempts:
                      </p>
                      <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li><strong>Verify Email Senders:</strong> Check that emails come from official Lalisure domains</li>
                        <li><strong>Don't Click Suspicious Links:</strong> Type our website address directly into your browser</li>
                        <li><strong>Report Suspicious Activity:</strong> Forward suspicious emails to security@lalisure.co.za</li>
                        <li><strong>Use Official Channels:</strong> Only use our official website and mobile app</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Security Updates */}
                <section id="security-updates" className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Updates and Communication</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We are committed to keeping you informed about our security practices and any important updates:
                    </p>
                    <ul className="text-gray-700 leading-relaxed mb-4 space-y-2">
                      <li><strong>Regular Policy Updates:</strong> This security policy is reviewed and updated regularly</li>
                      <li><strong>Security Notifications:</strong> Important security updates communicated via email and in-app notifications</li>
                      <li><strong>Transparency Reports:</strong> Annual reports on our security practices and incident statistics</li>
                      <li><strong>Security Blog:</strong> Regular updates on security best practices and industry threats</li>
                    </ul>
                  </div>
                </section>

                {/* Contact Security */}
                <section id="contact-security" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Contact Information</h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      If you have security concerns, suspect fraudulent activity, or need to report a security incident:
                    </p>
                    
                    <div className="bg-red-50 rounded-lg p-6 border border-red-200 mb-6">
                      <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Security Emergency
                      </h4>
                      <p className="text-red-700 mb-2">
                        For urgent security incidents or suspected fraud:
                      </p>
                      <p className="font-semibold text-red-800">+27 82 911 HELP (4357)</p>
                      <p className="text-sm text-red-600 mt-1">Available 24/7</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-stone-600" />
                        <div>
                          <p className="font-medium text-gray-900">Security Team</p>
                          <p className="text-gray-700">security@lalisure.co.za</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-stone-600" />
                        <div>
                          <p className="font-medium text-gray-900">Report Suspicious Activity</p>
                          <p className="text-gray-700">fraud@lalisure.co.za</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-stone-600" />
                        <div>
                          <p className="font-medium text-gray-900">Customer Security Support</p>
                          <p className="text-gray-700">+27 11 123 4567 (Option 3)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Footer Note */}
                <div className="border-t border-gray-200 pt-6 mt-8">
                  <p className="text-sm text-gray-600 text-center">
                    This Security Policy was last updated on January 15, 2025. 
                    For questions about our security practices, please <Link href="/contact" className="text-stone-700 hover:text-stone-800 font-medium">contact us</Link>.
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

export default SecurityPolicyPage;
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BackNavigation from '@/components/BackNavigation';
import { 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Download,
  ExternalLink
} from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const lastUpdated = "25 August 2024";
  const dpoEmail = "transport@logisticssolutionresources.com"; // Replace with your actual DPO email
  const dpoPhone = "+44 20 1234 5678"; // Replace with your actual DPO phone

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="black" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <BackNavigation title="Privacy Policy" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 shadow-sm mb-4">
            <Shield className="w-5 h-5 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">Data Protection</span>
          </div>
          <h1 className="text-4xl font-bold text-black mb-3">Privacy Policy</h1>
          <p className="text-lg text-gray-600 mb-4 max-w-2xl mx-auto">
            Your privacy is our priority. This policy explains how we collect, use, and protect your personal information.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge className="bg-gray-100 text-gray-800 px-3 py-1">
              ICO Application: C1752755 (Processing)
            </Badge>
            <Badge className="bg-gray-100 text-gray-800 px-3 py-1">
              Last updated: {lastUpdated}
            </Badge>
          </div>
        </div>

        {/* Contact Information */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Shield className="w-6 h-6" />
              Data Protection Officer Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <a href={`mailto:${dpoEmail}`} className="text-sm text-blue-600 hover:text-blue-800">
                    {dpoEmail}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <a href={`tel:${dpoPhone}`} className="text-sm text-green-600 hover:text-green-800">
                    {dpoPhone}
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Response Time:</strong> We aim to respond to all data protection inquiries within 24 hours.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This Privacy Policy explains how we collect, use, and protect your personal information when you use our transport management platform. 
                We are committed to protecting your privacy and ensuring compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
              </p>
              <p>
                <strong>Data Controller:</strong> [Your Name], operating as a sole trader<br />
                <strong>ICO Registration Number:</strong> C1752755<br />
                <strong>Data Protection Officer:</strong> [Your Name] - {dpoEmail}
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle>2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">Personal Information:</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Account Information:</strong> Name, email address, phone number, role within organization</li>
                <li><strong>Profile Information:</strong> Address, date of birth, employment details, license information</li>
                <li><strong>Location Data:</strong> GPS coordinates for vehicle and driver tracking (with consent)</li>
                <li><strong>Usage Data:</strong> How you interact with our platform, pages visited, features used</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system</li>
              </ul>

              <h4 className="font-semibold mt-4">Special Category Data:</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Medical Information:</strong> Driver medical certificates, health conditions (for safety purposes)</li>
                <li><strong>Biometric Data:</strong> Driver photos for identification (if applicable)</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Legal Basis: Contract</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Provide transport management services</li>
                    <li>Process bookings and schedules</li>
                    <li>Manage driver assignments</li>
                    <li>Handle customer support</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Legal Basis: Legitimate Interest</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Improve our services</li>
                    <li>Ensure platform security</li>
                    <li>Prevent fraud and abuse</li>
                    <li>Send service updates</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Legal Basis: Consent</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Location tracking (drivers)</li>
                    <li>Marketing communications</li>
                    <li>Analytics cookies</li>
                    <li>Third-party integrations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Legal Basis: Legal Obligation</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Comply with transport regulations</li>
                    <li>Maintain safety records</li>
                    <li>Tax and accounting requirements</li>
                    <li>Regulatory reporting</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>4. Data Sharing and Third Parties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We may share your information with:</p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Transport Companies:</strong> Your organization's administrators and managers</li>
                <li><strong>Service Providers:</strong> Cloud hosting (Supabase), analytics (Google Analytics), payment processors</li>
                <li><strong>Regulatory Bodies:</strong> Transport authorities, safety regulators (when required by law)</li>
                <li><strong>Emergency Services:</strong> In case of accidents or emergencies</li>
              </ul>
              <p className="text-sm text-gray-600">
                We do not sell your personal information to third parties. All data sharing is conducted under appropriate legal agreements and safeguards.
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>5. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Account Data</h4>
                  <p className="text-sm">Retained while account is active, deleted 30 days after account closure</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Location Data</h4>
                  <p className="text-sm">Retained for 12 months, then anonymized for analytics</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Transaction Data</h4>
                  <p className="text-sm">Retained for 7 years for tax and regulatory compliance</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Safety Records</h4>
                  <p className="text-sm">Retained for 10 years as required by transport regulations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>6. Your Data Protection Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Under UK GDPR, you have the following rights:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Right to Access</Badge>
                    <span className="text-sm">Request a copy of your personal data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Right to Rectification</Badge>
                    <span className="text-sm">Correct inaccurate personal data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Right to Erasure</Badge>
                    <span className="text-sm">Request deletion of your data</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Right to Portability</Badge>
                    <span className="text-sm">Receive your data in a portable format</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Right to Object</Badge>
                    <span className="text-sm">Object to processing of your data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Right to Withdraw Consent</Badge>
                    <span className="text-sm">Withdraw consent at any time</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                To exercise these rights, contact our Data Protection Officer at {dpoEmail}
              </p>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>7. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Essential Cookies:</strong> Required for website functionality (authentication, security)</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform (Google Analytics)</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Marketing Cookies:</strong> Deliver relevant advertisements (with consent)</li>
              </ul>
              <p className="text-sm text-gray-600">
                You can manage your cookie preferences through our cookie settings panel.
              </p>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle>8. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We implement appropriate technical and organizational measures to protect your data:</p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication</li>
                <li>Staff training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card>
            <CardHeader>
              <CardTitle>9. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your data is primarily processed within the UK and European Economic Area (EEA). 
                When data is transferred outside the EEA, we ensure appropriate safeguards are in place, 
                such as Standard Contractual Clauses or adequacy decisions.
              </p>
            </CardContent>
          </Card>

          {/* Complaints */}
          <Card>
            <CardHeader>
              <CardTitle>10. Complaints and Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>If you have concerns about how we handle your data:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Contact our Data Protection Officer at {dpoEmail}</li>
                <li>We will respond within 30 days</li>
                <li>If unsatisfied, you can complain to the Information Commissioner's Office (ICO)</li>
              </ol>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                <a 
                  href="https://ico.org.uk/make-a-complaint/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Make a complaint to the ICO
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>11. Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by email or through our platform. The date of the latest update is shown at the top of this policy.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Contact DPO
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

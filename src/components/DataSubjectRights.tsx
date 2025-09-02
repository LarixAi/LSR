import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import BackNavigation from '@/components/BackNavigation';
import { 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  Mail, 
  FileText,
  CheckCircle,
  AlertCircle,
  Shield
} from 'lucide-react';

interface DataRequest {
  id: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'objection' | 'withdraw';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  description: string;
  submittedAt: Date;
  completedAt?: Date;
}

const DataSubjectRights: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [requestType, setRequestType] = useState<string>('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const requestTypes = [
    { value: 'access', label: 'Right to Access', description: 'Request a copy of your personal data' },
    { value: 'rectification', label: 'Right to Rectification', description: 'Correct inaccurate personal data' },
    { value: 'erasure', label: 'Right to Erasure', description: 'Request deletion of your data' },
    { value: 'portability', label: 'Right to Portability', description: 'Receive your data in a portable format' },
    { value: 'objection', label: 'Right to Object', description: 'Object to processing of your data' },
    { value: 'withdraw', label: 'Withdraw Consent', description: 'Withdraw consent for data processing' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Here you would typically send the request to your backend
    console.log('Data subject rights request submitted:', {
      type: requestType,
      email,
      description
    });

    setIsSubmitting(false);
    setSubmitted(true);
    
    // Reset form
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      setRequestType('');
      setEmail('');
      setDescription('');
    }, 3000);
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'access': return <Eye className="w-4 h-4" />;
      case 'rectification': return <Edit className="w-4 h-4" />;
      case 'erasure': return <Trash2 className="w-4 h-4" />;
      case 'portability': return <Download className="w-4 h-4" />;
      case 'objection': return <AlertCircle className="w-4 h-4" />;
      case 'withdraw': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

      <BackNavigation title="Your Data Rights" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-4">
          <Shield className="w-5 h-5 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">UK GDPR Rights</span>
        </div>
        <h2 className="text-3xl font-bold text-black mb-3">Your Data Protection Rights</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Under UK GDPR, you have several fundamental rights regarding your personal data. 
          Use this form to exercise your rights and take control of your information.
        </p>
      </div>

      {/* Rights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requestTypes.map((type) => (
          <Card key={type.value} className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <div className="text-gray-700">
                    {getRequestTypeIcon(type.value)}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base mb-2 text-black">{type.label}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{type.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Submit Data Rights Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Submit Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" aria-describedby="data-rights-request-desc">
              <DialogHeader>
                <DialogTitle>Data Rights Request</DialogTitle>
                <DialogDescription id="data-rights-request-desc">
                  Submit a request to exercise your data protection rights under GDPR.
                </DialogDescription>
              </DialogHeader>
              
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Request Submitted</h3>
                  <p className="text-gray-600 text-sm">
                    We've received your request and will respond within 30 days. 
                    You'll receive an email confirmation shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="requestType">Request Type</Label>
                    <Select value={requestType} onValueChange={setRequestType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                      <SelectContent>
                        {requestTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {getRequestTypeIcon(type.value)}
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please describe your request in detail..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || !requestType || !email || !description}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <h4 className="font-semibold mb-1">Submit Request</h4>
              <p className="text-gray-600">Fill out the form above with your details</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-semibold">2</span>
              </div>
              <h4 className="font-semibold mb-1">Verification</h4>
              <p className="text-gray-600">We'll verify your identity and process your request</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-semibold">3</span>
              </div>
              <h4 className="font-semibold mb-1">Response</h4>
              <p className="text-gray-600">You'll receive a response within 30 days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            If you have any questions about your data protection rights or need assistance, 
            please contact our Data Protection Officer:
          </p>
          <div className="space-y-2 text-sm">
                         <div className="flex items-center gap-2">
               <Mail className="w-4 h-4 text-gray-500" />
               <span>transport@logisticssolutionresources.com</span>
             </div>
                         <div className="flex items-center gap-2">
               <FileText className="w-4 h-4 text-gray-500" />
               <span>ICO Application: C1752755 (Processing)</span>
             </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
};

export default DataSubjectRights;

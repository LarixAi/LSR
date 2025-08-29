import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Users, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const BookDemo = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    phoneExt: '',
    fleetSize: '',
    industry: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error: emailError } = await supabase.functions.invoke('send-demo-request', {
        body: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          company: formData.company,
          fleetSize: formData.fleetSize,
          message: `Industry: ${formData.industry}\nPhone: ${formData.phone}${formData.phoneExt ? ` ext. ${formData.phoneExt}` : ''}`,
        },
      });

      if (emailError) {
        console.error('Email error:', emailError);
        throw emailError;
      }

      toast({
        title: "Demo Request Sent!",
        description: "Thank you for your interest. Our team will contact you within 24 hours.",
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        phone: '',
        phoneExt: '',
        fleetSize: '',
        industry: ''
      });
      
      // Redirect to home after success
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error submitting demo request:', error);
      toast({
        title: "Error",
        description: "Failed to send demo request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">Transentrix</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Benefits */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-8 lg:p-12">
            <h1 className="text-3xl font-bold mb-8">Why Choose Transentrix?</h1>
            
            <div className="space-y-6 mb-12">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Save 48% on maintenance costs</h3>
                  <p className="text-muted-foreground text-sm">Reduce operational expenses with our optimized fleet management system</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Reduce time spent on inspections by 83%</h3>
                  <p className="text-muted-foreground text-sm">Streamline your inspection process with automated workflows</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Run fleet reports 10x faster than before</h3>
                  <p className="text-muted-foreground text-sm">Generate comprehensive reports in seconds, not hours</p>
                </div>
              </div>
            </div>

            {/* Included with Demo Box */}
            <div className="bg-card/50 backdrop-blur rounded-xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Included free with your Demo:</h3>
              <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse"></div>
                  <span className="text-xs uppercase tracking-wider opacity-90">Free Webinar</span>
                </div>
                <h4 className="text-xl font-bold mb-2">Transentrix Platform 101</h4>
                <p className="text-sm opacity-90">With our Senior Account Executive</p>
              </div>
            </div>

            {/* Questions Section */}
            <div className="mt-8 p-6 bg-card/30 backdrop-blur rounded-lg">
              <h3 className="font-semibold mb-2">Questions?</h3>
              <p className="text-muted-foreground text-sm">
                Call us at{' '}
                <a href="tel:+442012345678" className="text-primary hover:underline">
                  +44 20 1234 5678
                </a>{' '}
                or email{' '}
                <a href="mailto:transport@logisticssolutionresources.com" className="text-primary hover:underline">
                  transport@logisticssolutionresources.com
                </a>
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-card rounded-2xl p-8 lg:p-12 border border-border">
            <div className="text-center mb-8">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Take the first step toward securing a demo</h2>
              <p className="text-muted-foreground">
                Run. Repair. Optimize.<br />
                Tell us about your fleet below to get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fleet Size Dropdown */}
              <div>
                <Select 
                  value={formData.fleetSize} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, fleetSize: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your fleet size..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 vehicles</SelectItem>
                    <SelectItem value="11-25">11-25 vehicles</SelectItem>
                    <SelectItem value="26-50">26-50 vehicles</SelectItem>
                    <SelectItem value="51-100">51-100 vehicles</SelectItem>
                    <SelectItem value="101-250">101-250 vehicles</SelectItem>
                    <SelectItem value="250+">250+ vehicles</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  How many vehicles, trailers and/or heavy equipment (e.g. bulldozers, skid steers, etc.) are in your fleet?
                </p>
              </div>

              {/* Industry Dropdown */}
              <div>
                <Select 
                  value={formData.industry} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your industry..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transportation">Transportation & Logistics</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="delivery">Delivery Services</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                />
                <Input
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                />
              </div>

              {/* Company Field */}
              <Input
                name="company"
                type="text"
                required
                value={formData.company}
                onChange={handleChange}
                placeholder="Company"
              />

              {/* Phone Fields */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                  />
                </div>
                <Input
                  name="phoneExt"
                  type="text"
                  value={formData.phoneExt}
                  onChange={handleChange}
                  placeholder="Extension"
                />
              </div>

              {/* Work Email */}
              <Input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Work Email"
              />

              {/* Privacy Notice */}
              <p className="text-xs text-muted-foreground">
                This site is protected by reCAPTCHA and the Google{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a> and{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a> apply.
              </p>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {isSubmitting ? "Sending..." : "Get started"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDemo;
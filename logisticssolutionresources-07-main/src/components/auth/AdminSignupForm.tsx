
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Building2, Mail, Phone, User } from 'lucide-react';

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
  message: string;
}

interface AdminSignupFormProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  isLoading: boolean;
}

const AdminSignupForm = ({ formData, onInputChange, onSubmit, error, isLoading }: AdminSignupFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Admin Access</h3>
        <p className="text-gray-600">
          Fill out this form to request admin access for your organization.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="firstName"
              placeholder="First name"
              value={formData.firstName}
              onChange={(e) => onInputChange('firstName', e.target.value)}
              className="pl-10 h-12 border-gray-200 focus:border-primary"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="lastName"
              placeholder="Last name"
              value={formData.lastName}
              onChange={(e) => onInputChange('lastName', e.target.value)}
              className="pl-10 h-12 border-gray-200 focus:border-primary"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your business email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            className="pl-10 h-12 border-gray-200 focus:border-primary"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">Company Name</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="companyName"
            placeholder="Your company or organization name"
            value={formData.companyName}
            onChange={(e) => onInputChange('companyName', e.target.value)}
            className="pl-10 h-12 border-gray-200 focus:border-primary"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="phone"
            type="tel"
            placeholder="Your contact number"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            className="pl-10 h-12 border-gray-200 focus:border-primary"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message</Label>
        <Textarea
          id="message"
          placeholder="Tell us about your organization..."
          value={formData.message}
          onChange={(e) => onInputChange('message', e.target.value)}
          className="min-h-[100px] border-gray-200 focus:border-primary"
          required
        />
      </div>
      
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 transition-colors" 
        disabled={isLoading}
      >
        Continue to Plan Selection
      </Button>
    </form>
  );
};

export default AdminSignupForm;

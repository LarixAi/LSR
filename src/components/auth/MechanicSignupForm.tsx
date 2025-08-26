import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, UserPlus, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import EmailService from '@/services/emailService';

interface MechanicSignupFormProps {
  onToggleForm: () => void;
  onSuccess?: () => void;
}

const MechanicSignupForm = ({ onToggleForm, onSuccess }: MechanicSignupFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('All fields are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔧 Attempting mechanic signup with data:', {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'mechanic'
      });

      // Use standard Supabase signup with mechanic role
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            role: 'mechanic'
          }
        }
      });

      if (signupError) {
        console.error('❌ Signup error:', signupError);
        throw signupError;
      }

      console.log('✅ Signup successful:', data);

      // Send welcome email
      try {
        await EmailService.sendWelcomeEmail({
          to: formData.email.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          loginUrl: `${window.location.origin}/auth`
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the signup if email fails
      }

      toast({
        title: 'Mechanic Account Created Successfully',
        description: 'Please check your email to verify your account and welcome message.',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('❌ Mechanic signup error:', error);
      setError(error.message || 'An error occurred during signup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-orange-400">
        <Wrench className="w-5 h-5" />
        <span className="text-lg font-semibold">Create Mechanic Account</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="text-slate-200">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              disabled={isLoading}
              required
              className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400 focus:ring-orange-400/20"
              placeholder="John"
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="text-slate-200">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              disabled={isLoading}
              required
              className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400 focus:ring-orange-400/20"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="text-slate-200">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            required
            autoComplete="email"
            className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400 focus:ring-orange-400/20"
            placeholder="mechanic@example.com"
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-slate-200">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            required
            autoComplete="new-password"
            className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400 focus:ring-orange-400/20"
            placeholder="Create a strong password"
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-slate-200">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            required
            autoComplete="new-password"
            className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400 focus:ring-orange-400/20"
            placeholder="Confirm your password"
          />
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium h-11 transition-all duration-200 transform hover:scale-[1.02]"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Creating Account...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Create Mechanic Account</span>
            </div>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400">
        <p className="flex items-center justify-center space-x-1 mb-2">
          <Shield className="w-3 h-3" />
          <span>Email verification required for account activation</span>
        </p>
      </div>

      <div className="text-center pt-4 border-t border-slate-700">
        <button
          type="button"
          onClick={onToggleForm}
          className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
};

export default MechanicSignupForm;
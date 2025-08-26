import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, UserPlus, Ban, Eye, EyeOff, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import EmailService from '@/services/emailService';

interface SignupFormProps {
  onToggleForm: () => void;
  selectedRole?: string;
  canSignup?: boolean;
}

const SignupForm = ({ onToggleForm, selectedRole, canSignup = true }: SignupFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-green-400', 'bg-green-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!canSignup) {
      setError('Driver accounts must be created by an administrator');
      setIsLoading(false);
      return;
    }

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter your first and last name');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (passwordStrength < 2) {
      setError('Please choose a stronger password');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            role: selectedRole || 'parent'
          }
        }
      });

      if (signupError) {
        throw signupError;
      }

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
        title: 'Account Created Successfully',
        description: 'Please check your email to verify your account and welcome message.',
      });

      // Clear form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = 'An error occurred during signup';
      if (error.message.includes('already registered')) {
        errorMessage = 'An account with this email already exists. Try signing in instead.';
      } else if (error.message.includes('weak_password')) {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!canSignup) {
    return (
      <div className="space-y-6">
        <Alert className="bg-red-900/20 border-red-500/50">
          <Ban className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            <strong>Driver Registration Restricted</strong><br />
            Driver accounts must be created by an Administrator. Please contact your admin to request a driver account.
          </AlertDescription>
        </Alert>
        
        <Button 
          onClick={onToggleForm}
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
        >
          Already have an account? Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isMobile ? 'px-1' : 'px-0'}`}>
      <div className="flex items-center space-x-2 text-green-400 mb-4">
        <UserPlus className="w-4 h-4" />
        <span className="text-sm font-medium">Create {selectedRole} Account</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-slate-200 text-sm font-medium">
              First Name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              disabled={isLoading}
              required
              className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-400 focus:ring-green-400/20 ${isMobile ? 'h-12 text-base' : 'h-11 text-sm'}`}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-slate-200 text-sm font-medium">
              Last Name
            </Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              disabled={isLoading}
              required
              className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-400 focus:ring-green-400/20 ${isMobile ? 'h-12 text-base' : 'h-11 text-sm'}`}
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-200 text-sm font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            required
            autoComplete="email"
            className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-400 focus:ring-green-400/20 ${isMobile ? 'h-12 text-base' : 'h-11 text-sm'}`}
            placeholder="john.doe@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-200 text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
              autoComplete="new-password"
              className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-400 focus:ring-green-400/20 pr-10 ${isMobile ? 'h-12 text-base' : 'h-11 text-sm'}`}
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {formData.password && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${strengthColors[Math.max(0, passwordStrength - 1)]}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${passwordStrength >= 3 ? 'text-green-400' : passwordStrength >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {strengthLabels[Math.max(0, passwordStrength - 1)]}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-slate-200 text-sm font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              required
              autoComplete="new-password"
              className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-400 focus:ring-green-400/20 pr-10 ${isMobile ? 'h-12 text-base' : 'h-11 text-sm'}`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {formData.confirmPassword && (
            <div className="flex items-center space-x-1 text-xs">
              {formData.password === formData.confirmPassword ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span className="text-green-400">Passwords match</span>
                </>
              ) : (
                <>
                  <X className="h-3 w-3 text-red-400" />
                  <span className="text-red-400">Passwords don't match</span>
                </>
              )}
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <AlertDescription className="text-red-300 text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Button 
          type="submit" 
          className={`w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] ${isMobile ? 'h-12 text-base' : 'h-11 text-sm'}`}
          disabled={isLoading || passwordStrength < 2}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating Account...</span>
            </div>
          ) : (
            `Create ${selectedRole} Account`
          )}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggleForm}
          className={`text-green-400 hover:text-green-300 font-medium transition-colors ${isMobile ? 'text-sm' : 'text-sm'}`}
        >
          Already have an account? <span className="underline">Sign in</span>
        </button>
      </div>

      <div className={`text-center ${isMobile ? 'text-xs' : 'text-xs'} text-slate-400`}>
        <div className="flex items-center justify-center space-x-1">
          <Shield className="w-3 h-3 flex-shrink-0" />
          <span>Email verification required for activation</span>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import { useSecureAuthentication } from "@/hooks/useSecureAuthentication";
import { SecurePasswordInput } from "@/components/auth/SecurePasswordInput";
import { validateAndSanitizeFormData, enhancedSignupSchema } from "@/utils/enhancedInputValidation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const SecureAuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [passwordValid, setPasswordValid] = useState(false);

  const { signIn, signUp } = useSecureAuthentication();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handlePasswordValidation = (isValid: boolean, validationErrors: string[]) => {
    setPasswordValid(isValid);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);
    setMessage('');

    try {
      if (isSignUp) {
        // Validate signup form
        const validation = validateAndSanitizeFormData(enhancedSignupSchema, {
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          first_name: formData.firstName,
          last_name: formData.lastName
        });

        if (!validation.success) {
          setErrors((validation as { success: false; errors: string[] }).errors);
          return;
        }

        // Check password validation
        if (!passwordValid) {
          setErrors(['Please ensure your password meets all security requirements']);
          return;
        }

        const result = await signUp(
          validation.data.email,
          validation.data.password,
          {
            first_name: validation.data.first_name,
            last_name: validation.data.last_name
          }
        );

        if (result.success) {
          if (result.requiresEmailVerification) {
            setMessage('Account created! Please check your email to verify your account before signing in.');
            setIsSignUp(false);
          } else {
            navigate('/');
          }
        } else {
          setErrors([result.error || 'Signup failed']);
        }
      } else {
        // Sign in
        if (!formData.email || !formData.password) {
          setErrors(['Please enter both email and password']);
          return;
        }

        const result = await signIn(formData.email, formData.password);

        if (result.success) {
          navigate('/');
        } else {
          setErrors([result.error || 'Sign in failed']);
        }
      }
    } catch (error) {
      setErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-center">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            {isSignUp 
              ? 'Create your secure account' 
              : 'Access your secure account'
            }
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
                className={errors.some(e => e.toLowerCase().includes('email')) ? 'border-red-500' : ''}
              />
            </div>

            {/* Sign Up Fields */}
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="First name"
                      required
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Last name"
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <SecurePasswordInput
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                onValidationChange={handlePasswordValidation}
                placeholder="Enter your password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                showStrengthIndicator={isSignUp}
                checkBreaches={isSignUp}
              />
            </div>

            {/* Confirm Password for Sign Up */}
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  required
                  autoComplete="new-password"
                  className={formData.password !== formData.confirmPassword && formData.confirmPassword ? 'border-red-500' : ''}
                />
                {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                  <p className="text-sm text-red-600">Passwords do not match</p>
                )}
              </div>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (isSignUp && !passwordValid)}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>

            {/* Toggle Mode */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <Button
                type="button"
                variant="link"
                className="p-0 ml-1 h-auto"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    firstName: '',
                    lastName: ''
                  });
                  setErrors([]);
                  setMessage('');
                }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureAuthPage;
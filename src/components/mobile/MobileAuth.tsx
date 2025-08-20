import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { isMobile, isBiometricAvailable } from '@/utils/mobileDetection';
import { 
  User, 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  Smartphone,
  Fingerprint,
  AlertCircle
} from 'lucide-react';

const MobileAuth: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'driver' | 'admin' | 'parent'>('driver');
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    if (isMobile()) {
      const available = await isBiometricAvailable();
      setBiometricAvailable(available);
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricAvailable) return;

    setIsLoading(true);
    try {
      const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
      
      await NativeBiometric.verifyIdentity({
        reason: 'Login to LSR TMS',
        title: 'Biometric Authentication',
        subtitle: 'Use your biometric to sign in',
        description: 'Please authenticate to access your account',
        fallbackTitle: 'Use Password'
      });
      
      // If we reach here, authentication was successful
      toast({
        title: "Biometric authentication successful",
        description: "Redirecting to dashboard...",
      });
      
      // Navigate based on role
      const route = selectedRole === 'driver' ? '/driver-dashboard' : '/dashboard';
      navigate(route);
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      toast({
        title: "Biometric authentication failed",
        description: "Please use email and password to sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
      
      // Navigate based on role
      const route = selectedRole === 'driver' ? '/driver-dashboard' : '/dashboard';
      navigate(route);
    } catch (error: any) {
      console.error('💥 Mobile login failed:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleConfig = {
    driver: {
      title: 'Driver Login',
      route: '/driver-dashboard',
      icon: <User className="h-5 w-5" />
    },
    admin: {
      title: 'Admin Login',
      route: '/dashboard',
      icon: <User className="h-5 w-5" />
    },
    parent: {
      title: 'Parent Login',
      route: '/dashboard',
      icon: <User className="h-5 w-5" />
    }
  };

  const config = roleConfig[selectedRole];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-blue-50 to-indigo-100 p-4 safe-area-inset flex items-center justify-center mobile-layout-improved">
      <Card className="w-full max-w-sm mx-auto mobile-card mobile-card-improved shadow-lg">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-md">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold mobile-heading-scale">{config.title}</CardTitle>
          <p className="text-sm text-muted-foreground mobile-text-scale">
            Sign in to access your {selectedRole} dashboard
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6 px-6 pb-8">
          {/* Role Selection */}
          <div className="space-y-3">
            <Label htmlFor="role" className="text-sm font-medium">Select Role</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['driver', 'admin', 'parent'] as const).map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant={selectedRole === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                  className="h-12 text-sm font-medium touch-target mobile-button-improved mobile-touch-improved"
                >
                  {roleConfig[role].icon}
                  <span className="ml-2 capitalize">{role}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Biometric Login */}
          {biometricAvailable && (
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBiometricLogin}
                disabled={isLoading}
                className="w-full h-12 touch-target mobile-button-improved mobile-touch-improved"
              >
                <Fingerprint className="h-5 w-5 mr-2" />
                Login with Biometric
              </Button>
              <div className="text-center">
                <span className="text-xs text-muted-foreground">or</span>
              </div>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 text-base touch-target mobile-input mobile-touch-improved"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-12 h-12 text-base touch-target mobile-input mobile-touch-improved"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent touch-target"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium touch-target mobile-button-improved mobile-touch-improved"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Support Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Having trouble? Contact support
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileAuth;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Mail, Lock, User, ArrowLeft, Wrench, Users, Shield, Settings, Eye, EyeOff, CheckCircle, Star, Zap, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { isMobile } from '@/utils/mobileDetection';
import MobileAuth from '@/components/mobile/MobileAuth';
import AnimatedSignInButton from '@/components/mobile/AnimatedSignInButton';

type UserRole = 'driver' | 'mechanic' | 'parent' | 'council' | 'admin';

const AuthPage = () => {
  // All hooks must be declared at the top level
  const [isInitializing, setIsInitializing] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('driver');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize component
  React.useEffect(() => {
    setIsInitializing(false);
  }, []);

  // Check if we're on mobile and render mobile component
  if (isMobile()) {
    return <MobileAuth />;
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const roleConfig = {
    driver: {
      icon: Truck,
      title: 'Driver',
      description: 'Professional drivers and operators',
      color: 'bg-blue-500',
      route: '/dashboard'
    },
    mechanic: {
      icon: Wrench,
      title: 'Mechanic',
      description: 'Vehicle maintenance and repairs',
      color: 'bg-orange-500',
      route: '/mechanics'
    },
    parent: {
      icon: Users,
      title: 'Parent',
      description: 'Track your child\'s journey',
      color: 'bg-green-500',
      route: '/parent/dashboard'
    },
    council: {
      icon: Shield,
      title: 'Council',
      description: 'Local authority oversight',
      color: 'bg-purple-500',
      route: '/admin'
    },
    admin: {
      icon: Settings,
      title: 'Admin',
      description: 'System administration',
      color: 'bg-red-500',
      route: '/admin'
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      const config = roleConfig[selectedRole];
      navigate(config.route);
    } catch (error: any) {
      console.error('💥 Login failed:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: selectedRole,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    const IconComponent = roleConfig[role].icon;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left Column - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Truck className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-sm" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Logistics Solution Resources</h1>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">LSR</p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-600">Transport management made simple</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 w-full">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Log in to LSR</h2>
              <p className="text-sm sm:text-base text-gray-600">Don't have an account? <Link to="/auth" className="text-blue-600 hover:underline">Start a free trial</Link></p>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                <TabsTrigger value="signin" className="text-sm sm:text-base">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm sm:text-base">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 sm:space-y-6">
                <form onSubmit={handleSignIn} className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address or username</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 text-base"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 text-base"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={keepLoggedIn}
                        onChange={(e) => setKeepLoggedIn(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-sm text-gray-600">Keep me logged in</span>
                    </label>
                    <button type="button" className="text-sm text-blue-600 hover:underline self-start sm:self-auto">
                      Forgot password?
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <AnimatedSignInButton
                      onClick={handleSignIn}
                      text="Log in"
                      isLoading={loading}
                    />
                  </div>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-12 text-sm">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" className="h-12 text-sm">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    SAML
                  </Button>
                </div>

                <div className="text-center">
                  <button type="button" className="text-sm text-blue-600 hover:underline">
                    Resend confirmation email
                  </button>
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 sm:space-y-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                                              <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="h-12"
                          required
                        />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-sm font-medium text-gray-700">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-sm font-medium text-gray-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signupPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                    <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleConfig).map(([role, config]) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center space-x-2">
                              {getRoleIcon(role as UserRole)}
                              <span>{config.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700" 
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Referral Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 text-center">
            <p className="text-xs sm:text-sm text-green-800">
              <strong>Refer someone to LSR</strong> and earn up to £1,000 in rewards.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Feature Updates */}
      <div className="hidden xl:flex xl:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100 p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">What's New</h2>
            <p className="text-gray-600">Stay updated with the latest features and improvements</p>
          </div>

          <div className="space-y-6">
            {/* Feature Update 1 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">New</span>
                    <span className="text-xs text-gray-500">yesterday</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Track Light Maintenance on Your Tools</h3>
                  <p className="text-sm text-gray-600">Keep track of all your maintenance tools and equipment with our new light maintenance tracking feature.</p>
                </div>
              </div>
            </div>

            {/* Feature Update 2 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">FEATURE UPDATE</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Update Purchase Order Status with Automations</h3>
                  <p className="text-sm text-gray-600">Automatically update purchase order statuses and streamline your procurement process.</p>
                  <div className="mt-3">
                    <img 
                      src="https://via.placeholder.com/300x150/f3f4f6/6b7280?text=Feature+Preview" 
                      alt="Feature preview" 
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Update 3 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Improvement</span>
                    <span className="text-xs text-gray-500">6 days ago</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Automate Purchase Order Approvals</h3>
                  <p className="text-sm text-gray-600">Set up automated approval workflows for purchase orders to save time and reduce manual processes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
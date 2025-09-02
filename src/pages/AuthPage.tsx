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
import EmailService from '@/services/emailService';
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
      route: '/driver-dashboard'
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

      // Send welcome email
      try {
        await EmailService.sendWelcomeEmail({
          to: email,
          firstName: firstName,
          lastName: lastName,
          email: email,
          loginUrl: `${window.location.origin}/auth`
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the signup if email fails
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account and welcome message.",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex flex-col lg:flex-row relative overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link to="/">
          <Button variant="outline" className="bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg hover:shadow-xl transition-all duration-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Left Column - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-12 lg:py-16 overflow-y-auto">
        <div className="w-full max-w-lg space-y-8 sm:space-y-10">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 sm:space-x-5 mb-6 sm:mb-8">
              <div className="relative">
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-xl">
                  <Truck className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-sm" />
                </div>
                <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gray-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Logistics Solution Resources</h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium tracking-wide">LSR</p>
              </div>
            </div>
            <p className="text-base sm:text-lg text-gray-600 font-medium">Transport management made simple</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-8 lg:p-10 w-full backdrop-blur-sm">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">Log in to LSR</h2>
              <p className="text-base sm:text-lg text-gray-600">Don't have an account? <Link to="/auth" className="text-gray-900 hover:text-gray-700 underline font-medium">Start a free trial</Link></p>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8 h-12 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="signin" className="text-base sm:text-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-base sm:text-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-6 sm:space-y-8">
                <form onSubmit={handleSignIn} className="space-y-6 sm:space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-base font-semibold text-gray-800">Email address or username</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-14 text-base border-gray-300 focus:border-gray-600 focus:ring-gray-600 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-base font-semibold text-gray-800">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-14 text-base border-gray-300 focus:border-gray-600 focus:ring-gray-600 rounded-xl"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        checked={keepLoggedIn}
                        onChange={(e) => setKeepLoggedIn(e.target.checked)}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-600 w-5 h-5"
                      />
                      <span className="text-base text-gray-700 font-medium">Keep me logged in</span>
                    </label>
                    <Link to="/reset-password" className="text-base text-gray-900 hover:text-gray-700 underline font-medium self-start sm:self-auto transition-colors">
                      Forgot password?
                    </Link>
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
                  <div className="relative flex justify-center text-base">
                    <span className="px-4 bg-white text-gray-600 font-medium">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-14 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl transition-all duration-200">
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" className="h-14 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl transition-all duration-200">
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    SAML
                  </Button>
                </div>

                <div className="text-center">
                  <button type="button" className="text-base text-gray-900 hover:text-gray-700 underline font-medium transition-colors">
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
                    className="w-full h-12 text-base font-medium bg-gray-900 hover:bg-gray-800 text-white" 
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Referral Banner */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 text-center shadow-sm">
            <p className="text-sm sm:text-base text-gray-800 font-medium">
              <strong>Refer someone to LSR</strong> and earn up to £1,000 in rewards.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Feature Updates */}
      <div className="hidden xl:flex xl:w-1/2 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-10 lg:p-16">
        <div className="w-full max-w-lg space-y-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">What's New</h2>
            <p className="text-lg text-gray-600 font-medium">Stay updated with the latest features and improvements</p>
          </div>

          <div className="space-y-8">
            {/* Feature Update 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">New</span>
                    <span className="text-sm text-gray-500">yesterday</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Track Light Maintenance on Your Tools</h3>
                  <p className="text-base text-gray-600 leading-relaxed">Keep track of all your maintenance tools and equipment with our new light maintenance tracking feature.</p>
                </div>
              </div>
            </div>

            {/* Feature Update 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">FEATURE UPDATE</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Update Purchase Order Status with Automations</h3>
                  <p className="text-base text-gray-600 leading-relaxed mb-4">Automatically update purchase order statuses and streamline your procurement process.</p>
                  <div className="mt-4">
                    <img 
                      src="https://via.placeholder.com/300x150/f3f4f6/6b7280?text=Feature+Preview" 
                      alt="Feature preview" 
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  </div>
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
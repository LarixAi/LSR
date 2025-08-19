import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Car,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const CustomerAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    postcode: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login - in real app this would call Supabase auth
    setTimeout(() => {
      toast({
        title: "Login Successful!",
        description: "Welcome back to your dashboard.",
      });
      navigate('/customer-dashboard');
      setIsLoading(false);
    }, 1500);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate signup - in real app this would call Supabase auth
    setTimeout(() => {
      toast({
        title: "Account Created!",
        description: "Welcome! You can now start booking your transport.",
      });
      navigate('/customer-dashboard');
      setIsLoading(false);
    }, 2000);
  };

  const updateLoginForm = (field: string, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
  };

  const updateSignupForm = (field: string, value: string) => {
    setSignupForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <Car className="w-10 h-10 inline-block mr-3 text-blue-600" />
            Transport Booking
          </h1>
          <p className="text-xl text-gray-600">Professional passenger service at your fingertips</p>
        </div>

        <Card className="shadow-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <User className="w-6 h-6 mr-2 text-blue-600" />
                  Welcome Back
                </CardTitle>
                <p className="text-gray-600">Sign in to your account to manage bookings</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={loginForm.email}
                        onChange={(e) => updateLoginForm('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        value={loginForm.password}
                        onChange={(e) => updateLoginForm('password', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <button type="button" className="text-sm text-blue-600 hover:underline">
                      Forgot password?
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full text-lg py-6"
                    disabled={isLoading || !loginForm.email || !loginForm.password}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>

                  <div className="text-center">
                    <span className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        className="text-blue-600 hover:underline"
                        onClick={() => setActiveTab('signup')}
                      >
                        Create one here
                      </button>
                    </span>
                  </div>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="signup">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                  Create Account
                </CardTitle>
                <p className="text-gray-600">Join us and start booking professional transport</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        value={signupForm.firstName}
                        onChange={(e) => updateSignupForm('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        value={signupForm.lastName}
                        onChange={(e) => updateSignupForm('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={signupForm.email}
                        onChange={(e) => updateSignupForm('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        className="pl-10"
                        value={signupForm.phone}
                        onChange={(e) => updateSignupForm('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="address"
                          placeholder="Enter your address"
                          className="pl-10"
                          value={signupForm.address}
                          onChange={(e) => updateSignupForm('address', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={signupForm.city}
                        onChange={(e) => updateSignupForm('city', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      placeholder="Enter postcode"
                      value={signupForm.postcode}
                      onChange={(e) => updateSignupForm('postcode', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create password"
                          className="pl-10"
                          value={signupForm.password}
                          onChange={(e) => updateSignupForm('password', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={signupForm.confirmPassword}
                        onChange={(e) => updateSignupForm('confirmPassword', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" required className="rounded" />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <button type="button" className="text-blue-600 hover:underline">
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button type="button" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </button>
                    </span>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full text-lg py-6"
                    disabled={isLoading || !signupForm.firstName || !signupForm.lastName || !signupForm.email || !signupForm.password || !signupForm.confirmPassword}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>

                  <div className="text-center">
                    <span className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <button
                        type="button"
                        className="text-blue-600 hover:underline"
                        onClick={() => setActiveTab('login')}
                      >
                        Sign in here
                      </button>
                    </span>
                  </div>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="tel:+442012345678" className="text-blue-600 hover:underline">
              +44 20 1234 5678
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerAuth;
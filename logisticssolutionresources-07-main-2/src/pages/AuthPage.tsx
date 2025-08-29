import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Truck, BookOpen, TrendingUp, Zap, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AuthPage = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast({ title: 'Welcome back!', description: "You've been signed in successfully." });
      navigate('/dashboard');
    } catch (error: any) {
      const message = error?.message?.includes('Invalid login credentials')
        ? 'Invalid email or password. Please try again.'
        : error?.message?.includes('Email not confirmed')
        ? 'Please confirm your email before signing in.'
        : 'Failed to sign in.';
      toast({ title: 'Sign in failed', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: 'Google sign-in failed', description: error.message || 'Try again later', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[520px,1fr] gap-8 items-start">
          {/* Left: Login Card */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 sm:px-8 pt-8">
              <div className="flex items-center justify-between">
                <Link to="/" className="inline-flex items-center space-x-2 group">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:bg-primary/90 transition-colors">
                    <Truck className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold">Transentrix</span>
                </Link>
                <Link to="/book-demo" className="text-sm text-primary hover:underline font-medium">
                  Start a free trial
                </Link>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Log in to Transentrix</h1>
                <Link 
                  to="/" 
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                  Back to home
                </Link>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="px-6 sm:px-8 pt-6 pb-8 space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="sr-only">Email address or username</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              {/* Password with show toggle */}
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 px-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(Boolean(v))} />
                  <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Keep me logged in
                  </label>
                </div>
                <Link to="/reset-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-semibold" size="lg" disabled={loading}>
                {loading ? 'Logging in…' : 'Log in'}
              </Button>

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Social row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button type="button" variant="outline" className="h-12 text-base font-medium" onClick={handleGoogleSignIn}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Log in with Google
                </Button>
                <Button type="button" variant="outline" className="h-12 text-base font-medium" disabled>
                  Log in with SAML
                </Button>
              </div>

              {/* Resend confirmation */}
              <p className="text-center text-xs text-muted-foreground mt-4">
                <Link to="#" className="hover:underline">Resend confirmation email</Link>
              </p>
            </form>
          </div>

          {/* Right: What's New */}
          <aside className="hidden lg:block bg-card border border-border rounded-2xl p-6">
            <div className="space-y-4">
              {/* Card 1 */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                      <Zap className="w-3 h-3 mr-1" /> NEW FEATURE
                    </span>
                    <span className="text-xs text-muted-foreground">a week ago</span>
                  </div>
                  <h3 className="font-semibold text-base mb-2">Transentrix Academy</h3>
                  <div className="bg-card rounded p-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Welcome to the Transentrix Academy</p>
                        <p className="text-xs text-muted-foreground">Learn the platform inside and out</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Transentrix Academy is now available as a self‑paced learning and resource platform for Fleet Managers, Drivers, and Technicians.
                  </p>
                  <Link to="#" className="text-sm text-primary hover:underline inline-flex items-center">
                    Learn more <ChevronRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
                <div className="px-4 py-2 bg-muted/30 flex items-center justify-between">
                  <span className="text-xs font-medium">New</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                      <TrendingUp className="w-3 h-3 mr-1" /> FEATURE UPDATE
                    </span>
                    <span className="text-xs text-muted-foreground">a week ago</span>
                  </div>
                  <h3 className="font-semibold text-base mb-2">Email Action for Automations</h3>
                  <div className="bg-card rounded p-3 mb-3">
                    <div className="aspect-video bg-muted rounded flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Automation Preview</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Set up automated email notifications for important fleet events and compliance deadlines...
                  </p>
                  <Link to="#" className="text-sm text-primary hover:underline inline-flex items-center">
                    Learn more <ChevronRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
                <div className="px-4 py-2 bg-muted/30 flex items-center justify-between">
                  <span className="text-xs font-medium">Improvement</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Star, Zap, Crown } from 'lucide-react';
import BookDemoDialog from '@/components/BookDemoDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const plans = [
    {
      id: 'basic',
      name: 'Starter',
      icon: Zap,
      price: { monthly: 29, annual: 290 },
      description: 'Perfect for small fleets getting started',
      color: 'from-blue-500 to-blue-600',
      features: [
        'Up to 5 vehicles',
        'Basic route planning',
        'Driver management',
        'Digital defect sheets',
        'Email support',
        'Mobile app access'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Professional',
      icon: Star,
      price: { monthly: 79, annual: 790 },
      description: 'Most popular for growing businesses',
      color: 'from-green-500 to-green-600',
      features: [
        'Up to 25 vehicles',
        'Advanced route optimization',
        'Real-time tracking',
        'Compliance monitoring',
        'Predictive analytics',
        'Priority support',
        'API access',
        'Custom reporting'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Crown,
      price: { monthly: 199, annual: 1990 },
      description: 'For large fleets with advanced needs',
      color: 'from-purple-500 to-purple-600',
      features: [
        'Unlimited vehicles',
        'AI-powered insights',
        'Multi-location support',
        'Advanced compliance tools',
        'Custom integrations',
        'Dedicated account manager',
        'White-label options',
        'SLA guarantee'
      ],
      popular: false
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    const price = isAnnual ? plan.price.annual : plan.price.monthly;
    const period = isAnnual ? 'year' : 'month';
    return { price, period };
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (!isAnnual) return null;
    const monthlyCost = plan.price.monthly * 12;
    const annualCost = plan.price.annual;
    const savings = Math.round(((monthlyCost - annualCost) / monthlyCost) * 100);
    return savings;
  };

  const handlePlanSelect = async (plan: typeof plans[0]) => {
    if (!user) {
      // Redirect to signup if not logged in
      navigate('/signup');
      return;
    }
    
    // Create checkout session for authenticated users
    setIsProcessing(true);
    try {
      const { price } = getPrice(plan);
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { 
          planName: plan.name,
          planDescription: plan.description,
          monthlyPrice: price,
          isAnnual 
        },
      });
      
      if (error) throw error;
      
      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <section id="pricing" className="py-20" style={{ background: 'var(--gradient-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Simple, Transparent
            <span className="block bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              Pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your transport operations. All plans include a 14-day free trial.
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-semibold">
                Save up to 20%
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const { price, period } = getPrice(plan);
            const savings = getSavings(plan);
            
            return (
              <Card
                key={index}
                className={`relative overflow-hidden transition-all duration-500 hover:scale-105 ${
                  plan.popular
                    ? 'bg-card border-2 border-primary shadow-2xl shadow-primary/20'
                    : 'bg-card border hover:bg-accent'
                } backdrop-blur-sm`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-bold">
                    Most Popular
                  </div>
                )}

                <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 bg-primary rounded-xl flex items-center justify-center`}>
                      <plan.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                      <p className="text-muted-foreground text-sm">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-4xl font-bold text-foreground">£{price}</span>
                      <span className="text-muted-foreground">/ {period}</span>
                    </div>
                    {savings && (
                      <div className="text-primary text-sm font-semibold mt-1">
                        Save {savings}% annually
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                      onClick={() => handlePlanSelect(plan)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Start Free Trial'}
                    </Button>
                    
                    <BookDemoDialog>
                      <Button 
                        variant="outline"
                        className="w-full"
                      >
                        Book Demo
                      </Button>
                    </BookDemoDialog>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm">
            All plans include 14-day free trial • No setup fees • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

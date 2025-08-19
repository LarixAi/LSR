
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

  const handlePlanSelect = async (planId: string) => {
    if (!user) {
      // Redirect to signup if not logged in
      navigate('/signup');
      return;
    }
    
    // Create checkout session for authenticated users
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planId, isAnnual },
      });
      
      if (error) throw error;
      
      if (data.url) {
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
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, Transparent
            <span className="block bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your transport operations. All plans include a 14-day free trial.
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-blue-300'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-blue-300'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
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
                    ? 'bg-white/15 border-2 border-green-400 shadow-2xl shadow-green-400/20'
                    : 'bg-white/10 border border-white/20 hover:bg-white/15'
                } backdrop-blur-sm`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-400 to-cyan-400 text-gray-900 text-center py-2 text-sm font-bold">
                    Most Popular
                  </div>
                )}

                <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center`}>
                      <plan.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                      <p className="text-blue-100 text-sm">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-4xl font-bold text-white">£{price}</span>
                      <span className="text-blue-200">/ {period}</span>
                    </div>
                    {savings && (
                      <div className="text-green-400 text-sm font-semibold mt-1">
                        Save {savings}% annually
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-blue-100 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3">
                    <Button 
                      className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold py-3`}
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Start Free Trial'}
                    </Button>
                    
                    <BookDemoDialog>
                      <Button 
                        variant="outline" 
                        className="w-full border-white/30 text-white hover:bg-white/10"
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
          <p className="text-blue-200 text-sm">
            All plans include 14-day free trial • No setup fees • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

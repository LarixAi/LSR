
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Shield, Users, Truck, BarChart3, Clock } from 'lucide-react';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useAuth } from '@/contexts/AuthContext';

const PricingSection = () => {
  const { user } = useAuth();
  const stripeCheckout = useStripeCheckout();
  
  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "£29",
      period: "per month",
      description: "Perfect for small transport companies getting started",
      features: [
        "Up to 5 drivers",
        "Up to 10 vehicles",
        "Basic reporting",
        "Email support",
        "Mobile app access",
        "Vehicle inspections"
      ],
      color: "from-gray-600 to-gray-800",
      bgColor: "from-gray-50 to-gray-100",
      popular: true,
      icon: Truck
    },
    {
      id: "professional",
      name: "Professional",
      price: "£79",
      period: "per month",
      description: "Ideal for growing transport businesses",
      features: [
        "Up to 25 drivers",
        "Up to 50 vehicles",
        "Advanced reporting",
        "Priority support",
        "API access",
        "Custom integrations",
        "Real-time tracking",
        "Compliance management"
      ],
      color: "from-gray-700 to-gray-900",
      bgColor: "from-gray-50 to-gray-100",
      popular: false,
      icon: Shield
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "£199",
      period: "per month",
      description: "For large transport operations with complex needs",
      features: [
        "Unlimited drivers",
        "Unlimited vehicles",
        "Custom reporting",
        "Dedicated support",
        "Full API access",
        "White-label options",
        "Advanced analytics",
        "Custom integrations"
      ],
      color: "from-gray-600 to-gray-800",
      bgColor: "from-gray-50 to-gray-100",
      popular: false,
      icon: Users
    }
  ];

  const handlePlanSelection = async (planId: string) => {
    if (!user) {
      // Redirect to signup if not logged in
      window.location.href = '/signup';
      return;
    }
    
    try {
      await stripeCheckout.mutateAsync({
        planId,
        isAnnual: false
      });
    } catch (error) {
      console.error('Failed to start checkout:', error);
    }
  };

  const features = [
    {
      icon: Truck,
      title: "Fleet Management",
      description: "Comprehensive vehicle and driver management"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Advanced insights and performance tracking"
    },
    {
      icon: Shield,
      title: "Compliance & Safety",
      description: "Built-in safety protocols and compliance tools"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock professional support"
    }
  ];

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Subtle professional background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Professional
            <span className="block bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
              Pricing Plans
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Choose the perfect plan for your transport business. All plans include our core features 
            with professional support and regular updates.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 transform bg-gradient-to-br ${plan.bgColor} border border-gray-200 ${plan.popular ? 'ring-2 ring-gray-600' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-4 py-2 rounded-full font-semibold">
                    <Star className="w-4 h-4 mr-2" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${plan.color} rounded-xl flex items-center justify-center shadow-md`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-600">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <div className={`w-5 h-5 mt-0.5 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300`}
                  onClick={() => handlePlanSelection(plan.id)}
                  disabled={stripeCheckout.isPending}
                >
                  {stripeCheckout.isPending ? 'Loading...' : (plan.id === 'starter' ? 'Start Free Trial' : 'Get Started')}
                  <Zap className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-xl p-12 shadow-lg border border-gray-200 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              All Plans Include
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every plan comes with our core professional features designed to streamline 
              your transport operations and improve efficiency.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl flex items-center justify-center shadow-md">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl px-8 py-6 shadow-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900">30-Day Free Trial</div>
                <div className="text-sm text-gray-600">Starter plan only • No credit card required</div>
              </div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Cancel Anytime</div>
                <div className="text-sm text-gray-600">No long-term contracts</div>
              </div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Professional Support</div>
                <div className="text-sm text-gray-600">Expert assistance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

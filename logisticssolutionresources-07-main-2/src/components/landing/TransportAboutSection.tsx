import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Award, Users, Globe, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const TransportAboutSection = () => {
  const features = [
    'Over 45 years of experience in logistics',
    'Global network covering 150+ countries',
    'ISO certified quality management',
    '24/7 customer support and tracking',
    'Sustainable and eco-friendly practices',
    'Competitive pricing with no hidden costs'
  ];

  const stats = [
    { icon: Users, value: '10K+', label: 'Happy Clients' },
    { icon: Globe, value: '150+', label: 'Countries' },
    { icon: Award, value: '45+', label: 'Years Experience' },
    { icon: TrendingUp, value: '99.9%', label: 'On-Time Delivery' }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">- 01</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-foreground">
              About Us
            </h2>
            <h3 className="text-2xl font-semibold text-primary mb-6">
              Logistics solutions since 1975
            </h3>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We are a leading transport and logistics company with over 45 years of experience in providing reliable, efficient, and innovative solutions. Our commitment to excellence and customer satisfaction has made us the trusted partner for businesses worldwide.
            </p>

            <div className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
              <Link to="/auth">
                Learn More About Us
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-primary text-white rounded-xl">
                <h4 className="text-xl font-semibold mb-2">We Make Cargo Transport Easy!</h4>
                <p className="text-white/90">
                  Trust us with your logistics needs and experience seamless transportation services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransportAboutSection;
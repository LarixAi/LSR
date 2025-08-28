
import React from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Calendar, Shield, FileText, Route, BarChart3, Smartphone, Zap } from 'lucide-react';

const EnhancedFeaturesSection = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Real-Time Vehicle Tracking',
      description: 'Monitor your entire fleet with GPS precision and live updates.',
      color: 'from-blue-500 to-cyan-500',
      delay: '0ms'
    },
    {
      icon: Calendar,
      title: 'Smart Job Scheduler',
      description: 'AI-powered scheduling that optimizes routes and driver assignments.',
      color: 'from-green-500 to-emerald-500',
      delay: '100ms'
    },
    {
      icon: Shield,
      title: 'Compliance Alerts',
      description: 'Automated notifications for regulatory requirements and deadlines.',
      color: 'from-orange-500 to-red-500',
      delay: '200ms'
    },
    {
      icon: FileText,
      title: 'Digital Defect Sheets',
      description: 'Paperless vehicle inspections with photo capture and instant reporting.',
      color: 'from-purple-500 to-pink-500',
      delay: '300ms'
    },
    {
      icon: Route,
      title: 'Route Optimisation',
      description: 'Dynamic route planning that saves fuel and reduces travel time.',
      color: 'from-indigo-500 to-blue-500',
      delay: '400ms'
    },
    {
      icon: BarChart3,
      title: 'Predictive Reports',
      description: 'Advanced analytics and forecasting for informed decision making.',
      color: 'from-teal-500 to-green-500',
      delay: '500ms'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Full functionality on any device, optimized for field operations.',
      color: 'from-rose-500 to-pink-500',
      delay: '600ms'
    },
    {
      icon: Zap,
      title: 'Instant Notifications',
      description: 'Real-time alerts keep everyone informed and operations running smoothly.',
      color: 'from-yellow-500 to-orange-500',
      delay: '700ms'
    }
  ];

  return (
    <section id="features" className="py-20 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Powerful Features
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Built for Excellence
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the advanced capabilities that make LSR the leading choice for transport management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="relative overflow-hidden bg-card border border-border hover:bg-secondary/50 transition-all duration-500 hover:scale-105 group animate-fade-in"
              style={{ animationDelay: feature.delay }}
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
              
              <div className="p-6 relative z-10">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>

                <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnhancedFeaturesSection;


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Shield, Route, Users, FileText, Briefcase, BarChart3 } from 'lucide-react';

const FeaturesSection = () => {
  const coreFeatures = [
    {
      icon: Shield,
      title: 'Vehicle Safety Checks',
      description: 'Comprehensive daily vehicle inspections with digital reporting and maintenance alerts.',
      benefits: ['Digital inspection forms', 'Photo documentation', 'Maintenance scheduling']
    },
    {
      icon: Route,
      title: 'Route Management',
      description: 'Intelligent route planning with real-time tracking and optimization capabilities.',
      benefits: ['GPS tracking', 'Route optimization', 'Live updates']
    },
    {
      icon: Users,
      title: 'Driver Management',
      description: 'Complete driver onboarding, scheduling, and performance management system.',
      benefits: ['Digital onboarding', 'Schedule management', 'Performance tracking']
    },
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Centralized document storage with automated compliance and expiry tracking.',
      benefits: ['Digital storage', 'Compliance tracking', 'Automated alerts']
    },
    {
      icon: Briefcase,
      title: 'Job Management',
      description: 'Efficient job scheduling with bidding system and automated assignment.',
      benefits: ['Job bidding', 'Automated scheduling', 'Payment tracking']
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Comprehensive insights into operations, costs, and performance metrics.',
      benefits: ['Real-time analytics', 'Cost tracking', 'Performance reports']
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Transport Management Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to run efficient, safe, and compliant transport operations in one integrated platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreFeatures.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

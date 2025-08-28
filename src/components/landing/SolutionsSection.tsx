
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Truck, 
  Users, 
  Shield, 
  BarChart3, 
  Route, 
  Clock, 
  MapPin, 
  CheckCircle,
  Zap,
  Star,
  Target,
  TrendingUp
} from 'lucide-react';

const SolutionsSection = () => {
  const solutions = [
    {
      icon: Truck,
      title: 'Fleet Management',
      description: 'Comprehensive fleet management with real-time tracking, maintenance scheduling, and driver management.',
      color: 'from-teal-500 to-teal-600',
      features: [
        'Real-time GPS tracking',
        'Maintenance scheduling',
        'Fuel management',
        'Driver performance analytics'
      ]
    },
    {
      icon: Users,
      title: 'Driver Management',
      description: 'Complete driver lifecycle management from recruitment to performance monitoring and training.',
      color: 'from-blue-500 to-blue-600',
      features: [
        'Driver recruitment & onboarding',
        'Performance monitoring',
        'Training management',
        'Compliance tracking'
      ]
    },
    {
      icon: Shield,
      title: 'Compliance & Safety',
      description: 'Ensure regulatory compliance and maintain the highest safety standards across your operations.',
      color: 'from-teal-500 to-teal-600',
      features: [
        'Regulatory compliance',
        'Safety monitoring',
        'Incident reporting',
        'Audit trails'
      ]
    }
  ];

  return (
    <section id="solutions" className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-teal-100 to-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-100 to-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-teal-50 to-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-50 to-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '6s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Solutions for Every
            <span className="block bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Transport Challenge
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how LSR transforms operations for different teams across your organization
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <Card
              key={index}
              className="relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group border border-gray-200"
              >
              <div className={`absolute inset-0 bg-gradient-to-br ${solution.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              <div className="p-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${solution.color} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                  <solution.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-teal-600 transition-colors duration-300">
                  {solution.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {solution.description}
                </p>

                <div className="space-y-3">
                  {solution.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 bg-gradient-to-r ${solution.color} rounded-full`} />
                      <span className="text-sm font-medium text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;

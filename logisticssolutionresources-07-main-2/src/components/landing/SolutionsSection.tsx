
import React from 'react';
import { Card } from '@/components/ui/card';
import { Truck, Shield, Users, BarChart3, Clock, Route } from 'lucide-react';

const SolutionsSection = () => {
  const solutions = [
    {
      icon: Truck,
      title: 'Fleet & Transport Managers',
      description: 'Streamline operations with intelligent route planning, automated driver scheduling, and real-time fleet monitoring.',
      features: ['Route Planning', 'Driver Scheduling', 'Fleet Monitoring', 'Cost Optimization'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Shield,
      title: 'Compliance Teams',
      description: 'Stay ahead of regulations with automated compliance checks, real-time alerts, and comprehensive audit trails.',
      features: ['Automated Checks', 'Real-time Alerts', 'Audit Trails', 'Regulatory Updates'],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Users,
      title: 'Drivers & Mechanics',
      description: 'Empower your team with real-time updates, digital defect tracking, and streamlined communication tools.',
      features: ['Real-time Updates', 'Digital Defect Sheets', 'Communication Tools', 'Mobile Access'],
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <section id="solutions" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Solutions for Every
            <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
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
              className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${solution.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              <div className="p-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${solution.color} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                  <solution.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {solution.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {solution.description}
                </p>

                <div className="space-y-3">
                  {solution.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 bg-gradient-to-r ${solution.color} rounded-full`} />
                      <span className="text-sm font-medium text-gray-700">{feature}</span>
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

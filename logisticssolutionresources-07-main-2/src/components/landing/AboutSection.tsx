
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, Award, Clock } from 'lucide-react';

const AboutSection = () => {
  const values = [
    {
      icon: Shield,
      title: 'Safety First',
      description: 'We prioritize safety above all else, ensuring every journey is secure and compliant with UK transport regulations.'
    },
    {
      icon: Users,
      title: 'Customer-Centric',
      description: 'Our platform is designed with users in mind, providing intuitive solutions for drivers, administrators, and passengers.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for operational excellence, helping transport companies achieve the highest standards in their services.'
    },
    {
      icon: Clock,
      title: 'Reliability',
      description: '24/7 system reliability ensures your operations never stop, with real-time monitoring and instant support.'
    }
  ];

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            About LSR - Logistics Solution Resources
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We are the UK's leading transport management platform, trusted by hundreds of transport professionals 
            to deliver safe, efficient, and compliant operations every day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              At LSR, we're revolutionizing transport management through innovative technology solutions. 
              Our comprehensive platform streamlines operations, ensures safety compliance, and empowers 
              transport professionals to focus on what they do best - delivering exceptional service.
            </p>
            <p className="text-gray-600 leading-relaxed">
              From small transport companies to large fleet operators, we provide the tools and insights 
              needed to optimize routes, manage drivers, ensure vehicle safety, and maintain the highest 
              standards of operational excellence across the UK.
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600">Active Vehicles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">10K+</div>
                <div className="text-gray-600">Daily Passengers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                <div className="text-gray-600">On-time Performance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-gray-600">Support Available</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;


import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Truck, Users, Shield, BarChart3 } from 'lucide-react';
import BookDemoDialog from '@/components/BookDemoDialog';

const HeroSection = () => {
  const features = [
    { icon: Truck, text: 'Fleet Management' },
    { icon: Users, text: 'Driver Management' },
    { icon: Shield, text: 'Compliance Tracking' },
    { icon: BarChart3, text: 'Real-time Analytics' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Transform Your
            <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Transport Operations
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Streamline fleet management, ensure compliance, and optimize operations with LSR's 
            comprehensive transport management platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <BookDemoDialog>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
                Book Free Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </BookDemoDialog>
            
            <Button variant="outline" size="lg" className="border-2 border-gray-300 hover:border-blue-500 px-8 py-4 text-lg font-semibold">
              View Features
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <feature.icon className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Trusted by transport companies across the UK</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">LSR</div>
              <div className="text-lg text-gray-400">•</div>
              <div className="text-sm text-gray-400">Secure & Compliant</div>
              <div className="text-lg text-gray-400">•</div>
              <div className="text-sm text-gray-400">24/7 Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Truck, Users, Shield, BarChart3, Zap, Route, Star, CheckCircle } from 'lucide-react';
import BookDemoDialog from '@/components/BookDemoDialog';

const AnimatedHeroSection = () => {
  const features = [
    { icon: Truck, text: 'Fleet Management', color: 'from-green-600 to-green-700' },
    { icon: Users, text: 'Driver Management', color: 'from-green-700 to-green-800' },
    { icon: Shield, text: 'Compliance Tracking', color: 'from-green-600 to-green-700' },
    { icon: BarChart3, text: 'Real-time Analytics', color: 'from-green-700 to-green-800' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 overflow-hidden">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0">
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 1200 800">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Professional floating elements */}
        <div className="absolute top-1/4 left-1/4 animate-float">
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg transform rotate-12">
            <Truck className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
          </div>
        </div>
        <div className="absolute top-3/4 right-1/4 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-700 to-green-800 rounded-xl flex items-center justify-center shadow-lg transform -rotate-12">
            <Route className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
        <div className="absolute top-1/2 right-1/3 animate-float" style={{ animationDelay: '4s' }}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
        <div className="absolute top-1/3 right-1/5 animate-float" style={{ animationDelay: '6s' }}>
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-700 to-green-800 rounded-lg flex items-center justify-center shadow-lg transform rotate-45">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Subtle professional background elements */}
      <div className="absolute top-20 left-10 w-56 h-56 sm:w-80 sm:h-80 bg-gradient-to-r from-green-200 to-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-56 h-56 sm:w-80 sm:h-80 bg-gradient-to-r from-green-300 to-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-8 left-20 w-56 h-56 sm:w-80 sm:h-80 bg-gradient-to-r from-green-200 to-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '4s' }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <div className="max-w-4xl mx-auto">
          {/* Professional main heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 sm:mb-8 animate-slideUp">
            Professional Transport
            <span className="block bg-gradient-to-r from-green-700 via-green-600 to-green-500 bg-clip-text text-transparent">
              Management Platform
            </span>
          </h1>
          
          {/* Professional subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            Streamline your transport operations with our comprehensive fleet management solution. 
            Trusted by professionals across the UK.
          </p>

          {/* Professional CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-4 text-lg h-auto rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 px-8 py-4 text-lg h-auto rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Book Demo
            </Button>
          </div>

          {/* Professional feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="p-4 sm:p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-300">
                  {feature.text}
                </h3>
              </div>
            ))}
          </div>

          {/* Professional trust indicators */}
          <div className="border-t border-gray-200 pt-8 sm:pt-12">
            <p className="text-sm sm:text-base text-gray-500 mb-6 font-medium">
              Trusted by transport professionals across the UK
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">LSR</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-800">Logistics Solution Resources</span>
              </div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">
                UK Based • Professional Service
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnimatedHeroSection;

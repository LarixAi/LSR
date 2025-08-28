
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Truck, Users, Shield, BarChart3, Zap, Route } from 'lucide-react';
import BookDemoDialog from '@/components/BookDemoDialog';

const AnimatedHeroSection = () => {
  const features = [
    { icon: Truck, text: 'Fleet Management' },
    { icon: Users, text: 'Driver Management' },
    { icon: Shield, text: 'Compliance Tracking' },
    { icon: BarChart3, text: 'Real-time Analytics' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        {/* Moving transport lines */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1200 800">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Animated transport routes */}
            <path
              d="M 0,200 Q 300,100 600,200 T 1200,150"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              fill="none"
              className="animate-draw"
            />
            <path
              d="M 0,400 Q 400,300 800,400 T 1200,350"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              fill="none"
              className="animate-draw"
              style={{ animationDelay: '1s' }}
            />
            <path
              d="M 0,600 Q 300,500 600,600 T 1200,550"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              fill="none"
              className="animate-draw"
              style={{ animationDelay: '2s' }}
            />
          </svg>
        </div>

        {/* Floating vehicles */}
        <div className="absolute top-1/4 left-1/4 animate-float">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
            <Truck className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
        <div className="absolute top-3/4 right-1/4 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
            <Route className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
        <div className="absolute top-1/2 right-1/3 animate-float" style={{ animationDelay: '4s' }}>
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Animated blob backgrounds */}
      <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-r from-blue-200 to-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-40 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-r from-green-200 to-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-8 left-20 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" style={{ animationDelay: '4s' }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <div className="max-w-4xl mx-auto">
          {/* Animated main heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6 animate-slideUp">
            Transform Your Business with
            <span className="block bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 bg-clip-text text-transparent animate-shimmer">
              Smart Transport Management
            </span>
          </h1>

          {/* Animated subheading */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed animate-slideUp px-4" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            Streamline fleet management, ensure compliance, and optimize operations with LSR's 
            comprehensive transport management platform.
          </p>

          {/* Animated CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 animate-slideUp px-4" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            <BookDemoDialog>
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-blue-50 px-6 sm:px-8 py-3 text-base font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-glow">
                Book Free Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </BookDemoDialog>
            
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-gray-300 hover:border-blue-500 px-6 sm:px-8 py-3 text-base font-semibold hover:scale-105 transition-all duration-300">
              View Features
            </Button>
          </div>

          {/* Animated feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-2xl mx-auto animate-slideUp px-4" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-br from-blue-100/60 to-green-100/60 backdrop-blur-sm rounded-lg border border-blue-200/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fadeIn group"
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
              >
                <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full group-hover:from-green-500 group-hover:to-teal-500 transition-all duration-300">
                  <feature.icon className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Animated trust indicators */}
          <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-200 animate-slideUp px-4" style={{ animationDelay: '1s', animationFillMode: 'both' }}>
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Trusted by transport companies across the UK</p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 opacity-60">
              <div className="text-xl sm:text-2xl font-bold text-gray-400 animate-pulse">LSR</div>
              <div className="hidden sm:block text-lg text-gray-400">•</div>
              <div className="text-xs sm:text-sm text-gray-400 hover:text-green-500 transition-colors">Secure & Compliant</div>
              <div className="hidden sm:block text-lg text-gray-400">•</div>
              <div className="text-xs sm:text-sm text-gray-400 hover:text-blue-500 transition-colors">24/7 Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnimatedHeroSection;

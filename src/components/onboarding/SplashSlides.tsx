import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Truck, Users, Calendar, BarChart3, Shield, MapPin, Bell, CheckCircle, ArrowRight } from 'lucide-react';

interface SplashSlideProps {
  onComplete: () => void;
}

const SplashSlides: React.FC<SplashSlideProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      icon: Truck,
      title: "Fleet Management",
      subtitle: "Complete Vehicle Control",
      description: "Manage your entire fleet with advanced tracking, maintenance scheduling, and compliance monitoring in one integrated platform.",
      features: [
        { text: "Real-time vehicle tracking", icon: MapPin },
        { text: "Automated maintenance alerts", icon: Bell },
        { text: "Compliance monitoring", icon: Shield }
      ],
      bgGradient: "bg-gradient-to-br from-slate-50 to-blue-50",
      cardGradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      accentColor: "text-blue-600"
    },
    {
      id: 2,
      icon: Users,
      title: "Driver Management",
      subtitle: "Streamlined Operations",
      description: "Efficiently manage your workforce with intelligent scheduling, performance tracking, and automated compliance reporting.",
      features: [
        { text: "Smart staff scheduling", icon: Calendar },
        { text: "Performance analytics", icon: BarChart3 },
        { text: "Compliance tracking", icon: CheckCircle }
      ],
      bgGradient: "bg-gradient-to-br from-slate-50 to-purple-50",
      cardGradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      accentColor: "text-purple-600"
    },
    {
      id: 3,
      icon: Calendar,
      title: "Smart Scheduling",
      subtitle: "Optimized Efficiency",
      description: "AI-powered route optimization and job assignment that reduces costs and maximizes operational efficiency.",
      features: [
        { text: "Intelligent route planning", icon: MapPin },
        { text: "Automated job assignments", icon: CheckCircle },
        { text: "Real-time updates", icon: Bell }
      ],
      bgGradient: "bg-gradient-to-br from-slate-50 to-emerald-50",
      cardGradient: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      accentColor: "text-emerald-600"
    },
    {
      id: 4,
      icon: BarChart3,
      title: "Business Intelligence",
      subtitle: "Data-Driven Growth",
      description: "Comprehensive analytics and reporting tools that provide actionable insights to drive business growth and profitability.",
      features: [
        { text: "Advanced reporting dashboard", icon: BarChart3 },
        { text: "Cost optimization insights", icon: CheckCircle },
        { text: "Performance benchmarking", icon: Users }
      ],
      bgGradient: "bg-gradient-to-br from-slate-50 to-orange-50",
      cardGradient: "bg-gradient-to-br from-orange-500 to-orange-600",
      accentColor: "text-orange-600"
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else {
        setIsAutoPlaying(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentSlide, isAutoPlaying, slides.length]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <div className={`min-h-screen min-h-[100dvh] ${currentSlideData.bgGradient} transition-all duration-1000 ease-out relative overflow-hidden safe-area-inset`}>
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/20 rounded-full -translate-y-36 translate-x-36 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-48 -translate-x-48 blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 pt-12 pb-8">
        <div className="text-center px-6">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
            <img 
              src="/lovable-uploads/c7fc78b4-c136-43b3-b47e-00e97017921c.png" 
              alt="LSR Logo" 
              className="w-6 h-6 object-contain"
            />
            <span className="text-sm font-semibold text-gray-700">LSR Logistics</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="max-w-sm mx-auto">
          {/* Icon Card */}
          <div className="text-center mb-8">
            <div className={`inline-flex w-20 h-20 ${currentSlideData.cardGradient} rounded-2xl items-center justify-center shadow-lg transition-all duration-800 ease-out transform hover:scale-105 mb-6`}>
              <Icon className="w-10 h-10 text-white transition-transform duration-500 ease-out" strokeWidth={1.5} />
            </div>
            
            {/* Title and Subtitle */}
            <div className="transition-all duration-1000 ease-out">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight transition-all duration-700 ease-out">
                {currentSlideData.title}
              </h1>
              <p className={`text-lg font-medium ${currentSlideData.accentColor} mb-4 transition-all duration-700 ease-out delay-100`}>
                {currentSlideData.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="text-center mb-8 transition-all duration-1000 ease-out delay-200">
            <p className="text-gray-600 text-base leading-relaxed transition-all duration-700 ease-out">
              {currentSlideData.description}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            {currentSlideData.features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <div 
                  key={feature.text}
                  className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm transition-all duration-800 ease-out hover:bg-white/80 hover:shadow-md"
                  style={{ transitionDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className={`w-8 h-8 ${currentSlideData.cardGradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <FeatureIcon className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-gray-700 font-medium text-sm">
                    {feature.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="relative z-10 pb-8">
        {/* Progress Indicators */}
        <div className="flex justify-center space-x-1 mb-8">
          {slides.map((_, index) => {
            console.log('SplashSlides progress indicators rendering');
            return (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-gray-700' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                style={{ 
                  width: '5px', 
                  height: '5px',
                  minWidth: '5px',
                  minHeight: '5px',
                  padding: '0',
                  margin: '0',
                  border: 'none'
                }}
              />
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center px-6 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="text-gray-600 hover:text-gray-900 hover:bg-white/50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <span className="text-gray-500 text-sm font-medium">
            {currentSlide + 1} of {slides.length}
          </span>

          <Button
            onClick={nextSlide}
            className={`${currentSlideData.cardGradient} hover:opacity-90 text-white shadow-lg`}
            size="sm"
          >
            {currentSlide === slides.length - 1 ? (
              <>
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Skip Button */}
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onComplete}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Skip introduction
          </Button>
        </div>
      </div>

      {/* Auto-play Progress Bar */}
      {isAutoPlaying && (
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="h-1 bg-gray-200/50">
            <div 
              className={`h-1 ${currentSlideData.cardGradient} transition-all duration-5000 ease-linear`}
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SplashSlides;
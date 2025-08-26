
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, HeadphonesIcon, Sparkles, Star, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Subtle professional background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-white/5 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/3 rounded-full mix-blend-overlay filter blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-white/4 rounded-full mix-blend-overlay filter blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-white/10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-white/10 rounded-full"></div>
        <div className="absolute top-1/3 left-1/4 w-16 h-16 border border-white/10 rotate-45"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full mb-8 border border-white/20">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">Professional Solution</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
          Ready to Transform Your
          <span className="block bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text text-transparent">
            Transport Operations?
          </span>
        </h2>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto">
          Join hundreds of transport professionals who trust LSR for their daily operations. 
          Start your free trial today and experience the difference.
        </p>

        {/* Feature highlights */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          <div className="flex items-center space-x-3 text-gray-300">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
            <span className="font-medium">30-Day Free Trial</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-300">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-medium">Instant Setup</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-300">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-medium">No Credit Card</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <Button 
            size="lg" 
            className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-10 py-6 text-xl h-auto rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" 
            asChild
          >
            <Link to="/auth">
              Start Your Free Trial
              <ArrowRight className="w-6 h-6 ml-3" />
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-10 py-6 text-xl h-auto rounded-lg backdrop-blur-sm font-semibold transition-all duration-300 hover:scale-105"
          >
            <HeadphonesIcon className="w-6 h-6 mr-3" />
            Contact Sales Team
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-300">Active Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">98%</div>
              <div className="text-gray-300">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-300">Support Available</div>
            </div>
          </div>
        </div>

        <p className="text-gray-400 text-lg mt-8 font-medium">
          No credit card required • Full feature access • Cancel anytime
        </p>
      </div>
    </section>
  );
};

export default CTASection;

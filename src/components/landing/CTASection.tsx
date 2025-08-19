
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, HeadphonesIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 to-green-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Transform Your Transport Operations?
        </h2>
        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
          Join hundreds of transport professionals who trust LSR for their daily operations. Start your free trial today and experience the difference.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg h-auto" asChild>
            <Link to="/auth">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg h-auto">
            <HeadphonesIcon className="w-5 h-5 mr-2" />
            Contact Sales Team
          </Button>
        </div>
        <p className="text-blue-100 text-sm">
          No credit card required • 30-day free trial • Full feature access
        </p>
      </div>
    </section>
  );
};

export default CTASection;

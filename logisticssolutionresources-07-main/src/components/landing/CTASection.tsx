
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, HeadphonesIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-primary opacity-90"></div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
          Ready to Transform Your Transport Operations?
        </h2>
        <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
          Join hundreds of transport professionals who trust LSR for their daily operations. Start your free trial today and experience the difference.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button size="lg" className="bg-card hover:bg-card/90 text-foreground px-8 py-4 text-lg h-auto font-semibold rounded-full" asChild>
            <Link to="/auth">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-4 text-lg h-auto rounded-full">
            <HeadphonesIcon className="w-5 h-5 mr-2" />
            Contact Sales Team
          </Button>
        </div>
        <p className="text-primary-foreground/80 text-sm">
          No credit card required • 30-day free trial • Full feature access
        </p>
      </div>
    </section>
  );
};

export default CTASection;

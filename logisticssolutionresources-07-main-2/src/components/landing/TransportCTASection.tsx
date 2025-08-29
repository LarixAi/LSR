import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TransportCTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-900 to-blue-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Ready to Ship Your Cargo?
        </h2>
        <p className="text-xl text-white/90 mb-8 leading-relaxed">
          Get a free quote today and experience the best in transport and logistics services. Our team is ready to handle your shipping needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button 
            size="lg" 
            className="bg-white hover:bg-gray-100 text-blue-900 px-8 py-4 text-lg h-auto font-semibold"
            asChild
          >
            <Link to="/auth">
              Get Free Quote
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg h-auto"
          >
            <Phone className="w-5 h-5 mr-2" />
            Call Us Now
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 justify-center text-white/80">
          <div className="flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" />
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            <span>info@transport.com</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransportCTASection;
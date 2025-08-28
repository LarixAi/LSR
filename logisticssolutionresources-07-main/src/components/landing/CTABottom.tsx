import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTABottom = () => {
  return (
    <section id="get-started" className="border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-primary tracking-widest text-xs font-semibold">
          READY TO GET STARTED?
        </p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold">
          Join thousands of satisfied customers using Transentrix
        </h2>
        <p className="mt-3 text-muted-foreground">
          Questions? Call us at{' '}
          <a className="text-primary underline" href="tel:+442012345678">
            +44 20 1234 5678
          </a>
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth#demo">
            <Button className="px-6 py-3 rounded-2xl shadow-lg shadow-primary/30 font-semibold">
              Book a Demo
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" className="px-6 py-3 rounded-2xl">
              Start free
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTABottom;
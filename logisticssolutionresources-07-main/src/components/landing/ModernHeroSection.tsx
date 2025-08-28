import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Star, Truck, MapPin, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookDemoDialog from '@/components/BookDemoDialog';

const ModernHeroSection = () => {
  const features = [
    { icon: Truck, label: 'Fleet Management' },
    { icon: MapPin, label: 'Route Tracking' },
    { icon: Shield, label: 'Safety First' },
    { icon: Users, label: 'Parent Portal' },
  ];

  return (
    <section className="relative pt-20 pb-32 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-secondary-foreground">
                Trusted by 500+ Transport Companies
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-foreground">
              Simple. Reliable.
              <br />
              <span className="text-primary">Your Ride Awaits</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
              Transform your transport operations with our all-in-one platform. Real-time tracking, smart routing, and complete peace of mind.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <BookDemoDialog>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full">
                  Book Free Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </BookDemoDialog>
              <Button variant="outline" size="lg" className="border-primary/20 hover:bg-secondary px-8 py-6 text-lg rounded-full" asChild>
                <Link to="#features">
                  View Features
                </Link>
              </Button>
            </div>

            {/* Feature icons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right content - App mockup */}
          <div className="relative lg:pl-12">
            <div className="relative">
              {/* Phone mockup */}
              <div className="mx-auto max-w-sm">
                <div className="relative bg-foreground rounded-[3rem] p-2 shadow-2xl">
                  <div className="relative bg-background rounded-[2.5rem] p-4 h-[600px] overflow-hidden">
                    {/* Status bar */}
                    <div className="flex justify-between items-center mb-4 px-2">
                      <span className="text-xs font-medium">9:41 AM</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-3 bg-foreground/20 rounded-sm" />
                        <div className="w-4 h-3 bg-foreground/20 rounded-sm" />
                        <div className="w-4 h-3 bg-foreground rounded-sm" />
                      </div>
                    </div>
                    
                    {/* App content */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Book Your Ride</h3>
                        <div className="w-8 h-8 bg-primary rounded-full" />
                      </div>
                      
                      <div className="bg-secondary rounded-2xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <div>
                            <p className="text-xs text-muted-foreground">From</p>
                            <p className="font-medium">123 Main Street</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          <div>
                            <p className="text-xs text-muted-foreground">To</p>
                            <p className="font-medium">School Campus</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-secondary rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-primary">7:45</p>
                          <p className="text-xs text-muted-foreground">Pickup</p>
                        </div>
                        <div className="bg-secondary rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-primary">8:15</p>
                          <p className="text-xs text-muted-foreground">Arrival</p>
                        </div>
                        <div className="bg-secondary rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-primary">30</p>
                          <p className="text-xs text-muted-foreground">Minutes</p>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-2xl text-lg font-semibold">
                        Book Now
                      </Button>
                      
                      <div className="bg-accent rounded-xl p-3">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          <p className="text-sm">Safe & Insured Transport</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating cards */}
              <div className="absolute -top-4 -left-4 bg-card rounded-xl shadow-lg p-3 animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Driver Verified</p>
                    <p className="text-xs text-muted-foreground">Background checked</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-card rounded-xl shadow-lg p-3 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <Star className="w-4 h-4 text-yellow-500" />
                  <Star className="w-4 h-4 text-yellow-500" />
                  <Star className="w-4 h-4 text-yellow-500" />
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-semibold ml-1">4.9</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">2,543 Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernHeroSection;
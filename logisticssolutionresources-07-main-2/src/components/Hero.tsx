
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, MapPin, Clock, Users, Truck, Route, Activity } from 'lucide-react';

const Hero = () => {
  const features = [
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Advanced safety protocols and real-time monitoring'
    },
    {
      icon: MapPin,
      title: 'Real-time Tracking',
      description: 'Live GPS tracking for all vehicles and routes'
    },
    {
      icon: Clock,
      title: 'Smart Scheduling',
      description: 'Automated scheduling and route optimization'
    },
    {
      icon: Users,
      title: 'Parent Portal',
      description: 'Keep parents informed with live updates'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Students Transported Daily' },
    { value: '500+', label: 'Active Vehicles' },
    { value: '98%', label: 'On-time Performance' },
    { value: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Modern Transport
              <br />
              <span className="text-brand">Management</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90 animate-fade-in">
              Comprehensive platform for safety, efficiency, and communication in transport operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-3">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-semibold px-8 py-3">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Transport Management
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From real-time tracking to safety compliance, our platform handles every aspect of modern transport operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300 animate-fade-in">
                  <div className="icon-badge mx-auto mb-4">
                    <Icon className="w-6 h-6 text-brand" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role-based Dashboard Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tailored for Every Role
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Purpose-built interfaces for administrators, drivers, and parents
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="icon-badge mb-4">
                <Activity className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Admin Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Complete operational oversight with advanced analytics, fleet management, and compliance monitoring.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Explore Admin View
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="icon-badge mb-4">
                <Truck className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Driver Portal</h3>
              <p className="text-gray-600 mb-4">
                Mobile-optimized interface for route management, real-time updates, and safety protocols.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Driver App
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="icon-badge mb-4">
                <Users className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Parent Portal</h3>
              <p className="text-gray-600 mb-4">
                Real-time tracking, notifications, and communication tools for parents and stakeholders.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                See Parent View
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;

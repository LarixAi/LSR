import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock, 
  Shield, 
  Star, 
  Sparkles, 
  Smartphone, 
  Zap, 
  CheckCircle, 
  MapPin, 
  CreditCard, 
  Headphones,
  Calendar,
  Users
} from 'lucide-react';

const CustomerPortalSection = () => {
  const features = [
    {
      icon: Clock,
      title: 'Instant Booking',
      description: 'Book your transport in under 2 minutes with our streamlined process.',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Multiple payment options with bank-level security and encryption.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Star,
      title: 'Premium Service',
      description: 'Professional drivers and well-maintained vehicles for every journey.',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: MapPin,
      title: 'Real-time Tracking',
      description: 'Track your vehicle in real-time with live GPS updates.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: CreditCard,
      title: 'Flexible Pricing',
      description: 'Transparent pricing with no hidden fees or surprise charges.',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for peace of mind.',
      color: 'from-blue-500 to-blue-600'
    }
  ];

  return (
    <section className="py-24 bg-gray-100 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-teal-100 to-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-100 to-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-gradient-to-r from-teal-50 to-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-full mb-6">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Customer Portal</span>
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Book Professional Transport
            <span className="block bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Online
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Experience hassle-free booking with our customer portal. From airport transfers to corporate transport, 
            we make professional passenger services accessible to everyone.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 bg-white border border-gray-200"
                >
                <CardContent className="p-8 text-center relative">
                  <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full opacity-30"></div>
                  <div className="absolute bottom-4 left-4 w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full opacity-40"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Hero Image/Demo */}
          <div className="relative">
            <Card className="shadow-xl border-0 overflow-hidden bg-white">
              <CardContent className="p-0">
                {/* Mock Mobile Interface */}
                <div className="bg-gray-50 p-8">
                  <div className="max-w-sm mx-auto bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-1 shadow-2xl">
                    <div className="bg-white rounded-3xl p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-gray-900">Book Transport</h3>
                        <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                          <Smartphone className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      {/* Service Selection */}
                      <div className="space-y-3">
                        <div className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-800">Airport Transfer</div>
                              <div className="text-sm text-gray-600">From £45</div>
                            </div>
                            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                              <Zap className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-800">Corporate Transport</div>
                              <div className="text-sm text-gray-600">From £120</div>
                            </div>
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <Shield className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-800">School Transport</div>
                              <div className="text-sm text-gray-600">From £299</div>
                            </div>
                            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                              <Star className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-6 bg-white rounded-xl px-8 py-6 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Instant Booking</div>
                  <div className="text-sm text-gray-600">2 minutes or less</div>
                </div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Secure & Safe</div>
                  <div className="text-sm text-gray-600">Verified drivers</div>
                </div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Premium Quality</div>
                  <div className="text-sm text-gray-600">Professional service</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerPortalSection;
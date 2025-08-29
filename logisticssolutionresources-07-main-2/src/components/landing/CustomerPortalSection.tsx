import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  Smartphone, 
  Clock, 
  MapPin, 
  CreditCard, 
  Star, 
  Shield,
  Calendar,
  MessageCircle
} from 'lucide-react';

const CustomerPortalSection = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Clock,
      title: "Instant Booking",
      description: "Get instant quotes and book your transport in under 2 minutes"
    },
    {
      icon: MapPin,
      title: "Real-time Tracking",
      description: "Track your driver's location and get accurate ETAs"
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Safe and secure online payments with instant receipts"
    },
    {
      icon: Star,
      title: "Quality Assured",
      description: "Professional drivers with verified credentials and top ratings"
    },
    {
      icon: Calendar,
      title: "Advance Booking",
      description: "Schedule your transport days or weeks in advance"
    },
    {
      icon: MessageCircle,
      title: "24/7 Support",
      description: "Round-the-clock customer support for peace of mind"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Book Professional Transport Online
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience hassle-free booking with our customer portal. From airport transfers to corporate transport, 
            we make professional passenger services accessible to everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Hero Image/Demo */}
          <div className="relative">
            <Card className="shadow-2xl border-0 overflow-hidden">
              <CardContent className="p-0">
                {/* Mock Mobile Interface */}
                <div className="bg-white p-8">
                  <div className="max-w-sm mx-auto bg-gray-900 rounded-3xl p-1 shadow-2xl">
                    <div className="bg-white rounded-3xl p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">Book Transport</h3>
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <Smartphone className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      {/* Service Selection */}
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Airport Transfer</span>
                            <span className="text-sm text-blue-600">from £45</span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Corporate Transport</span>
                            <span className="text-sm text-gray-600">from £60</span>
                          </div>
                        </div>
                      </div>

                      {/* Location Inputs */}
                      <div className="space-y-2">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                            <span className="text-sm text-gray-600">123 Main Street, London</span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                            <span className="text-sm text-gray-600">Heathrow Airport T2</span>
                          </div>
                        </div>
                      </div>

                      {/* Price Display */}
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">£45</div>
                          <div className="text-xs text-green-700">Estimated fare</div>
                        </div>
                      </div>

                      {/* Book Button */}
                      <button className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-yellow-500 text-white p-3 rounded-full shadow-lg">
              <Star className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto border-0 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Experience Premium Transport?
              </h3>
              <p className="text-gray-600 mb-6">
                Join thousands of satisfied customers who trust us for their transport needs. 
                Professional, reliable, and always on time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
                  onClick={() => navigate('/customer-booking')}
                >
                  Book Now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={() => navigate('/customer-auth')}
                >
                  Create Account
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                No hidden fees • Instant confirmation • 24/7 support
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CustomerPortalSection;
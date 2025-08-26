
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Shield, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Star,
  Award,
  Heart
} from 'lucide-react';

const AboutSection = () => {
  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description: "Comprehensive safety protocols and driver verification ensure every journey is secure",
      color: "from-gray-600 to-gray-800",
      bgColor: "from-gray-50 to-gray-100"
    },
    {
      icon: Clock,
      title: "Reliability",
      description: "Consistent on-time performance with real-time tracking and proactive communication",
      color: "from-gray-700 to-gray-900",
      bgColor: "from-gray-50 to-gray-100"
    },
    {
      icon: Star,
      title: "Quality Service",
      description: "Professional drivers and well-maintained vehicles for exceptional customer experience",
      color: "from-gray-600 to-gray-800",
      bgColor: "from-gray-50 to-gray-100"
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "Cutting-edge technology to streamline operations and enhance efficiency",
      color: "from-gray-700 to-gray-900",
      bgColor: "from-gray-50 to-gray-100"
    }
  ];

  const stats = [
    { value: "15+", label: "Years Experience", icon: Award },
    { value: "500+", label: "Happy Clients", icon: Heart },
    { value: "10K+", label: "Successful Journeys", icon: MapPin },
    { value: "98%", label: "Satisfaction Rate", icon: Star }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle professional background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            About
            <span className="block bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
              Logistics Solution Resources
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We are a leading transport management company dedicated to providing professional, 
            reliable, and innovative solutions for businesses across the UK.
          </p>
        </div>

        {/* Company Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {values.map((value, index) => (
            <Card 
              key={index} 
              className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 transform bg-gradient-to-br ${value.bgColor} border border-gray-200`}
            >
              <CardContent className="p-8 text-center relative">
                <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${value.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
                
                {/* Decorative elements */}
                <div className={`absolute top-4 right-4 w-6 h-6 bg-gradient-to-r ${value.color} rounded-full opacity-20`}></div>
                <div className={`absolute bottom-4 left-4 w-4 h-4 bg-gradient-to-r ${value.color} rounded-full opacity-30`}></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Company Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Our Story
            </h3>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                Founded in 2009, Logistics Solution Resources has grown from a small local transport company 
                to a comprehensive transport management platform serving businesses across the United Kingdom.
              </p>
              <p>
                Our mission is to revolutionize the transport industry by providing innovative, 
                technology-driven solutions that enhance efficiency, safety, and customer satisfaction.
              </p>
              <p>
                We believe in building lasting partnerships with our clients, understanding their unique needs, 
                and delivering tailored solutions that drive their success.
              </p>
            </div>
          </div>

          <div className="relative">
            <Card className="shadow-xl border-0 overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-lg">
                      <Users className="w-12 h-12 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-4">Our Team</h4>
                    <p className="text-gray-600 mb-6">
                      Experienced professionals dedicated to delivering exceptional transport solutions
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">50+</div>
                        <div className="text-sm text-gray-600">Team Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">24/7</div>
                        <div className="text-sm text-gray-600">Support</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-12 border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl flex items-center justify-center shadow-md">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

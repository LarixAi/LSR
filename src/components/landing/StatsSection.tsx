
import React from 'react';
import { TrendingUp, Users, Clock, Shield } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    { 
      value: '500+', 
      label: 'Active Vehicles Managed',
      icon: TrendingUp,
      color: 'from-gray-600 to-gray-800',
      bgColor: 'from-gray-50 to-gray-100'
    },
    { 
      value: '10K+', 
      label: 'Students Transported Daily',
      icon: Users,
      color: 'from-gray-700 to-gray-900',
      bgColor: 'from-gray-50 to-gray-100'
    },
    { 
      value: '98%', 
      label: 'On-time Performance Rate',
      icon: Clock,
      color: 'from-gray-600 to-gray-800',
      bgColor: 'from-gray-50 to-gray-100'
    },
    { 
      value: '24/7', 
      label: 'System Monitoring',
      icon: Shield,
      color: 'from-gray-700 to-gray-900',
      bgColor: 'from-gray-50 to-gray-100'
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Subtle professional background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Trusted by
            <span className="block bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
              Transport Companies
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Delivering exceptional results across the UK transport industry
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`relative group p-8 rounded-xl bg-gradient-to-br ${stat.bgColor} border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 transform`}
            >
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>

              {/* Value */}
              <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3 text-center`}>
                {stat.value}
              </div>

              {/* Label */}
              <div className="text-gray-700 font-semibold text-center text-lg">
                {stat.label}
              </div>

              {/* Decorative elements */}
              <div className={`absolute top-4 right-4 w-8 h-8 bg-gradient-to-r ${stat.color} rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
              <div className={`absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-r ${stat.color} rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-gray-50 rounded-xl px-8 py-4 shadow-lg border border-gray-200">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-gray-600 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-gray-700 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-gray-800 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-gray-700 font-semibold">Live System Status</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

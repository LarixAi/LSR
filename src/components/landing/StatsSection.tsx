
import React from 'react';

const StatsSection = () => {
  const stats = [
    { value: '500+', label: 'Active Vehicles Managed' },
    { value: '10K+', label: 'Students Transported Daily' },
    { value: '98%', label: 'On-time Performance Rate' },
    { value: '24/7', label: 'System Monitoring' }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

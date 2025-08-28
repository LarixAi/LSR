import React from 'react';

const TransportStatsSection = () => {
  const stats = [
    { value: '250K+', label: 'Deliveries Completed', sublabel: 'Successfully delivered worldwide' },
    { value: '99.9%', label: 'On-Time Delivery', sublabel: 'Industry-leading reliability' },
    { value: '45+', label: 'Years of Service', sublabel: 'Trusted since 1975' },
    { value: '150+', label: 'Global Coverage', sublabel: 'Countries and territories' }
  ];

  return (
    <section className="py-20 bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Delivering Excellence Worldwide
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Our numbers speak for themselves. Join thousands of satisfied customers who trust us with their logistics needs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
              <div className="text-lg font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-white/80">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransportStatsSection;
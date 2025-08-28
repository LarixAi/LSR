
import React from 'react';

const StatsSection = () => {
  const stats = [
    { value: '$4.8M', label: 'Raised', sublabel: 'Series A round completed' },
    { value: '150K', label: 'Live Routes', sublabel: 'Monitored daily across cities' },
    { value: '20M kg', label: 'Emission Saved', sublabel: 'Through optimized routes' }
  ];

  return (
    <section className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Millions of Rides. Countless Smiles.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join the revolution in transport management. Our platform powers thousands of rides daily, ensuring safety and reliability for communities worldwide.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 rounded-2xl bg-secondary/50">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-lg font-semibold text-foreground mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

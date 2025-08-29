import React from 'react';
import { Card } from '@/components/ui/card';
import { Truck, Plane, Ship, Package, Train, Globe } from 'lucide-react';

const TransportServicesSection = ({ id }: { id?: string }) => {
  const services = [
    {
      icon: Truck,
      title: 'Road Freight',
      description: 'Reliable road transport solutions with real-time tracking and optimized routes for timely deliveries.',
      color: 'text-blue-600'
    },
    {
      icon: Plane,
      title: 'Air Freight',
      description: 'Fast and secure air cargo services for urgent shipments across global destinations.',
      color: 'text-sky-600'
    },
    {
      icon: Ship,
      title: 'Sea Freight',
      description: 'Cost-effective ocean freight solutions for large-scale international cargo transportation.',
      color: 'text-cyan-600'
    },
    {
      icon: Train,
      title: 'Rail Transport',
      description: 'Efficient rail freight services connecting major cities and industrial hubs.',
      color: 'text-indigo-600'
    },
    {
      icon: Package,
      title: 'Warehousing',
      description: 'Secure storage facilities with inventory management and distribution services.',
      color: 'text-purple-600'
    },
    {
      icon: Globe,
      title: 'Global Logistics',
      description: 'End-to-end supply chain solutions with worldwide coverage and local expertise.',
      color: 'text-blue-700'
    }
  ];

  return (
    <section id={id || "services"} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">- 02</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-foreground">
            Our Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive transport solutions tailored to meet your specific logistics needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white group hover:-translate-y-1"
            >
              <div className={`w-16 h-16 mb-6 ${service.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                <service.icon className="w-full h-full" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-4">
                {service.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransportServicesSection;
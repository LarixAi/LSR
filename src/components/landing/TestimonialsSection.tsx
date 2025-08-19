
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Transport Manager, Brighton Schools',
      content: 'LSR has transformed our transport operations. The safety features and real-time tracking give us complete peace of mind.',
      rating: 5,
      company: 'Brighton Education Authority'
    },
    {
      name: 'Mike Chen',
      role: 'Fleet Operations Director',
      content: 'The route optimization and driver management features have saved us £50,000 annually while improving service quality.',
      rating: 5,
      company: 'Metro Transport Solutions'
    },
    {
      name: 'Lisa Rodriguez',
      role: 'Safety Coordinator',
      content: 'The digital vehicle checks and compliance tracking have made our safety protocols bulletproof. Highly recommended.',
      rating: 5,
      company: 'SafeRide Transport Ltd'
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Transport Professionals Across the UK
          </h2>
          <p className="text-xl text-gray-600">
            See how LSR is transforming transport operations for leading organizations.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500 mb-1">{testimonial.role}</div>
                  <div className="text-xs text-blue-600 font-medium">{testimonial.company}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

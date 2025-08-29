
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Settings, Truck, Users } from 'lucide-react';

const RolesSection = () => {
  const userRoles = [
    {
      icon: Settings,
      title: 'Administrator Dashboard',
      description: 'Complete operational oversight with advanced analytics, fleet management, compliance monitoring, and financial reporting.',
      features: ['Fleet management', 'Driver oversight', 'Financial reports', 'Compliance tracking'],
      color: 'blue'
    },
    {
      icon: Truck,
      title: 'Driver Portal',
      description: 'Mobile-optimized interface for route management, vehicle checks, job tracking, and real-time communication.',
      features: ['Digital vehicle checks', 'Route navigation', 'Job management', 'Real-time updates'],
      color: 'green'
    },
    {
      icon: Users,
      title: 'Parent Portal',
      description: 'Real-time tracking, notifications, and communication tools for parents and stakeholders with live updates.',
      features: ['Live tracking', 'Push notifications', 'Communication tools', 'Schedule updates'],
      color: 'purple'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Purpose-Built for Every Role
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tailored interfaces and tools designed specifically for administrators, drivers, and stakeholders.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {userRoles.map((role, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                role.color === 'blue' ? 'from-blue-500 to-blue-600' :
                role.color === 'green' ? 'from-green-500 to-green-600' :
                'from-purple-500 to-purple-600'
              }`}></div>
              <CardHeader className="pb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                  role.color === 'blue' ? 'bg-blue-100' :
                  role.color === 'green' ? 'bg-green-100' :
                  'bg-purple-100'
                }`}>
                  <role.icon className={`w-7 h-7 ${
                    role.color === 'blue' ? 'text-blue-600' :
                    role.color === 'green' ? 'text-green-600' :
                    'text-purple-600'
                  }`} />
                </div>
                <CardTitle className="text-xl mb-3">{role.title}</CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {role.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Explore {role.title.split(' ')[0]} Features
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;

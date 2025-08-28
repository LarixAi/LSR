
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Download, FileText, BookOpen, Bell, CheckCircle } from 'lucide-react';

const ResourcesSection = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const resources = [
    {
      icon: FileText,
      title: 'Compliance Checklists',
      description: 'Download comprehensive compliance checklists for transport operations.',
      type: 'PDF',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: BookOpen,
      title: 'Transport Guides',
      description: 'Expert guides covering best practices and regulatory requirements.',
      type: 'Guide',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Bell,
      title: 'Industry Updates',
      description: 'Stay informed with the latest news and regulatory changes.',
      type: 'Blog',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <section id="resources" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Knowledge
            <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Resources
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access valuable resources to enhance your transport operations and stay compliant
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {resources.map((resource, index) => (
            <Card
              key={index}
              className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${resource.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              <div className="p-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${resource.color} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                  <resource.icon className="w-8 h-8 text-white" />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {resource.title}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${resource.color} text-white`}>
                    {resource.type}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {resource.description}
                </p>

                <Button className={`w-full bg-gradient-to-r ${resource.color} hover:opacity-90 text-white`}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-600 to-green-600 border-0 text-white p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-3">Stay Informed</h3>
              <p className="text-blue-100">
                Subscribe to receive industry insights, regulatory updates, and exclusive resources
              </p>
            </div>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-blue-100"
                  required
                />
                <Button type="submit" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                  Subscribe
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center space-x-3 text-green-200">
                <CheckCircle className="w-6 h-6" />
                <span className="font-semibold">Thank you for subscribing!</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;

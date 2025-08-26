
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle,
  Send,
  Building,
  Globe
} from 'lucide-react';

const ContactSection = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Support",
      details: "+44 (0) 20 7946 0958",
      subtitle: "Available 24/7",
      color: "from-gray-600 to-gray-800",
      bgColor: "from-gray-50 to-gray-100"
    },
    {
      icon: Mail,
      title: "Email Support",
      details: "transport@logisticssolutionresources.com",
      subtitle: "Response within 2 hours",
      color: "from-gray-700 to-gray-900",
      bgColor: "from-gray-50 to-gray-100"
    },
    {
      icon: MapPin,
      title: "Office Location",
      details: "London, United Kingdom",
      subtitle: "Main headquarters",
      color: "from-gray-600 to-gray-800",
      bgColor: "from-gray-50 to-gray-100"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Monday - Friday",
      subtitle: "9:00 AM - 6:00 PM GMT",
      color: "from-gray-700 to-gray-900",
      bgColor: "from-gray-50 to-gray-100"
    }
  ];

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Subtle professional background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Get in
            <span className="block bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
              Touch
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to transform your transport operations? Contact our team of experts 
            for personalized solutions and professional support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <Card className="shadow-xl border-0 overflow-hidden bg-white">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Send us a Message</h3>
                    <p className="text-gray-600">We'll get back to you within 24 hours</p>
                  </div>
                </div>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
                      <Input 
                        id="firstName" 
                        type="text" 
                        placeholder="Enter your first name"
                        className="mt-2 border-gray-300 focus:border-gray-600 focus:ring-gray-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
                      <Input 
                        id="lastName" 
                        type="text" 
                        placeholder="Enter your last name"
                        className="mt-2 border-gray-300 focus:border-gray-600 focus:ring-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email address"
                      className="mt-2 border-gray-300 focus:border-gray-600 focus:ring-gray-600"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company" className="text-gray-700 font-medium">Company Name</Label>
                    <Input 
                      id="company" 
                      type="text" 
                      placeholder="Enter your company name"
                      className="mt-2 border-gray-300 focus:border-gray-600 focus:ring-gray-600"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-gray-700 font-medium">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us about your transport needs..."
                      rows={5}
                      className="mt-2 border-gray-300 focus:border-gray-600 focus:ring-gray-600 resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950 text-white font-semibold py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Send className="w-5 h-5 mr-3" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                Our dedicated team is here to help you with any questions about our transport 
                management solutions. Reach out to us through any of the channels below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <Card 
                  key={index} 
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 transform bg-gradient-to-br ${info.bgColor} border border-gray-200`}
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 mb-4 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center shadow-md`}>
                      <info.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{info.title}</h4>
                    <p className="text-gray-900 font-semibold mb-1">{info.details}</p>
                    <p className="text-gray-600 text-sm">{info.subtitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Company Info */}
            <Card className="border-0 shadow-lg bg-white border border-gray-200">
              <CardContent className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Logistics Solution Resources</h4>
                    <p className="text-gray-600">Professional Transport Management</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">www.logisticssolutionresources.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">transport@logisticssolutionresources.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">+44 (0) 20 7946 0958</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

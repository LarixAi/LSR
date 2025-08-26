
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Play, 
  Download, 
  BookOpen, 
  Users, 
  Shield,
  TrendingUp,
  Star,
  ArrowRight,
  Calendar,
  Clock
} from 'lucide-react';

const ResourcesSection = () => {
  const resources = [
    {
      icon: FileText,
      title: "Transport Management Guide",
      description: "Comprehensive guide to modern transport management best practices",
      type: "PDF Guide",
      size: "2.4 MB",
      downloads: "1,247",
      color: "from-gray-600 to-gray-800",
      bgColor: "from-gray-50 to-gray-100"
    },
    {
      icon: Play,
      title: "Platform Walkthrough",
      description: "Step-by-step video tutorial showing key platform features",
      type: "Video Tutorial",
      duration: "15 min",
      views: "3,892",
      color: "from-gray-700 to-gray-900",
      bgColor: "from-gray-50 to-gray-100"
    },
    {
      icon: BookOpen,
      title: "Compliance Handbook",
      description: "Essential compliance information for UK transport operators",
      type: "Handbook",
      size: "1.8 MB",
      downloads: "956",
      color: "from-gray-600 to-gray-800",
      bgColor: "from-gray-50 to-gray-100"
    },
    {
      icon: Users,
      title: "Driver Training Manual",
      description: "Complete training manual for professional drivers",
      type: "Training Guide",
      size: "3.2 MB",
      downloads: "2,134",
      color: "from-gray-700 to-gray-900",
      bgColor: "from-gray-50 to-gray-100"
    },
    {
      icon: Shield,
      title: "Safety Protocols",
      description: "Comprehensive safety guidelines and protocols",
      type: "Safety Guide",
      size: "1.5 MB",
      downloads: "1,567",
      color: "from-gray-600 to-gray-800",
      bgColor: "from-gray-50 to-gray-100"
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Guide to understanding and improving fleet performance",
      type: "Analytics Guide",
      size: "2.1 MB",
      downloads: "892",
      color: "from-gray-700 to-gray-900",
      bgColor: "from-gray-50 to-gray-100"
    }
  ];

  const featuredResource = {
    icon: Star,
    title: "Complete Transport Management Playbook",
    description: "Our most comprehensive resource covering everything from fleet optimization to compliance management. Perfect for transport managers and business owners.",
    type: "Premium Guide",
    size: "5.2 MB",
    downloads: "4,567",
    color: "from-gray-700 to-gray-900",
    bgColor: "from-gray-50 to-gray-100"
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle professional background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Professional
            <span className="block bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
              Resources
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Access our comprehensive library of professional resources designed to help you 
            optimize your transport operations and stay ahead of industry standards.
          </p>
        </div>

        {/* Featured Resource */}
        <div className="mb-16">
          <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="p-8 lg:p-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${featuredResource.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <featuredResource.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-gray-600 to-gray-800 text-white">
                        Featured Resource
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {featuredResource.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {featuredResource.description}
                  </p>
                  
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">{featuredResource.type}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium">{featuredResource.size}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">{featuredResource.downloads} downloads</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950 text-white font-semibold px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Download className="w-5 h-5 mr-3" />
                    Download Now
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </div>
                
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 lg:p-12 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center shadow-xl">
                      <BookOpen className="w-16 h-16 text-white" />
                    </div>
                    <div className="text-6xl font-bold text-gray-900 mb-2">5.2</div>
                    <div className="text-gray-600 font-medium">MB Guide</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <Card 
              key={index} 
              className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 transform bg-gradient-to-br ${resource.bgColor} border border-gray-200`}
            >
              <CardContent className="p-8">
                <div className={`w-12 h-12 mb-6 bg-gradient-to-r ${resource.color} rounded-xl flex items-center justify-center shadow-md`}>
                  <resource.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="font-bold text-gray-900 mb-3 text-lg">{resource.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{resource.description}</p>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>{resource.type}</span>
                    </div>
                    {resource.size && (
                      <div className="flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>{resource.size}</span>
                      </div>
                    )}
                    {resource.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{resource.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {resource.downloads && `${resource.downloads} downloads`}
                    {resource.views && `${resource.views} views`}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl px-8 py-6 shadow-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Weekly Updates</div>
                <div className="text-sm text-gray-600">New resources added regularly</div>
              </div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Professional Quality</div>
                <div className="text-sm text-gray-600">Industry-standard content</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;

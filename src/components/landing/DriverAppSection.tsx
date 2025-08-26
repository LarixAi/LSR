import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Download, 
  CheckCircle, 
  ArrowRight,
  Star,
  Users,
  Zap,
  Sparkles,
  Shield,
  Clock
} from 'lucide-react';

export default function DriverAppSection() {
  const features = [
    "56 comprehensive safety questions",
    "Photo documentation with camera",
    "Real-time sync with management",
    "Offline capability for remote areas",
    "GPS location tracking",
    "DVSA compliant standards"
  ];

  const stats = [
    { number: "5,000+", label: "Drivers Using App", color: "from-gray-600 to-gray-800" },
    { number: "56", label: "Safety Questions", color: "from-gray-700 to-gray-900" },
    { number: "10 min", label: "Average Check Time", color: "from-gray-600 to-gray-800" },
    { number: "99.9%", label: "Uptime", color: "from-gray-700 to-gray-900" }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle professional background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <Badge className="mb-6 bg-gradient-to-r from-gray-700 to-gray-900 text-white border-0 px-4 py-2 text-sm font-semibold">
            <Sparkles className="w-4 h-4 mr-2" />
            Professional Mobile App
          </Badge>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Driver Mobile App
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Complete your daily vehicle checks with our professional mobile app. 
            Simple, fast, and compliant with UK transport regulations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - App Info */}
          <div className="space-y-10">
            {/* Hero Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-r from-gray-700 to-gray-900 text-white transform hover:scale-105 transition-all duration-500">
              <CardContent className="p-10">
                <div className="flex items-center space-x-6 mb-8">
                  <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                    <Smartphone className="w-12 h-12" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold">Vehicle Check App</h3>
                    <p className="text-gray-300 text-lg">Professional mobile solution for drivers</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="text-center">
                    <div className="text-4xl font-bold">56</div>
                    <div className="text-gray-300">Safety Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">10 min</div>
                    <div className="text-gray-300">Average Time</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-bold text-lg py-6">
                    <Download className="w-5 h-5 mr-2" />
                    Download for iOS
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold text-lg py-6">
                    <Download className="w-5 h-5 mr-2" />
                    Download for Android
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="p-2 bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Download CTA */}
          <div className="space-y-8">
            {/* Download Options */}
            <Card className="shadow-xl border-0 bg-white border border-gray-200">
              <CardContent className="p-10">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Download className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    Download the App
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Available for iOS and Android devices
                  </p>
                </div>

                <div className="space-y-4">
                  <Button className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:from-gray-800 hover:to-gray-950 font-bold text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Download className="w-5 h-5 mr-3" />
                    Download for iOS
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-gray-600 to-gray-800 text-white hover:from-gray-700 hover:to-gray-900 font-bold text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Download className="w-5 h-5 mr-3" />
                    Download for Android
                  </Button>
                  <Button variant="outline" className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-bold text-lg py-6 rounded-xl transition-all duration-300 hover:scale-105">
                    <ArrowRight className="w-5 h-5 mr-3" />
                    View Web Version
                  </Button>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold">4.8/5</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold">5,000+ downloads</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
              <CardContent className="p-8">
                <h4 className="font-bold text-gray-900 mb-6 flex items-center text-xl">
                  <Zap className="w-6 h-6 text-gray-700 mr-3" />
                  Driver Benefits
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-white/60 rounded-xl border border-gray-200">
                    <CheckCircle className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    <span className="text-gray-800 font-medium">Complete checks in under 5 minutes</span>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-white/60 rounded-xl border border-gray-200">
                    <CheckCircle className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    <span className="text-gray-800 font-medium">No more paper forms or manual filing</span>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-white/60 rounded-xl border border-gray-200">
                    <CheckCircle className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    <span className="text-gray-800 font-medium">Instant submission to management</span>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-white/60 rounded-xl border border-gray-200">
                    <CheckCircle className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    <span className="text-gray-800 font-medium">Photo evidence for any issues found</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Access */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
              <CardContent className="p-8">
                <h4 className="font-bold text-gray-900 mb-6 text-xl">Quick Access</h4>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-105">
                    <ArrowRight className="w-5 h-5 mr-3" />
                    Driver App Download Page
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-105">
                    <ArrowRight className="w-5 h-5 mr-3" />
                    User Guide & Tutorials
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-105">
                    <ArrowRight className="w-5 h-5 mr-3" />
                    Support & Help Center
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 max-w-5xl mx-auto shadow-xl">
            <CardContent className="p-12">
              <h3 className="text-4xl font-bold text-gray-900 mb-6">
                Ready to Start Your Vehicle Checks?
              </h3>
              <p className="text-gray-600 mb-10 max-w-3xl mx-auto text-lg">
                Join thousands of drivers who have already switched to digital vehicle checks. 
                Download the app today and experience the difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950 text-white font-bold text-lg py-6 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Download className="w-6 h-6 mr-3" />
                  Download Now
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-bold text-lg py-6 px-8 rounded-xl transition-all duration-300 hover:scale-105">
                  <ArrowRight className="w-6 h-6 mr-3" />
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Smartphone, 
  Download, 
  CheckCircle, 
  Shield, 
  Clock, 
  MapPin,
  Camera,
  FileText,
  ArrowRight,
  QrCode,
  ExternalLink,
  Star,
  Users,
  Zap
} from 'lucide-react';

export default function DriverAppDownload() {
  const features = [
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      title: "Complete Vehicle Checks",
      description: "56 comprehensive safety questions with photo evidence"
    },
    {
      icon: <Camera className="w-5 h-5 text-blue-500" />,
      title: "Photo Documentation",
      description: "Capture issues with photos and detailed notes"
    },
    {
      icon: <Clock className="w-5 h-5 text-orange-500" />,
      title: "Real-time Updates",
      description: "Instant sync with admin dashboard"
    },
    {
      icon: <Shield className="w-5 h-5 text-purple-500" />,
      title: "DVSA Compliant",
      description: "Meets all UK transport safety standards"
    },
    {
      icon: <MapPin className="w-5 h-5 text-red-500" />,
      title: "Location Tracking",
      description: "GPS location for each check completion"
    },
    {
      icon: <FileText className="w-5 h-5 text-indigo-500" />,
      title: "Digital Records",
      description: "No more paper forms or manual filing"
    }
  ];

  const benefits = [
    "Complete checks in under 5 minutes",
    "No more lost or damaged paper forms",
    "Instant submission to management",
    "Photo evidence for any issues found",
    "GPS location tracking",
    "Offline capability for remote areas"
  ];

  const downloadSteps = [
    {
      step: 1,
      title: "Download the App",
      description: "Get the app from your device's app store",
      action: "Download Now"
    },
    {
      step: 2,
      title: "Enter Your Details",
      description: "Use your driver ID and organization code",
      action: "Get Your Code"
    },
    {
      step: 3,
      title: "Start Your First Check",
      description: "Begin with the daily pre-trip inspection",
      action: "View Demo"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Driver App</h1>
                <p className="text-sm text-gray-600">Download the mobile app for vehicle checks</p>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Star className="w-3 h-3 mr-1" />
              New Version 2.1
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - App Info */}
          <div className="space-y-6">
            {/* Hero Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <CardContent className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Vehicle Check App</h2>
                    <p className="text-blue-100">Complete your daily vehicle inspections with ease</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">56</div>
                    <div className="text-sm text-blue-100">Safety Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">5 min</div>
                    <div className="text-sm text-blue-100">Average Time</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    <Download className="w-4 h-4 mr-2" />
                    Download for iOS
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Download className="w-4 h-4 mr-2" />
                    Download for Android
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span>Key Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0 mt-1">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{feature.title}</h4>
                        <p className="text-xs text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Driver Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Download & Setup */}
          <div className="space-y-6">
            {/* Download Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Get Started in 3 Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {downloadSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{step.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                        <Button variant="outline" size="sm">
                          {step.action}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* QR Code Download */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>Quick Download</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-gray-100 w-48 h-48 mx-auto rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="w-32 h-32 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your phone's camera to download the app
                </p>
                <div className="flex justify-center space-x-3">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    iOS App Store
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Google Play
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium">Contact Support</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">User Guide</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-medium">App Demo</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Start Your Vehicle Checks?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join thousands of drivers who have already switched to digital vehicle checks. 
                Download the app today and experience the difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download Now
                </Button>
                <Button size="lg" variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}




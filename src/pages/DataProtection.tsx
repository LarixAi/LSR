import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Lock, 
  Eye, 
  Download,
  Trash2,
  Settings,
  FileText,
  Database,
  Cookie,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

const DataProtection = () => {
  const { user, profile, loading } = useAuth();
  const [privacySettings, setPrivacySettings] = useState({
    analytics: true,
    marketing: false,
    functional: true,
    performance: true,
    locationTracking: true,
    notifications: true,
    dataSharing: false
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading privacy settings...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  const handleSettingChange = (setting: string, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const dataCategories = [
    {
      category: 'Personal Information',
      description: 'Name, email, phone number, address',
      dataPoints: ['Full name', 'Email address', 'Phone number', 'Home address', 'Emergency contacts'],
      usage: 'Account management, communication, service delivery',
      retention: '7 years after account closure',
      thirdParties: ['Payment processors', 'Communication services']
    },
    {
      category: 'Transport Data',
      description: 'Journey information, routes, schedules',
      dataPoints: ['Pickup/dropoff locations', 'Journey times', 'Route preferences', 'Booking history'],
      usage: 'Service provision, route optimization, safety monitoring',
      retention: '5 years for compliance purposes',
      thirdParties: ['GPS providers', 'Route optimization services']
    },
    {
      category: 'Device Information',
      description: 'Device type, browser, IP address',
      dataPoints: ['Device type', 'Operating system', 'Browser version', 'IP address', 'Location data'],
      usage: 'Technical support, security, personalization',
      retention: '2 years',
      thirdParties: ['Analytics providers', 'Cloud services']
    },
    {
      category: 'Usage Analytics',
      description: 'App usage patterns, preferences',
      dataPoints: ['Page views', 'Feature usage', 'Session duration', 'User preferences'],
      usage: 'Service improvement, feature development',
      retention: '3 years',
      thirdParties: ['Analytics providers']
    }
  ];

  const yourRights = [
    {
      right: 'Right to Access',
      description: 'Request a copy of your personal data',
      action: 'Download your data',
      icon: Download
    },
    {
      right: 'Right to Rectification',
      description: 'Correct inaccurate personal data',
      action: 'Update your profile',
      icon: Settings
    },
    {
      right: 'Right to Erasure',
      description: 'Request deletion of your personal data',
      action: 'Delete account',
      icon: Trash2
    },
    {
      right: 'Right to Portability',
      description: 'Transfer your data to another service',
      action: 'Export data',
      icon: Download
    },
    {
      right: 'Right to Object',
      description: 'Object to processing of your data',
      action: 'Manage preferences',
      icon: Shield
    },
    {
      right: 'Right to Restrict',
      description: 'Limit how we process your data',
      action: 'Contact support',
      icon: Lock
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-600" />
            Data Protection & Privacy
          </h1>
          <p className="text-gray-600 mt-1">Manage your privacy settings and understand how your data is used</p>
        </div>
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">GDPR Compliant</Badge>
      </div>

      {/* Privacy Overview */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Your Privacy Matters</h2>
              <p className="text-gray-600">
                We're committed to protecting your privacy and being transparent about how we use your data. 
                You have full control over your privacy settings and can modify them at any time.
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">A+</div>
              <div className="text-sm text-gray-600">Privacy Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="privacy-settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="privacy-settings">Privacy Settings</TabsTrigger>
          <TabsTrigger value="data-usage">Data Usage</TabsTrigger>
          <TabsTrigger value="your-rights">Your Rights</TabsTrigger>
          <TabsTrigger value="cookies">Cookies</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="privacy-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Privacy Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">Analytics & Performance</h3>
                    <p className="text-sm text-gray-600">
                      Help improve our service by sharing usage analytics
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.analytics}
                    onCheckedChange={(value) => handleSettingChange('analytics', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">Marketing Communications</h3>
                    <p className="text-sm text-gray-600">
                      Receive promotional emails and service updates
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.marketing}
                    onCheckedChange={(value) => handleSettingChange('marketing', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">Functional Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Essential for the website to function properly
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.functional}
                    onCheckedChange={(value) => handleSettingChange('functional', value)}
                    disabled
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">Performance Monitoring</h3>
                    <p className="text-sm text-gray-600">
                      Monitor app performance and identify issues
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.performance}
                    onCheckedChange={(value) => handleSettingChange('performance', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">Location Tracking</h3>
                    <p className="text-sm text-gray-600">
                      Track location for transport services and safety
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.locationTracking}
                    onCheckedChange={(value) => handleSettingChange('locationTracking', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-gray-600">
                      Receive important updates and transport alerts
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.notifications}
                    onCheckedChange={(value) => handleSettingChange('notifications', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">Data Sharing with Partners</h3>
                    <p className="text-sm text-gray-600">
                      Share anonymized data with trusted partners
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.dataSharing}
                    onCheckedChange={(value) => handleSettingChange('dataSharing', value)}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <Info className="w-4 h-4" />
                  <span className="font-medium">Privacy Notice</span>
                </div>
                <p className="text-blue-700 text-sm">
                  Changes to your privacy settings will take effect immediately. Some settings may affect 
                  the functionality of our services. Essential cookies cannot be disabled as they are 
                  required for the platform to work.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                How We Use Your Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dataCategories.map((category, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">{category.category}</h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Data Points Collected:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {category.dataPoints.map((point, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium mb-1">Purpose:</h4>
                          <p className="text-sm text-gray-600">{category.usage}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Retention Period:</h4>
                          <p className="text-sm text-gray-600">{category.retention}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Shared With:</h4>
                          <div className="flex flex-wrap gap-1">
                            {category.thirdParties.map((party, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {party}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="your-rights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Your Data Protection Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {yourRights.map((right, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <right.icon className="w-6 h-6 text-blue-600" />
                      <h3 className="font-semibold">{right.right}</h3>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">{right.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      {right.action}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Important Notice</span>
                </div>
                <p className="text-yellow-700 text-sm">
                  To exercise any of these rights, please contact our Data Protection Officer at 
                  <span className="font-medium"> privacy@lsrlogistics.com</span>. We will respond to your 
                  request within 30 days as required by GDPR.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cookies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="w-5 h-5" />
                Cookie Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Essential Cookies</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Required for the website to function. Cannot be disabled.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status: Always Active</span>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Required</Badge>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Analytics Cookies</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Help us understand how you use our website to improve your experience.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Google Analytics, Hotjar</span>
                    <Switch 
                      checked={privacySettings.analytics}
                      onCheckedChange={(value) => handleSettingChange('analytics', value)}
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Marketing Cookies</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Used to deliver personalized advertisements and track marketing effectiveness.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Facebook Pixel, Google Ads</span>
                    <Switch 
                      checked={privacySettings.marketing}
                      onCheckedChange={(value) => handleSettingChange('marketing', value)}
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Functional Cookies</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Remember your preferences and settings to provide a personalized experience.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User preferences, language settings</span>
                    <Switch 
                      checked={privacySettings.functional}
                      onCheckedChange={(value) => handleSettingChange('functional', value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button>Accept All Cookies</Button>
                <Button variant="outline">Reject Optional Cookies</Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Cookie Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Privacy Policies & Legal Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Privacy Policy</h3>
                      <p className="text-sm text-gray-600">
                        Comprehensive overview of how we collect, use, and protect your data
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Last updated: January 15, 2024</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Terms of Service</h3>
                      <p className="text-sm text-gray-600">
                        Legal agreement between you and LSR Logistics for using our services
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Last updated: January 10, 2024</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Cookie Policy</h3>
                      <p className="text-sm text-gray-600">
                        Detailed information about cookies and similar technologies we use
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Last updated: January 5, 2024</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Data Retention Policy</h3>
                      <p className="text-sm text-gray-600">
                        How long we keep your data and our deletion procedures
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Last updated: December 20, 2023</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Contact Our Data Protection Officer</h3>
                <p className="text-sm text-gray-600 mb-3">
                  If you have any questions about your data protection rights or our privacy practices, 
                  please contact our Data Protection Officer.
                </p>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Email:</span> privacy@lsrlogistics.com</p>
                  <p><span className="font-medium">Phone:</span> +44 20 1234 5678</p>
                  <p><span className="font-medium">Address:</span> LSR Logistics, Data Protection Office, London, UK</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataProtection;

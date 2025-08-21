import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Smartphone, 
  CheckCircle, 
  ArrowRight, 
  Wifi, 
  WifiOff,
  Touchscreen,
  Smartphone as PhoneIcon
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const SimulatorTest: React.FC = () => {
  const isMobile = useIsMobile();
  const isOnline = navigator.onLine;

  const testFeatures = [
    {
      title: 'Mobile Settings',
      description: 'Test the mobile-optimized settings page',
      icon: Settings,
      path: '/settings',
      status: 'ready'
    },
    {
      title: 'Enhanced Navigation',
      description: 'Test the animated mobile navigation with red vehicle check',
      icon: PhoneIcon,
      path: '/driver-dashboard',
      status: 'ready'
    },
    {
      title: 'Mobile Layout',
      description: 'Test mobile-optimized layout and touch interactions',
      icon: Touchscreen,
      path: '/driver-jobs',
      status: 'ready'
    },
    {
      title: 'Vehicle Check',
      description: 'Test the red-branded vehicle check functionality',
      icon: CheckCircle,
      path: '/driver/vehicle-checks',
      status: 'ready'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <PhoneIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">iPhone Simulator Test</h1>
          </div>
          <p className="text-gray-600">
            Test the mobile-optimized features of your LSR app
          </p>
          
          {/* Status Indicators */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              {isMobile ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {isMobile ? 'Mobile Detected' : 'Desktop Mode'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Test Features */}
        <div className="space-y-4">
          {testFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {feature.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link to={feature.path}>
                    <Button className="w-full" size="sm">
                      Test Feature
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/settings">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Open Settings
              </Button>
            </Link>
            
            <Link to="/driver-dashboard">
              <Button variant="outline" className="w-full justify-start">
                <PhoneIcon className="w-4 h-4 mr-2" />
                Driver Dashboard
              </Button>
            </Link>
            
            <Link to="/driver/vehicle-checks">
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="w-4 h-4 mr-2" />
                Vehicle Check
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-800">
            <p>1. <strong>Settings Test:</strong> Tap "Open Settings" to test the mobile-optimized settings page</p>
            <p>2. <strong>Navigation Test:</strong> Navigate to any page to see the enhanced bottom navigation</p>
            <p>3. <strong>Vehicle Check:</strong> Test the red-branded vehicle check icon</p>
            <p>4. <strong>Touch Interactions:</strong> Test touch-friendly buttons and cards</p>
            <p>5. <strong>Responsive Design:</strong> Rotate the simulator to test landscape mode</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimulatorTest;


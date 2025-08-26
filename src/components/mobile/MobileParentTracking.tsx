import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Clock, 
  Navigation,
  Home,
  CheckCircle,
  AlertCircle,
  Phone,
  MessageSquare,
  RefreshCw,
  Loader2,
  Car,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useParentData, type Child } from '@/hooks/useParentData';
import ResponsiveScaffold from './ResponsiveScaffold';

const MobileParentTracking = () => {
  const { user, profile } = useAuth();
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    children,
    isLoading,
    childrenError,
    refreshAllData
  } = useParentData();

  const typedChildren = children as Child[];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAllData();
    setIsRefreshing(false);
  };

  const getStatusColor = (status: 'on_route' | 'at_school' | 'at_home' | 'pickup_scheduled') => {
    switch (status) {
      case 'on_route': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'at_school': return 'bg-green-100 text-green-800 border-green-200';
      case 'at_home': return 'bg-muted text-muted-foreground border-border';
      case 'pickup_scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: 'on_route' | 'at_school' | 'at_home' | 'pickup_scheduled') => {
    switch (status) {
      case 'on_route': return <Navigation className="w-4 h-4" />;
      case 'at_school': return <CheckCircle className="w-4 h-4" />;
      case 'at_home': return <Home className="w-4 h-4" />;
      case 'pickup_scheduled': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getEstimatedTime = (status: string) => {
    switch (status) {
      case 'on_route': return '~15 min';
      case 'pickup_scheduled': return '~5 min';
      default: return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <ResponsiveScaffold>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 mobile-text-responsive">Loading tracking data...</p>
          </div>
        </div>
      </ResponsiveScaffold>
    );
  }

  if (childrenError) {
    return (
      <ResponsiveScaffold>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600 mobile-text-responsive">Failed to load tracking data.</p>
            <Button onClick={handleRefresh} className="mt-4 mobile-button">
              Retry
            </Button>
          </div>
        </div>
      </ResponsiveScaffold>
    );
  }

  return (
    <ResponsiveScaffold
      className="bg-gradient-to-br from-violet-50 via-blue-50 via-cyan-50 via-emerald-50 to-teal-50 relative overflow-hidden"
      scrollable={true}
      padding="medium"
    >
      {/* Animated background elements to match landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '6s' }}></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>
              {/* Header */}
        <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mobile-text-xl">Live Tracking</h1>
            <p className="text-gray-600 mobile-text-responsive">
              Track your children in real-time
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="mobile-button"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Map Placeholder */}
        <Card className="mobile-card">
          <CardContent className="p-4">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600 mobile-text-responsive">Map View</p>
                <p className="text-sm text-gray-500">Real-time location tracking</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children Tracking List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mobile-text-large">Children Status</h2>
        <div className="space-y-3">
          {typedChildren.map((child) => (
            <Card 
              key={child.id} 
              className={`mobile-card cursor-pointer transition-all duration-200 ${
                selectedChild === child.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedChild(child.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mobile-text-responsive">{child.name}</p>
                      <p className="text-sm text-gray-600">{child.school}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Car className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Vehicle #123</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(child.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(child.status)}
                        <span className="text-xs">{child.status.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      ETA: {getEstimatedTime(child.status)}
                    </p>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedChild === child.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Current Location</p>
                        <p className="text-sm font-medium">Main Street & 5th Ave</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Speed</p>
                        <p className="text-sm font-medium">25 mph</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 mobile-button"
                        onClick={() => window.open('tel:+1234567890')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Driver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 mobile-button"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Route Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mobile-text-large">Route Information</h2>
        <Card className="mobile-card">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium mobile-text-responsive">Pickup Time</span>
                </div>
                <span className="text-sm text-gray-600">7:30 AM</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium mobile-text-responsive">Drop-off Time</span>
                </div>
                <span className="text-sm text-gray-600">8:15 AM</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <span className="font-medium mobile-text-responsive">Route Distance</span>
                </div>
                <span className="text-sm text-gray-600">3.2 miles</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mobile-text-large">Emergency Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1 mobile-button border-red-200 text-red-700"
            onClick={() => window.open('tel:+1234567890')}
          >
            <Phone className="w-6 h-6" />
            <span className="text-sm">Emergency Call</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1 mobile-button"
          >
            <AlertCircle className="w-6 h-6" />
            <span className="text-sm">Report Issue</span>
          </Button>
        </div>
      </div>

      {/* Driver Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mobile-text-large">Driver Information</h2>
        <Card className="mobile-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium mobile-text-responsive">John Smith</p>
                <p className="text-sm text-gray-600">Licensed Driver</p>
                <p className="text-xs text-gray-500">ID: DRV-2024-001</p>
              </div>
              <div className="text-right">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Available
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveScaffold>
  );
};

export default MobileParentTracking;

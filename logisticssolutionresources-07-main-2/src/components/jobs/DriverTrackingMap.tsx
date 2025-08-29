
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Settings, ExternalLink } from 'lucide-react';
import GoogleMap from '@/components/GoogleMap';

interface DriverMarker {
  position: { lat: number; lng: number };
  title: string;
  type: 'driver';
}

interface DriverTrackingMapProps {
  driverMarkers: DriverMarker[];
}

const DriverTrackingMap = ({ driverMarkers }: DriverTrackingMapProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('googleMapsApiKey', apiKey);
      setIsConfigured(true);
    }
  };

  const savedApiKey = localStorage.getItem('googleMapsApiKey');
  const hasApiKey = savedApiKey || isConfigured;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span>Live Driver Tracking</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasApiKey ? (
          <div className="space-y-4">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                Configure your Google Maps API key to enable live driver tracking.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="apiKey" className="text-sm font-medium text-gray-700">
                  Google Maps API Key
                </label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Google Maps API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Button 
                  onClick={handleSaveApiKey}
                  disabled={!apiKey.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save API Key
                </Button>
                
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <span>Get your API key from Google Cloud Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  Tracking {driverMarkers.length} active driver{driverMarkers.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('googleMapsApiKey');
                  setIsConfigured(false);
                  setApiKey('');
                }}
              >
                <Settings className="w-3 h-3 mr-1" />
                Reconfigure
              </Button>
            </div>
            
            <div className="h-96 w-full rounded-lg overflow-hidden border">
              <GoogleMap
                center={{ lat: -25.7479, lng: 28.2293 }}
                zoom={12}
                markers={driverMarkers}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverTrackingMap;

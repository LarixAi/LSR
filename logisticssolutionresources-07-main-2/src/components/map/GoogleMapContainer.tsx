
import React, { useEffect, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import MapStatus from './MapStatus';

interface GoogleMapContainerProps {
  apiKey?: string;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  markers?: Array<{
    position: google.maps.LatLngLiteral;
    title: string;
    type?: 'driver' | 'route' | 'stop';
  }>;
  routes?: Array<{
    path: google.maps.LatLngLiteral[];
    color?: string;
  }>;
  title?: string;
  showApiKeyInput?: boolean;
}

const GoogleMapContainer: React.FC<GoogleMapContainerProps> = ({ 
  apiKey = '', 
  center = { lat: -25.7479, lng: 28.2293 }, 
  zoom = 10, 
  markers = [], 
  routes = [],
  title = "Map View",
  showApiKeyInput = false
}) => {
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        // Try to get the API key from Supabase edge function
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        
        if (data?.apiKey) {
          setLocalApiKey(data.apiKey);
        } else {
          console.log('No API key found in Supabase secrets, falling back to local storage');
          const storedKey = localStorage.getItem('google_maps_api_key');
          if (storedKey) {
            setLocalApiKey(storedKey);
          }
        }
      } catch (error) {
        console.log('Error fetching API key from Supabase, using local storage fallback');
        const storedKey = localStorage.getItem('google_maps_api_key');
        if (storedKey) {
          setLocalApiKey(storedKey);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!localApiKey) {
      fetchApiKey();
    } else {
      setIsLoading(false);
    }
  }, [localApiKey]);

  const handleApiKeyChange = (value: string) => {
    setLocalApiKey(value);
    localStorage.setItem('google_maps_api_key', value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="w-5 h-5" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading map configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showApiKeyInput && !localApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">Google Maps API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Google Maps API key"
                value={localApiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Get your API key from{' '}
                <a 
                  href="https://console.cloud.google.com/google/maps-apis" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google Cloud Console
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!localApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Google Maps API key required</p>
              <p className="text-sm text-gray-500">Configure your API key to view the map</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Navigation className="w-5 h-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Wrapper
          apiKey={localApiKey}
          render={(status) => (
            <MapStatus 
              status={status}
              center={center} 
              zoom={zoom} 
              markers={markers} 
              routes={routes}
            />
          )}
        />
      </CardContent>
    </Card>
  );
};

export default GoogleMapContainer;

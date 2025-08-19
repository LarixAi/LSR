
import React from 'react';
import { Status } from '@googlemaps/react-wrapper';
import { MapPin } from 'lucide-react';
import MapComponent from './MapComponent';

interface MapStatusProps {
  status: Status;
  center: google.maps.LatLngLiteral;
  zoom: number;
  markers?: Array<{
    position: google.maps.LatLngLiteral;
    title: string;
    type?: 'driver' | 'route' | 'stop';
  }>;
  routes?: Array<{
    path: google.maps.LatLngLiteral[];
    color?: string;
  }>;
}

const MapStatus: React.FC<MapStatusProps> = ({ status, center, zoom, markers, routes }) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading map...</span>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Failed to load map</p>
            <p className="text-sm text-gray-500">Please check your Google Maps API key</p>
          </div>
        </div>
      );
    case Status.SUCCESS:
      return <MapComponent center={center} zoom={zoom} markers={markers} routes={routes} />;
    default:
      return null;
  }
};

export default MapStatus;

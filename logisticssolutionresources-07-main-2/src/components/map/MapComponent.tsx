
import React, { useEffect, useRef, useState } from 'react';

interface MapComponentProps {
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

const MapComponent: React.FC<MapComponentProps> = ({ center, zoom, markers = [], routes = [] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });
      setMap(newMap);
    }
  }, [ref, map, center, zoom]);

  useEffect(() => {
    if (map) {
      // Clear existing markers and routes
      // Add markers
      markers.forEach(marker => {
        const mapMarker = new google.maps.Marker({
          position: marker.position,
          map,
          title: marker.title,
          icon: marker.type === 'driver' ? {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#22c55e" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24)
          } : undefined
        });
      });

      // Add routes
      routes.forEach(route => {
        new google.maps.Polyline({
          path: route.path,
          geodesic: true,
          strokeColor: route.color || '#3b82f6',
          strokeOpacity: 1.0,
          strokeWeight: 3,
          map
        });
      });
    }
  }, [map, markers, routes]);

  return <div ref={ref} className="w-full h-full min-h-[400px] rounded-lg" />;
};

export default MapComponent;

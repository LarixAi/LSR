
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Heart, Train, Car, FileText, MapPin } from 'lucide-react';
import type { JobType } from './types';

interface JobTypeSelectorProps {
  onSelectJobType: (jobType: JobType) => void;
}

const jobTypes: JobType[] = [
  {
    id: 'airport',
    name: 'Airport Run',
    description: 'Transport to/from airport with flight details',
    icon: 'plane',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    fields: [
      { name: 'flightNumber', label: 'Flight Number', type: 'text', placeholder: 'e.g., BA123' },
      { name: 'terminal', label: 'Terminal', type: 'select', options: ['Terminal 1', 'Terminal 2', 'Terminal 3', 'Terminal 4'] },
      { name: 'pickupLocation', label: 'Pickup Location', type: 'text', required: true },
      { name: 'dropoffLocation', label: 'Drop-off Location', type: 'text', required: true },
      { name: 'passengers', label: 'Number of Passengers', type: 'number', required: true },
      { name: 'luggage', label: 'Luggage Details', type: 'textarea', placeholder: 'Number and type of bags' },
      { name: 'meetAndGreet', label: 'Meet & Greet Service', type: 'checkbox' },
    ]
  },
  {
    id: 'wedding',
    name: 'Wedding',
    description: 'Wedding transportation with special requirements',
    icon: 'heart',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    fields: [
      { name: 'venue', label: 'Wedding Venue', type: 'text', required: true },
      { name: 'ceremonyTime', label: 'Ceremony Time', type: 'time', required: true },
      { name: 'pickupLocations', label: 'Pickup Locations', type: 'textarea', required: true, placeholder: 'List all pickup points' },
      { name: 'guestCount', label: 'Number of Guests', type: 'number', required: true },
      { name: 'specialRequests', label: 'Special Requests', type: 'textarea', placeholder: 'Decorations, music, etc.' },
      { name: 'contactPerson', label: 'Wedding Coordinator', type: 'text' },
      { name: 'contactPhone', label: 'Coordinator Phone', type: 'text' },
    ]
  },
  {
    id: 'rail-replacement',
    name: 'Rail Replacement',
    description: 'Bus service replacing train routes',
    icon: 'train',
    color: 'bg-green-100 text-green-800 border-green-200',
    fields: [
      { name: 'trainLine', label: 'Train Line', type: 'text', required: true },
      { name: 'affectedStations', label: 'Affected Stations', type: 'textarea', required: true },
      { name: 'replacementRoute', label: 'Replacement Route', type: 'textarea', required: true },
      { name: 'frequency', label: 'Service Frequency', type: 'select', options: ['Every 15 mins', 'Every 30 mins', 'Every hour', 'Other'] },
      { name: 'ticketValidity', label: 'Valid Train Tickets', type: 'checkbox' },
      { name: 'duration', label: 'Service Duration', type: 'text', placeholder: 'e.g., All weekend' },
    ]
  },
  {
    id: 'private-hire',
    name: 'Private Hire',
    description: 'Custom private transportation service',
    icon: 'car',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    fields: [
      { name: 'clientName', label: 'Client Name', type: 'text', required: true },
      { name: 'clientPhone', label: 'Client Phone', type: 'text', required: true },
      { name: 'pickupAddress', label: 'Pickup Address', type: 'text', required: true },
      { name: 'destination', label: 'Destination', type: 'text', required: true },
      { name: 'stops', label: 'Additional Stops', type: 'textarea', placeholder: 'List any stops along the way' },
      { name: 'passengers', label: 'Number of Passengers', type: 'number', required: true },
      { name: 'vehiclePreference', label: 'Vehicle Preference', type: 'select', options: ['Any', 'Standard Car', 'Executive Car', 'Minibus', 'Coach'] },
      { name: 'specialRequirements', label: 'Special Requirements', type: 'textarea' },
    ]
  },
  {
    id: 'manual',
    name: 'Manual Entry',
    description: 'Create a custom job with flexible options',
    icon: 'file-text',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    fields: [
      { name: 'customTitle', label: 'Job Title', type: 'text', required: true },
      { name: 'jobCategory', label: 'Category', type: 'select', options: ['Transport', 'Delivery', 'Event', 'Emergency', 'Other'] },
      { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'] },
      { name: 'clientContact', label: 'Client Contact', type: 'text' },
      { name: 'locationDetails', label: 'Location Details', type: 'textarea', required: true },
      { name: 'requirements', label: 'Special Requirements', type: 'textarea' },
      { name: 'estimatedDuration', label: 'Estimated Duration (hours)', type: 'number' },
    ]
  }
];

const iconMap = {
  plane: Plane,
  heart: Heart,
  train: Train,
  car: Car,
  'file-text': FileText,
  'map-pin': MapPin,
};

const JobTypeSelector = ({ onSelectJobType }: JobTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {jobTypes.map((jobType) => {
        const IconComponent = iconMap[jobType.icon as keyof typeof iconMap];
        return (
          <Card 
            key={jobType.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2"
            onClick={() => onSelectJobType(jobType)}
          >
            <CardHeader className="text-center pb-4">
              <div className={`w-16 h-16 rounded-full ${jobType.color} flex items-center justify-center mx-auto mb-3`}>
                <IconComponent className="w-8 h-8" />
              </div>
              <CardTitle className="text-lg">{jobType.name}</CardTitle>
              <CardDescription className="text-sm">
                {jobType.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-gray-500">
                Click to configure this job type
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default JobTypeSelector;

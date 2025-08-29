
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, MapPin, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MockRoute {
  id: string;
  name: string;
  transport_company: string;
  route_number: string;
  is_active: boolean;
}

const ParentBookingRequest = () => {
  const [selectedRoute, setSelectedRoute] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: availableRoutes } = useQuery({
    queryKey: ['available-routes'],
    queryFn: async () => {
      console.log('Fetching available routes');
      
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching routes:', error);
        return [];
      }

      return data || [];
    }
  });

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Mock booking request submitted:', {
        selectedRoute,
        requestDate,
        pickupLocation,
        dropoffLocation,
        specialRequests
      });

      toast({
        title: "Booking Request Submitted",
        description: "Your transport booking request has been submitted for review.",
      });

      // Reset form
      setSelectedRoute('');
      setRequestDate('');
      setPickupLocation('');
      setDropoffLocation('');
      setSpecialRequests('');
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span>Request Transport Booking</span>
        </CardTitle>
        <CardDescription>
          Submit a request for transport services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="route">Preferred Route</Label>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a route" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoutes?.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Request Date</Label>
              <Input
                id="date"
                type="date"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickup">Pickup Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="pickup"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Enter pickup address"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dropoff">Drop-off Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="dropoff"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  placeholder="Enter drop-off address"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requests">Special Requests or Notes</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <Textarea
                id="requests"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requirements, accessibility needs, or additional information..."
                className="pl-10"
                rows={3}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Important Information</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Booking requests are subject to availability and approval</li>
              <li>• You will receive confirmation within 24 hours</li>
              <li>• Special requirements may affect pricing</li>
              <li>• Cancellations must be made at least 24 hours in advance</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !requestDate || !pickupLocation || !dropoffLocation}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ParentBookingRequest;

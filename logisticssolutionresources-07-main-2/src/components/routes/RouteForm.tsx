
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface RouteFormData {
  name: string;
  description: string;
  start_location: string;
  end_location: string;
  estimated_duration: string;
  distance_km: string;
}

interface RouteFormProps {
  showForm: boolean;
  onCancel: () => void;
}

const RouteForm: React.FC<RouteFormProps> = ({ showForm, onCancel }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<RouteFormData>({
    name: '',
    description: '',
    start_location: '',
    end_location: '',
    estimated_duration: '',
    distance_km: ''
  });

  const createRouteMutation = useMutation({
    mutationFn: async (routeData: RouteFormData) => {
      console.log('Mock: Creating route with data:', routeData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRoute = {
        id: `route-${Date.now()}`,
        name: routeData.name,
        description: routeData.description,
        start_location: routeData.start_location,
        end_location: routeData.end_location,
        estimated_duration: routeData.estimated_duration ? parseInt(routeData.estimated_duration) : null,
        distance_km: routeData.distance_km ? parseFloat(routeData.distance_km) : null
      };
      
      console.log('Mock route created:', mockRoute);
      return mockRoute;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      onCancel();
      setFormData({
        name: '',
        description: '',
        start_location: '',
        end_location: '',
        estimated_duration: '',
        distance_km: ''
      });
      toast({
        title: "Route Created",
        description: "The new route has been successfully created.",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRouteMutation.mutate(formData);
  };

  if (!showForm) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Create New Route</CardTitle>
        <CardDescription>Add a new transport route to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Route Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="estimated_duration">Duration (minutes)</Label>
              <Input
                id="estimated_duration"
                type="number"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({...formData, estimated_duration: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_location">Start Location</Label>
              <Input
                id="start_location"
                value={formData.start_location}
                onChange={(e) => setFormData({...formData, start_location: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_location">End Location</Label>
              <Input
                id="end_location"
                value={formData.end_location}
                onChange={(e) => setFormData({...formData, end_location: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="distance_km">Distance (km)</Label>
            <Input
              id="distance_km"
              type="number"
              step="0.1"
              value={formData.distance_km}
              onChange={(e) => setFormData({...formData, distance_km: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={createRouteMutation.isPending}>
              {createRouteMutation.isPending ? 'Creating...' : 'Create Route'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RouteForm;


import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Users, MapPin, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MockRoute {
  id: string;
  name: string;
  transport_company: string;
  route_number: string;
  is_active: boolean;
}

const TransportRegistrationForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    grade: '',
    school: '',
    homeAddress: '',
    pickupLocation: '',
    transportCompany: '',
    routeNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
    medicalConditions: '',
    specialInstructions: ''
  });

  // Fetch available transport companies and routes
  const { data: transportOptions } = useQuery({
    queryKey: ['transport-options'],
    queryFn: async () => {
      console.log('Fetching transport options');
      
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching routes:', error);
        return { companies: [], routes: [] };
      }

      const routes = data || [];
      const companies = [...new Set(routes.map(r => r.name || 'Unknown'))];
      return { companies, routes };
    }
  });

  const registerChildMutation = useMutation({
    mutationFn: async () => {
      console.log('Registering child for transport:', formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Find the selected route
      const selectedRoute = transportOptions?.routes.find(
        r => r.name === formData.transportCompany
      );

      const mockChildData = {
        parent_id: user?.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth || null,
        grade: formData.grade,
        school: formData.school,
        pickup_location: formData.pickupLocation,
        dropoff_location: formData.school,
        transport_company: formData.transportCompany,
        route_number: formData.routeNumber,
        route_id: selectedRoute?.id || null,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_phone: formData.emergencyContactPhone,
        allergies: formData.allergies || null,
        medical_conditions: formData.medicalConditions || null,
        special_instructions: formData.specialInstructions || null
      };

      console.log('Mock child registration data created:', mockChildData);
      
      return mockChildData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-profiles'] });
      toast({
        title: "Registration Successful",
        description: "Your child has been registered for transport services.",
      });
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        grade: '',
        school: '',
        homeAddress: '',
        pickupLocation: '',
        transportCompany: '',
        routeNumber: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        allergies: '',
        medicalConditions: '',
        specialInstructions: ''
      });
    },
    onError: (error) => {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register child. Please try again.",
        variant: "destructive",
      });
    }
  });

  const availableRoutes = transportOptions?.routes.filter(
    r => r.name === formData.transportCompany
  ) || [];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-xl">
          <Users className="w-6 h-6 text-primary" />
          <span>Register Child for Transport</span>
        </CardTitle>
        <CardDescription>Complete this form to register your child for school transport services</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); registerChildMutation.mutate(); }} className="space-y-6">
          {/* Child Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Child Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                  placeholder="e.g., Grade 7, Form 1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="school">School Name *</Label>
                <Input
                  id="school"
                  value={formData.school}
                  onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Transport Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Transport Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transportCompany">Transport Company *</Label>
                <Select 
                  value={formData.transportCompany} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, transportCompany: value, routeNumber: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transport company" />
                  </SelectTrigger>
                  <SelectContent>
                    {transportOptions?.companies.map((company) => (
                      <SelectItem key={String(company)} value={String(company)}>
                        {String(company)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="routeNumber">Route Number *</Label>
                <Select 
                  value={formData.routeNumber} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, routeNumber: value }))}
                  disabled={!formData.transportCompany}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select route number" />
                  </SelectTrigger>
                  <SelectContent>
                     {availableRoutes.map((route) => (
                       <SelectItem key={route.id} value={route.id}>
                         {route.name}
                       </SelectItem>
                     ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="homeAddress">Home Address *</Label>
                <Input
                  id="homeAddress"
                  value={formData.homeAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, homeAddress: e.target.value }))}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="pickupLocation">Pickup Location *</Label>
                <Input
                  id="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                  placeholder="Specific pickup point or landmark"
                  required
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Emergency Contact</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                  placeholder="List any allergies"
                />
              </div>
              <div>
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData(prev => ({ ...prev, medicalConditions: e.target.value }))}
                  placeholder="List any medical conditions the driver should be aware of"
                />
              </div>
              <div>
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="Any special instructions for the driver"
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={registerChildMutation.isPending}
            className="w-full"
          >
            {registerChildMutation.isPending ? 'Registering...' : 'Register Child for Transport'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransportRegistrationForm;

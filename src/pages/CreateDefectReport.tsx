import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import DefaultViewPageLayout from '@/components/layout/DefaultViewPageLayout';
import { AlertTriangle, Wrench, Shield, Zap, Car, Save, Loader2 } from 'lucide-react';

const CreateDefectReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const { selectedOrganizationId } = useOrganization();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    defect_type: 'mechanical' as 'safety' | 'mechanical' | 'electrical' | 'cosmetic' | 'other',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    location: '',
    estimated_cost: 0,
    vehicle_id: '',
    additional_notes: ''
  });

  // Determine which organization ID to use for queries
  const organizationIdToUse = profile?.role === 'mechanic' ? selectedOrganizationId : profile?.organization_id;

  // Fetch vehicles for dropdown
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', organizationIdToUse],
    queryFn: async () => {
      if (!organizationIdToUse) return [];
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model, registration_number')
        .eq('organization_id', organizationIdToUse)
        .order('make');
      
      if (error) {
        console.error('Error fetching vehicles:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!organizationIdToUse,
  });

  const createDefectMutation = useMutation({
    mutationFn: async (defectData: any) => {
      if (!organizationIdToUse) {
        throw new Error('Organization not selected');
      }

      const { data, error } = await supabase
        .from('defect_reports')
        .insert([{
          title: defectData.title,
          description: defectData.description,
          defect_type: defectData.defect_type,
          severity: defectData.severity,
          location: defectData.location,
          estimated_cost: defectData.estimated_cost,
          vehicle_id: defectData.vehicle_id,
          additional_notes: defectData.additional_notes,
          organization_id: organizationIdToUse,
          reported_by: profile?.id,
          status: 'reported',
          defect_date: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Failed to create defect report');
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Defect Report Created',
        description: 'The defect report has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['combined-defects'] });
      navigate('/defect-reports');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Defect Report',
        description: error.message || 'Failed to create defect report.',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    await createDefectMutation.mutateAsync(formData);
  };

  const navigationItems = [
    { id: 'basic-info', label: 'Basic Information' },
    { id: 'details', label: 'Defect Details' },
    { id: 'vehicle', label: 'Vehicle Information' },
    { id: 'costs', label: 'Costs & Notes' }
  ];

  const getDefectTypeIcon = (type: string) => {
    switch (type) {
      case 'safety': return <Shield className="w-4 h-4" />;
      case 'mechanical': return <Wrench className="w-4 h-4" />;
      case 'electrical': return <Zap className="w-4 h-4" />;
      case 'cosmetic': return <Car className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <DefaultViewPageLayout
      title="Create Defect Report"
      subtitle="Report a new vehicle defect or issue"
      backUrl="/defect-reports"
      backLabel="Back to Defect Reports"
      navigationItems={navigationItems}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card id="basic-info">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief description of the defect"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the defect"
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Defect Details */}
        <Card id="details">
          <CardHeader>
            <CardTitle>Defect Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="defect_type">Type</Label>
                <Select
                  value={formData.defect_type}
                  onValueChange={(value: any) => setFormData({ ...formData, defect_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="mechanical">Mechanical</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="cosmetic">Cosmetic</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Where the defect is located"
              />
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card id="vehicle">
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="vehicle_id">Vehicle</Label>
              <Select
                value={formData.vehicle_id}
                onValueChange={(value: string) => setFormData({ ...formData, vehicle_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} - {vehicle.registration_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Costs & Notes */}
        <Card id="costs">
          <CardHeader>
            <CardTitle>Costs & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="estimated_cost">Estimated Cost</Label>
              <Input
                id="estimated_cost"
                type="number"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <Label htmlFor="additional_notes">Additional Notes</Label>
              <Textarea
                id="additional_notes"
                value={formData.additional_notes}
                onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                placeholder="Any additional information or context"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Defect report will be created and assigned to your organization</span>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/defect-reports')}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createDefectMutation.isPending}>
                {createDefectMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Report...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </DefaultViewPageLayout>
  );
};

export default CreateDefectReport;

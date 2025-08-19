
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building, Plus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrganizationSelectorProps {
  onOrganizationSelected: (organizationId: string) => void;
  userRole?: string;
}

const OrganizationSelector = ({ onOrganizationSelected, userRole = 'driver' }: OrganizationSelectorProps) => {
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgEmail, setNewOrgEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available organizations (for joining)
  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations-public'],
    queryFn: async () => {
      console.log('Fetching organizations...');
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, email')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching organizations:', error);
        throw error;
      }
      console.log('Fetched organizations:', data);
      return data || [];
    }
  });

  // Create new organization mutation
  const createOrganization = useMutation({
    mutationFn: async (orgData: { name: string; contact_email: string }) => {
      console.log('Creating organization with data:', orgData);
      
      // Generate a unique slug
      const slug = orgData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();

      const organizationData = {
        name: orgData.name,
        email: orgData.contact_email,
        is_active: true
      };

      console.log('Inserting organization:', organizationData);

      const { data, error } = await supabase
        .from('organizations')
        .insert([organizationData])
        .select()
        .single();

      if (error) {
        console.error('Error creating organization:', error);
        throw new Error(`Failed to create organization: ${error.message}`);
      }
      
      console.log('Organization created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Organization creation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['organizations-public'] });
      onOrganizationSelected(data.id);
      toast({
        title: "Organization Created",
        description: `${data.name} has been created successfully.`,
      });
    },
    onError: (error) => {
      console.error('Organization creation failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create organization. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async () => {
    console.log('Submit clicked, mode:', mode);
    setIsLoading(true);
    
    try {
      if (mode === 'join') {
        if (!selectedOrgId) {
          toast({
            title: "Selection Required",
            description: "Please select an organization to join.",
            variant: "destructive",
          });
          return;
        }
        console.log('Joining organization:', selectedOrgId);
        onOrganizationSelected(selectedOrgId);
      } else {
        if (!newOrgName.trim() || !newOrgEmail.trim()) {
          toast({
            title: "Required Fields",
            description: "Please fill in all required fields.",
            variant: "destructive",
          });
          return;
        }
        
        console.log('Creating new organization:', { name: newOrgName.trim(), contact_email: newOrgEmail.trim() });
        
        await createOrganization.mutateAsync({
          name: newOrgName.trim(),
          contact_email: newOrgEmail.trim()
        });
      }
    } catch (error) {
      console.error('Handle submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canCreateOrganization = userRole === 'admin' || userRole === 'council';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <Building className="w-12 h-12 mx-auto mb-4 text-blue-500" />
        <CardTitle>Organization Assignment</CardTitle>
        <CardDescription>
          {canCreateOrganization 
            ? "Join an existing organization or create a new one"
            : "Select an organization to join"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {canCreateOrganization && (
          <RadioGroup value={mode} onValueChange={(value) => setMode(value as 'join' | 'create')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="join" id="join" />
              <Label htmlFor="join">Join existing organization</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="create" id="create" />
              <Label htmlFor="create">Create new organization</Label>
            </div>
          </RadioGroup>
        )}

        {mode === 'join' ? (
          <div className="space-y-4">
            <Label>Available Organizations</Label>
            {organizations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p>No organizations available</p>
                {canCreateOrganization && (
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setMode('create')}
                  >
                    Create Organization
                  </Button>
                )}
              </div>
            ) : (
              <RadioGroup value={selectedOrgId} onValueChange={setSelectedOrgId}>
                {organizations.map((org) => (
                  <div key={org.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value={org.id} id={org.id} />
                    <Label htmlFor={org.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{org.name}</div>
                      <div className="text-sm text-gray-500">{org.email}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="org-name">Organization Name *</Label>
              <Input
                id="org-name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Enter organization name"
              />
            </div>
            <div>
              <Label htmlFor="org-email">Contact Email *</Label>
              <Input
                id="org-email"
                type="email"
                value={newOrgEmail}
                onChange={(e) => setNewOrgEmail(e.target.value)}
                placeholder="Enter contact email"
              />
            </div>
          </div>
        )}

        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || createOrganization.isPending}
          className="w-full"
        >
          {isLoading || createOrganization.isPending ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {mode === 'create' ? 'Creating...' : 'Joining...'}
            </>
          ) : (
            <>
              {mode === 'create' ? <Plus className="w-4 h-4 mr-2" /> : <Users className="w-4 h-4 mr-2" />}
              {mode === 'create' ? 'Create Organization' : 'Join Organization'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrganizationSelector;

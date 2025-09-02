import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useCreateMechanic } from '@/hooks/useMechanics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  User, 
  ArrowLeft,
  Save,
  Settings,
  FileText,
  Car,
  Users,
  Search,
  Plus,
  CheckCircle,
  X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { mechanicFormSchema, MechanicFormData } from '@/components/mechanics/forms/mechanicFormSchema';
import DefaultViewPageLayout from '@/components/layout/DefaultViewPageLayout';
import { supabase } from '@/integrations/supabase/client';

const AddMechanic = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { selectedOrganizationId } = useOrganization();
  const createMechanic = useCreateMechanic();
  
  // State for mechanic search
  const [searchTerm, setSearchTerm] = useState('');
  const [allMechanics, setAllMechanics] = useState<any[]>([]);
  const [filteredMechanics, setFilteredMechanics] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState<any>(null);

  // Fetch all mechanics who have signed up to the app
  useEffect(() => {
    const fetchAllMechanics = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, phone, role, organization_id')
          .eq('role', 'mechanic')
          .order('first_name', { ascending: true });

        if (error) {
          console.error('Error fetching mechanics:', error);
          return;
        }

        setAllMechanics(data || []);
        setFilteredMechanics(data || []);
      } catch (error) {
        console.error('Error fetching mechanics:', error);
      }
    };

    fetchAllMechanics();
  }, []);

  // Filter mechanics based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMechanics(allMechanics);
      return;
    }

    const filtered = allMechanics.filter(mechanic => {
      const searchLower = searchTerm.toLowerCase();
      return (
        mechanic.first_name?.toLowerCase().includes(searchLower) ||
        mechanic.last_name?.toLowerCase().includes(searchLower) ||
        mechanic.email?.toLowerCase().includes(searchLower) ||
        mechanic.phone?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredMechanics(filtered);
  }, [searchTerm, allMechanics]);

  // Handle mechanic selection
  const handleMechanicSelect = (mechanic: any) => {
    setSelectedMechanic(mechanic);
    form.setValue('profile_id', mechanic.id);
    setSearchTerm(`${mechanic.first_name} ${mechanic.last_name}`);
    setIsSearching(false);
  };

  // Clear selected mechanic
  const handleClearSelection = () => {
    setSelectedMechanic(null);
    form.setValue('profile_id', '');
    setSearchTerm('');
  };

  // Handle click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setIsSearching(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const form = useForm<MechanicFormData>({
    resolver: zodResolver(mechanicFormSchema),
    defaultValues: {
      profile_id: '',
      mechanic_license_number: '',
      certification_level: '',
      hourly_rate: 0,
      specializations: '',
      is_available: true,
    },
  });

  const onSubmit = async (data: MechanicFormData) => {
    try {
      const mechanicData = {
        ...data,
        specializations: data.specializations 
          ? data.specializations.split(',').map(s => s.trim()).filter(Boolean)
          : null,
        hourly_rate: data.hourly_rate || null,
        mechanic_license_number: data.mechanic_license_number || null,
        certification_level: data.certification_level || null,
      };

      await createMechanic.mutateAsync(mechanicData);
      toast.success('Mechanic created successfully');
      navigate('/mechanics');
    } catch (error) {
      console.error('Error creating mechanic:', error);
      toast.error('Failed to create mechanic');
    }
  };

  const navigationItems = [
    {
      label: 'Mechanics',
      href: '/mechanics',
      icon: <Wrench className="w-4 h-4" />
    },
    {
      label: 'Vehicles',
      href: '/vehicles',
      icon: <Car className="w-4 h-4" />
    },
    {
      label: 'Work Orders',
      href: '/work-orders',
      icon: <FileText className="w-4 h-4" />
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <Users className="w-4 h-4" />
    }
  ];

  return (
    <DefaultViewPageLayout
      title="Add New Mechanic"
      description="Add a new mechanic to your maintenance team"
      navigationItems={navigationItems}
      backUrl="/mechanics"
      backLabel="Back to Mechanics"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Mechanic Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Search Existing Mechanics</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Search for mechanics who have already signed up to the app. 
              Found {allMechanics.length} total mechanics.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative search-container">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsSearching(true);
                    }}
                    onFocus={() => setIsSearching(true)}
                    className="pl-10"
                  />
                </div>
                {selectedMechanic && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearSelection}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {isSearching && searchTerm.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {filteredMechanics.length > 0 ? (
                    filteredMechanics.map((mechanic) => (
                      <div
                        key={mechanic.id}
                        className={`p-3 border-b border-gray-100 last:border-b-0 ${
                          mechanic.organization_id === profile?.organization_id 
                            ? 'bg-gray-50 cursor-not-allowed' 
                            : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (mechanic.organization_id !== profile?.organization_id) {
                            handleMechanicSelect(mechanic);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {mechanic.first_name} {mechanic.last_name}
                            </div>
                            <div className="text-sm text-gray-600">{mechanic.email}</div>
                            {mechanic.phone && (
                              <div className="text-sm text-gray-500">{mechanic.phone}</div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {mechanic.organization_id === profile?.organization_id ? (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                Already in Your Org
                              </Badge>
                            ) : mechanic.organization_id ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Has Organization
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Available
                              </Badge>
                            )}
                            {mechanic.organization_id !== profile?.organization_id && (
                              <Plus className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">
                      No mechanics found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              )}

              {/* Selected Mechanic Display */}
              {selectedMechanic && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-900">
                          {selectedMechanic.first_name} {selectedMechanic.last_name}
                        </div>
                        <div className="text-sm text-green-700">{selectedMechanic.email}</div>
                        {selectedMechanic.phone && (
                          <div className="text-sm text-green-600">{selectedMechanic.phone}</div>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      Selected
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profile_id">Profile ID *</Label>
                <Input
                  id="profile_id"
                  {...form.register('profile_id')}
                  placeholder="Enter profile ID"
                  required
                />
                {form.formState.errors.profile_id && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.profile_id.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="mechanic_license_number">License Number</Label>
                <Input
                  id="mechanic_license_number"
                  {...form.register('mechanic_license_number')}
                  placeholder="Enter license number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="w-5 h-5" />
              <span>Professional Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="certification_level">Certification Level</Label>
                <Select 
                  onValueChange={(value) => form.setValue('certification_level', value)}
                  defaultValue={form.watch('certification_level')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select certification level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apprentice">Apprentice</SelectItem>
                    <SelectItem value="journeyman">Journeyman</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="certified_technician">Certified Technician</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register('hourly_rate', { valueAsNumber: true })}
                  placeholder="Enter hourly rate"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="specializations">Specializations</Label>
              <Input
                id="specializations"
                {...form.register('specializations')}
                placeholder="Enter specializations (comma-separated)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Example: engine repair, brake systems, electrical systems
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Availability</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label>Available for Work</Label>
                <p className="text-sm text-gray-500">
                  Set whether this mechanic is currently available for assignments
                </p>
              </div>
              <Switch
                checked={form.watch('is_available')}
                onCheckedChange={(checked) => form.setValue('is_available', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/mechanics')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={createMechanic.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {createMechanic.isPending ? 'Creating...' : 'Create Mechanic'}
          </Button>
        </div>
      </form>
    </DefaultViewPageLayout>
  );
};

export default AddMechanic;

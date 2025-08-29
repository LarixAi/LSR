import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Car, 
  Save,
  X,
  Plus,
  Trash2,
  Edit,
  Calendar,
  Fuel,
  Gauge,
  Settings,
  DollarSign,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Building,
  Tag,
  Shield,
  Scale,
  Truck,
  Users,
  FileText,
  Camera,
  Upload
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { 
  useVehicle, 
  useUpdateVehicle, 
  useDailyRunningCosts, 
  useCreateDailyRunningCost, 
  useUpdateDailyRunningCost, 
  useDeleteDailyRunningCost,
  useTyres,
  useCreateTyre,
  useUpdateTyre,
  useDeleteTyre,
  type Vehicle,
  type DailyRunningCost,
  type Tyre
} from '@/hooks/useVehicleManagement';

// Using imported types from useVehicleManagement hook

export default function EditVehicle() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Vehicle>>({});
  
  // Modal states
  const [showAddCostModal, setShowAddCostModal] = useState(false);
  const [showAddTyreModal, setShowAddTyreModal] = useState(false);
  
  // Form states for modals
  const [costForm, setCostForm] = useState({
    date: new Date().toISOString().split('T')[0],
    fuel_cost: 0,
    maintenance_cost: 0,
    insurance_cost: 0,
    tax_cost: 0,
    depreciation_cost: 0,
    other_costs: 0,
    mileage_start: 0,
    mileage_end: 0,
    fuel_consumed: 0,
    notes: ''
  });
  
  const [tyreForm, setTyreForm] = useState({
    position: '',
    brand: '',
    model: '',
    size: '',
    load_index: '',
    speed_rating: '',
    manufacture_date: '',
    installation_date: new Date().toISOString().split('T')[0],
    tread_depth_new: 0,
    tread_depth_current: 0,
    pressure_recommended: 0,
    pressure_current: 0,
    condition: 'new' as const,
    replacement_date: '',
    cost: 0,
    notes: ''
  });

  // Data hooks
  const { data: vehicle, isLoading: loading, error: vehicleError } = useVehicle(vehicleId || '');
  const { data: dailyRunningCosts = [] } = useDailyRunningCosts(vehicleId || '');
  const { data: tyres = [] } = useTyres(vehicleId || '');
  
  // Mutation hooks
  const updateVehicleMutation = useUpdateVehicle();
  const createDailyCostMutation = useCreateDailyRunningCost();
  const updateDailyCostMutation = useUpdateDailyRunningCost();
  const deleteDailyCostMutation = useDeleteDailyRunningCost();
  const createTyreMutation = useCreateTyre();
  const updateTyreMutation = useUpdateTyre();
  const deleteTyreMutation = useDeleteTyre();

  // Initialize form data when vehicle data loads
  useEffect(() => {
    if (vehicle) {
      setFormData(vehicle);
    }
  }, [vehicle]);

  // Remove mock data function - using real backend data

  const handleInputChange = (field: keyof Vehicle, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      if (!vehicleId) {
        throw new Error('Vehicle ID is required');
      }
      
      // Update vehicle data using mutation
      await updateVehicleMutation.mutateAsync({
        vehicleId,
        updates: formData
      });
      
      // Navigate back to vehicle detail
      navigate(`/vehicles/${vehicleId}`);
    } catch (err) {
      setError('Failed to save vehicle data');
      console.error('Error saving vehicle data:', err);
    } finally {
      setSaving(false);
    }
  };

  // Modal handlers
  const handleAddDailyCost = async () => {
    try {
      if (!vehicleId) {
        throw new Error('Vehicle ID is required');
      }

      await createDailyCostMutation.mutateAsync({
        vehicle_id: vehicleId,
        ...costForm
      });

      // Reset form and close modal
      setCostForm({
        date: new Date().toISOString().split('T')[0],
        fuel_cost: 0,
        maintenance_cost: 0,
        insurance_cost: 0,
        tax_cost: 0,
        depreciation_cost: 0,
        other_costs: 0,
        mileage_start: 0,
        mileage_end: 0,
        fuel_consumed: 0,
        notes: ''
      });
      setShowAddCostModal(false);
    } catch (err) {
      setError('Failed to add daily cost');
      console.error('Error adding daily cost:', err);
    }
  };

  const handleAddTyre = async () => {
    try {
      if (!vehicleId) {
        throw new Error('Vehicle ID is required');
      }

      await createTyreMutation.mutateAsync({
        vehicle_id: vehicleId,
        ...tyreForm
      });

      // Reset form and close modal
      setTyreForm({
        position: '',
        brand: '',
        model: '',
        size: '',
        load_index: '',
        speed_rating: '',
        manufacture_date: '',
        installation_date: new Date().toISOString().split('T')[0],
        tread_depth_new: 0,
        tread_depth_current: 0,
        pressure_recommended: 0,
        pressure_current: 0,
        condition: 'new',
        replacement_date: '',
        cost: 0,
        notes: ''
      });
      setShowAddTyreModal(false);
    } catch (err) {
      setError('Failed to add tyre');
      console.error('Error adding tyre:', err);
    }
  };

  const resetCostForm = () => {
    setCostForm({
      date: new Date().toISOString().split('T')[0],
      fuel_cost: 0,
      maintenance_cost: 0,
      insurance_cost: 0,
      tax_cost: 0,
      depreciation_cost: 0,
      other_costs: 0,
      mileage_start: 0,
      mileage_end: 0,
      fuel_consumed: 0,
      notes: ''
    });
  };

  const resetTyreForm = () => {
    setTyreForm({
      position: '',
      brand: '',
      model: '',
      size: '',
      load_index: '',
      speed_rating: '',
      manufacture_date: '',
      installation_date: new Date().toISOString().split('T')[0],
      tread_depth_new: 0,
      tread_depth_current: 0,
      pressure_recommended: 0,
      pressure_current: 0,
      condition: 'new',
      replacement_date: '',
      cost: 0,
      notes: ''
    });
  };

  const getTyreConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'replace':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading vehicle data...</p>
        </div>
      </div>
    );
  }

  if (vehicleError || error || !vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{vehicleError?.message || error || 'Vehicle not found'}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/vehicles/${vehicleId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vehicle
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Vehicle</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/vehicles/${vehicleId}`)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="psv">PSV Details</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="costs">Daily Costs</TabsTrigger>
          <TabsTrigger value="tyres">Tyres</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Identification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vehicle_number">Vehicle Number</Label>
                  <Input
                    id="vehicle_number"
                    value={formData.vehicle_number || ''}
                    onChange={(e) => handleInputChange('vehicle_number', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="license_plate">License Plate</Label>
                  <Input
                    id="license_plate"
                    value={formData.license_plate || ''}
                    onChange={(e) => handleInputChange('license_plate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="vin">VIN Number</Label>
                  <Input
                    id="vin"
                    value={formData.vin || ''}
                    onChange={(e) => handleInputChange('vin', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="chassis_number">Chassis Number</Label>
                  <Input
                    id="chassis_number"
                    value={formData.chassis_number || ''}
                    onChange={(e) => handleInputChange('chassis_number', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      value={formData.make || ''}
                      onChange={(e) => handleInputChange('make', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model || ''}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year || ''}
                      onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color || ''}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type">Vehicle Type</Label>
                  <Select value={formData.type || ''} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minibus">Minibus</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="hgv">HGV</SelectItem>
                      <SelectItem value="double_decker_bus">Double Decker Bus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Seating Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity || ''}
                      onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mileage">Current Mileage</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={formData.mileage || ''}
                      onChange={(e) => handleInputChange('mileage', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PSV Details Tab */}
        <TabsContent value="psv" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>PSV Registration Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="body_type">Body Type</Label>
                  <Input
                    id="body_type"
                    value={formData.body_type || ''}
                    onChange={(e) => handleInputChange('body_type', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="manufacturer_name">Manufacturer Name</Label>
                  <Input
                    id="manufacturer_name"
                    value={formData.manufacturer_name || ''}
                    onChange={(e) => handleInputChange('manufacturer_name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="number_of_axles">Number of Axles</Label>
                    <Input
                      id="number_of_axles"
                      type="number"
                      value={formData.number_of_axles || ''}
                      onChange={(e) => handleInputChange('number_of_axles', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicle_use_code">Vehicle Use Code</Label>
                    <Input
                      id="vehicle_use_code"
                      value={formData.vehicle_use_code || ''}
                      onChange={(e) => handleInputChange('vehicle_use_code', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_registration_date">First Registration Date</Label>
                    <Input
                      id="first_registration_date"
                      type="date"
                      value={formData.first_registration_date || ''}
                      onChange={(e) => handleInputChange('first_registration_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_v5_issue_date">Last V5 Issue Date</Label>
                    <Input
                      id="last_v5_issue_date"
                      type="date"
                      value={formData.last_v5_issue_date || ''}
                      onChange={(e) => handleInputChange('last_v5_issue_date', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weights & Dimensions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="laden_weight">Laden Weight (kg)</Label>
                    <Input
                      id="laden_weight"
                      type="number"
                      value={formData.laden_weight || ''}
                      onChange={(e) => handleInputChange('laden_weight', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mam">MAM (kg)</Label>
                    <Input
                      id="mam"
                      type="number"
                      value={formData.mam || ''}
                      onChange={(e) => handleInputChange('mam', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unladen_weight">Unladen Weight (kg)</Label>
                    <Input
                      id="unladen_weight"
                      type="number"
                      value={formData.unladen_weight || ''}
                      onChange={(e) => handleInputChange('unladen_weight', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gross_vehicle_weight">Gross Vehicle Weight (kg)</Label>
                    <Input
                      id="gross_vehicle_weight"
                      type="number"
                      value={formData.gross_vehicle_weight || ''}
                      onChange={(e) => handleInputChange('gross_vehicle_weight', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="overall_length">Length (mm)</Label>
                    <Input
                      id="overall_length"
                      type="number"
                      value={formData.overall_length || ''}
                      onChange={(e) => handleInputChange('overall_length', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="overall_width">Width (mm)</Label>
                    <Input
                      id="overall_width"
                      type="number"
                      value={formData.overall_width || ''}
                      onChange={(e) => handleInputChange('overall_width', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="overall_height">Height (mm)</Label>
                    <Input
                      id="overall_height"
                      type="number"
                      value={formData.overall_height || ''}
                      onChange={(e) => handleInputChange('overall_height', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Technical Details Tab */}
        <TabsContent value="technical" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engine & Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="engine_type">Engine Type</Label>
                    <Input
                      id="engine_type"
                      value={formData.engine_type || ''}
                      onChange={(e) => handleInputChange('engine_type', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="engine_size">Engine Size</Label>
                    <Input
                      id="engine_size"
                      value={formData.engine_size || ''}
                      onChange={(e) => handleInputChange('engine_size', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transmission">Transmission</Label>
                    <Input
                      id="transmission"
                      value={formData.transmission || ''}
                      onChange={(e) => handleInputChange('transmission', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fuel_type">Fuel Type</Label>
                    <Input
                      id="fuel_type"
                      value={formData.fuel_type || ''}
                      onChange={(e) => handleInputChange('fuel_type', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fuel_tank_capacity">Fuel Tank Capacity (L)</Label>
                    <Input
                      id="fuel_tank_capacity"
                      type="number"
                      value={formData.fuel_tank_capacity || ''}
                      onChange={(e) => handleInputChange('fuel_tank_capacity', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_speed">Max Speed (mph)</Label>
                    <Input
                      id="max_speed"
                      type="number"
                      value={formData.max_speed || ''}
                      onChange={(e) => handleInputChange('max_speed', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fuel_efficiency">Fuel Efficiency (mpg)</Label>
                    <Input
                      id="fuel_efficiency"
                      type="number"
                      value={formData.fuel_efficiency || ''}
                      onChange={(e) => handleInputChange('fuel_efficiency', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="wheelbase">Wheelbase (mm)</Label>
                    <Input
                      id="wheelbase"
                      type="number"
                      value={formData.wheelbase || ''}
                      onChange={(e) => handleInputChange('wheelbase', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emissions & Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emission_standard">Emission Standard</Label>
                    <Input
                      id="emission_standard"
                      value={formData.emission_standard || ''}
                      onChange={(e) => handleInputChange('emission_standard', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="euro_emission_standard">Euro Standard</Label>
                    <Input
                      id="euro_emission_standard"
                      value={formData.euro_emission_standard || ''}
                      onChange={(e) => handleInputChange('euro_emission_standard', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="co2_emissions">CO2 Emissions (g/km)</Label>
                    <Input
                      id="co2_emissions"
                      type="number"
                      value={formData.co2_emissions || ''}
                      onChange={(e) => handleInputChange('co2_emissions', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="noise_level">Noise Level (dB)</Label>
                    <Input
                      id="noise_level"
                      type="number"
                      value={formData.noise_level || ''}
                      onChange={(e) => handleInputChange('noise_level', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="brake_type">Brake Type</Label>
                  <Input
                    id="brake_type"
                    value={formData.brake_type || ''}
                    onChange={(e) => handleInputChange('brake_type', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="suspension_type">Suspension Type</Label>
                  <Input
                    id="suspension_type"
                    value={formData.suspension_type || ''}
                    onChange={(e) => handleInputChange('suspension_type', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Daily Running Costs Tab */}
        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Daily Running Costs
              </CardTitle>
              <CardDescription>
                Track daily operational costs for this vehicle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Fuel Cost</TableHead>
                    <TableHead>Maintenance</TableHead>
                    <TableHead>Insurance</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Depreciation</TableHead>
                    <TableHead>Other</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyRunningCosts.map((cost) => (
                    <TableRow key={cost.id}>
                      <TableCell>{format(new Date(cost.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>£{cost.fuel_cost.toFixed(2)}</TableCell>
                      <TableCell>£{cost.maintenance_cost.toFixed(2)}</TableCell>
                      <TableCell>£{cost.insurance_cost.toFixed(2)}</TableCell>
                      <TableCell>£{cost.tax_cost.toFixed(2)}</TableCell>
                      <TableCell>£{cost.depreciation_cost.toFixed(2)}</TableCell>
                      <TableCell>£{cost.other_costs.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">£{cost.total_cost.toFixed(2)}</TableCell>
                      <TableCell>{cost.distance_traveled} mi</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total costs for {dailyRunningCosts.length} days: £{dailyRunningCosts.reduce((sum, cost) => sum + cost.total_cost, 0).toFixed(2)}
                </div>
                <Button onClick={() => setShowAddCostModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Daily Cost
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tyres Tab */}
        <TabsContent value="tyres" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Tyre Management
              </CardTitle>
              <CardDescription>
                Track tyre condition, pressure, and replacement schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Brand & Model</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Tread Depth</TableHead>
                    <TableHead>Pressure</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Installation</TableHead>
                    <TableHead>Replacement</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tyres.map((tyre) => (
                    <TableRow key={tyre.id}>
                      <TableCell className="font-medium">{tyre.position}</TableCell>
                      <TableCell>{tyre.brand} {tyre.model}</TableCell>
                      <TableCell>{tyre.size}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{tyre.tread_depth_current}mm</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(tyre.tread_depth_current / tyre.tread_depth_new) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={tyre.pressure_current < tyre.pressure_recommended ? 'text-red-600' : 'text-green-600'}>
                          {tyre.pressure_current} bar
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTyreConditionColor(tyre.condition)}>
                          {tyre.condition.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(tyre.installation_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {tyre.replacement_date ? format(new Date(tyre.replacement_date), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>£{tyre.cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total tyre value: £{tyres.reduce((sum, tyre) => sum + tyre.cost, 0).toFixed(2)}
                </div>
                <Button onClick={() => setShowAddTyreModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tyre
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Daily Cost Modal */}
      <Dialog open={showAddCostModal} onOpenChange={setShowAddCostModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Daily Running Cost</DialogTitle>
            <DialogDescription>
              Add a new daily cost record for this vehicle
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost-date">Date</Label>
              <Input
                id="cost-date"
                type="date"
                value={costForm.date}
                onChange={(e) => setCostForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="fuel-cost">Fuel Cost (£)</Label>
              <Input
                id="fuel-cost"
                type="number"
                step="0.01"
                value={costForm.fuel_cost}
                onChange={(e) => setCostForm(prev => ({ ...prev, fuel_cost: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="maintenance-cost">Maintenance Cost (£)</Label>
              <Input
                id="maintenance-cost"
                type="number"
                step="0.01"
                value={costForm.maintenance_cost}
                onChange={(e) => setCostForm(prev => ({ ...prev, maintenance_cost: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="insurance-cost">Insurance Cost (£)</Label>
              <Input
                id="insurance-cost"
                type="number"
                step="0.01"
                value={costForm.insurance_cost}
                onChange={(e) => setCostForm(prev => ({ ...prev, insurance_cost: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="tax-cost">Tax Cost (£)</Label>
              <Input
                id="tax-cost"
                type="number"
                step="0.01"
                value={costForm.tax_cost}
                onChange={(e) => setCostForm(prev => ({ ...prev, tax_cost: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="depreciation-cost">Depreciation Cost (£)</Label>
              <Input
                id="depreciation-cost"
                type="number"
                step="0.01"
                value={costForm.depreciation_cost}
                onChange={(e) => setCostForm(prev => ({ ...prev, depreciation_cost: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="other-costs">Other Costs (£)</Label>
              <Input
                id="other-costs"
                type="number"
                step="0.01"
                value={costForm.other_costs}
                onChange={(e) => setCostForm(prev => ({ ...prev, other_costs: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="mileage-start">Start Mileage</Label>
              <Input
                id="mileage-start"
                type="number"
                value={costForm.mileage_start}
                onChange={(e) => setCostForm(prev => ({ ...prev, mileage_start: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="mileage-end">End Mileage</Label>
              <Input
                id="mileage-end"
                type="number"
                value={costForm.mileage_end}
                onChange={(e) => setCostForm(prev => ({ ...prev, mileage_end: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="fuel-consumed">Fuel Consumed (L)</Label>
              <Input
                id="fuel-consumed"
                type="number"
                step="0.1"
                value={costForm.fuel_consumed}
                onChange={(e) => setCostForm(prev => ({ ...prev, fuel_consumed: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="cost-notes">Notes</Label>
            <Textarea
              id="cost-notes"
              value={costForm.notes}
              onChange={(e) => setCostForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this cost record..."
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCostModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDailyCost} disabled={createDailyCostMutation.isPending}>
              {createDailyCostMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Add Cost'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tyre Modal */}
      <Dialog open={showAddTyreModal} onOpenChange={setShowAddTyreModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Tyre</DialogTitle>
            <DialogDescription>
              Add a new tyre to the vehicle inventory
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tyre-position">Position</Label>
              <Select value={tyreForm.position} onValueChange={(value) => setTyreForm(prev => ({ ...prev, position: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Front Left">Front Left</SelectItem>
                  <SelectItem value="Front Right">Front Right</SelectItem>
                  <SelectItem value="Rear Left">Rear Left</SelectItem>
                  <SelectItem value="Rear Right">Rear Right</SelectItem>
                  <SelectItem value="Spare">Spare</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tyre-brand">Brand</Label>
              <Input
                id="tyre-brand"
                value={tyreForm.brand}
                onChange={(e) => setTyreForm(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="e.g., Michelin"
              />
            </div>
            <div>
              <Label htmlFor="tyre-model">Model</Label>
              <Input
                id="tyre-model"
                value={tyreForm.model}
                onChange={(e) => setTyreForm(prev => ({ ...prev, model: e.target.value }))}
                placeholder="e.g., Agilis"
              />
            </div>
            <div>
              <Label htmlFor="tyre-size">Size</Label>
              <Input
                id="tyre-size"
                value={tyreForm.size}
                onChange={(e) => setTyreForm(prev => ({ ...prev, size: e.target.value }))}
                placeholder="e.g., 225/65R16"
              />
            </div>
            <div>
              <Label htmlFor="tyre-load-index">Load Index</Label>
              <Input
                id="tyre-load-index"
                value={tyreForm.load_index}
                onChange={(e) => setTyreForm(prev => ({ ...prev, load_index: e.target.value }))}
                placeholder="e.g., 112"
              />
            </div>
            <div>
              <Label htmlFor="tyre-speed-rating">Speed Rating</Label>
              <Input
                id="tyre-speed-rating"
                value={tyreForm.speed_rating}
                onChange={(e) => setTyreForm(prev => ({ ...prev, speed_rating: e.target.value }))}
                placeholder="e.g., T"
              />
            </div>
            <div>
              <Label htmlFor="tyre-manufacture-date">Manufacture Date</Label>
              <Input
                id="tyre-manufacture-date"
                type="date"
                value={tyreForm.manufacture_date}
                onChange={(e) => setTyreForm(prev => ({ ...prev, manufacture_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="tyre-installation-date">Installation Date</Label>
              <Input
                id="tyre-installation-date"
                type="date"
                value={tyreForm.installation_date}
                onChange={(e) => setTyreForm(prev => ({ ...prev, installation_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="tyre-tread-depth-new">New Tread Depth (mm)</Label>
              <Input
                id="tyre-tread-depth-new"
                type="number"
                step="0.1"
                value={tyreForm.tread_depth_new}
                onChange={(e) => setTyreForm(prev => ({ ...prev, tread_depth_new: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="tyre-tread-depth-current">Current Tread Depth (mm)</Label>
              <Input
                id="tyre-tread-depth-current"
                type="number"
                step="0.1"
                value={tyreForm.tread_depth_current}
                onChange={(e) => setTyreForm(prev => ({ ...prev, tread_depth_current: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="tyre-pressure-recommended">Recommended Pressure (bar)</Label>
              <Input
                id="tyre-pressure-recommended"
                type="number"
                step="0.1"
                value={tyreForm.pressure_recommended}
                onChange={(e) => setTyreForm(prev => ({ ...prev, pressure_recommended: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="tyre-pressure-current">Current Pressure (bar)</Label>
              <Input
                id="tyre-pressure-current"
                type="number"
                step="0.1"
                value={tyreForm.pressure_current}
                onChange={(e) => setTyreForm(prev => ({ ...prev, pressure_current: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="tyre-condition">Condition</Label>
              <Select value={tyreForm.condition} onValueChange={(value: any) => setTyreForm(prev => ({ ...prev, condition: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="replace">Replace</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tyre-replacement-date">Replacement Date</Label>
              <Input
                id="tyre-replacement-date"
                type="date"
                value={tyreForm.replacement_date}
                onChange={(e) => setTyreForm(prev => ({ ...prev, replacement_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="tyre-cost">Cost (£)</Label>
              <Input
                id="tyre-cost"
                type="number"
                step="0.01"
                value={tyreForm.cost}
                onChange={(e) => setTyreForm(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="tyre-notes">Notes</Label>
            <Textarea
              id="tyre-notes"
              value={tyreForm.notes}
              onChange={(e) => setTyreForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this tyre..."
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTyreModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTyre} disabled={createTyreMutation.isPending}>
              {createTyreMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Add Tyre'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

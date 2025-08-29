import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  ArrowLeft, 
  Car, 
  User, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Route,
  Briefcase,
  CalendarDays,
  Users,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, isAfter, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  license_number?: string;
  license_expiry?: string;
  is_active: boolean;
  avatar_url?: string;
  current_vehicle_id?: string;
  current_assignment_type?: string;
  current_assignment_end?: string;
}

interface Vehicle {
  id: string;
  vehicle_number: string;
  license_plate: string;
  make?: string;
  model?: string;
  year?: number;
  type?: string;
  capacity: number;
  is_active: boolean;
  current_driver_id?: string;
}

interface Assignment {
  id: string;
  vehicle_id: string;
  driver_id: string;
  assignment_type: 'permanent' | 'temporary' | 'job' | 'school_route';
  start_date: string;
  end_date?: string;
  job_id?: string;
  route_id?: string;
  notes?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export default function AssignDriver() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Assignment form state
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [assignmentType, setAssignmentType] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Mock data for jobs and routes
  const [jobs] = useState([
    { id: 'job-1', title: 'London to Manchester Delivery', client: 'ABC Logistics' },
    { id: 'job-2', title: 'School Transport - St. Mary\'s', client: 'Education Council' },
    { id: 'job-3', title: 'Event Transport - Music Festival', client: 'Event Management Ltd' }
  ]);
  
  const [routes] = useState([
    { id: 'route-1', name: 'Route A - North London Schools', description: 'Morning and afternoon school runs' },
    { id: 'route-2', name: 'Route B - South London Schools', description: 'Primary school transport' },
    { id: 'route-3', name: 'Route C - Special Needs Transport', description: 'Specialized transport service' }
  ]);

  useEffect(() => {
    if (vehicleId) {
      fetchVehicleAndDrivers();
    }
  }, [vehicleId]);

  const fetchVehicleAndDrivers = async () => {
    try {
      setLoading(true);
      
      // Mock vehicle data
      const mockVehicle: Vehicle = {
        id: vehicleId || 'vehicle-1',
        vehicle_number: 'VH001',
        license_plate: 'AB12 CDE',
        make: 'Mercedes',
        model: 'Sprinter',
        year: 2022,
        type: 'minibus',
        capacity: 16,
        is_active: true
      };
      
      // Mock drivers data
      const mockDrivers: Driver[] = [
        {
          id: 'driver-1',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@company.com',
          phone: '+44 7911 123456',
          license_number: 'DL123456789',
          license_expiry: '2025-06-15',
          is_active: true,
          current_vehicle_id: null
        },
        {
          id: 'driver-2',
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@company.com',
          phone: '+44 7911 234567',
          license_number: 'DL234567890',
          license_expiry: '2024-12-20',
          is_active: true,
          current_vehicle_id: 'vehicle-2'
        },
        {
          id: 'driver-3',
          first_name: 'Michael',
          last_name: 'Brown',
          email: 'michael.brown@company.com',
          phone: '+44 7911 345678',
          license_number: 'DL345678901',
          license_expiry: '2025-03-10',
          is_active: true,
          current_vehicle_id: null
        },
        {
          id: 'driver-4',
          first_name: 'Emma',
          last_name: 'Wilson',
          email: 'emma.wilson@company.com',
          phone: '+44 7911 456789',
          license_number: 'DL456789012',
          license_expiry: '2024-11-30',
          is_active: false,
          current_vehicle_id: null
        }
      ];
      
      setVehicle(mockVehicle);
      setDrivers(mockDrivers);
      
      // Filter available drivers (not currently assigned or assigned to this vehicle)
      const available = mockDrivers.filter(driver => 
        driver.is_active && 
        (!driver.current_vehicle_id || driver.current_vehicle_id === vehicleId)
      );
      setAvailableDrivers(available);
      
    } catch (err) {
      setError('Failed to load vehicle and drivers');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentTypeChange = (type: string) => {
    setAssignmentType(type);
    
    // Set default end date based on assignment type
    switch (type) {
      case 'permanent':
        setEndDate(undefined);
        break;
      case 'temporary':
        setEndDate(addDays(new Date(), 1));
        break;
      case 'job':
        setEndDate(addDays(new Date(), 7));
        break;
      case 'school_route':
        setEndDate(addDays(new Date(), 30));
        break;
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver || !assignmentType || !startDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Mock assignment creation
      const newAssignment: Assignment = {
        id: `assignment-${Date.now()}`,
        vehicle_id: vehicleId || '',
        driver_id: selectedDriver,
        assignment_type: assignmentType as any,
        start_date: startDate.toISOString(),
        end_date: endDate?.toISOString(),
        notes: notes,
        status: 'active',
        created_at: new Date().toISOString()
      };

      console.log('Creating assignment:', newAssignment);
      
      // Here you would typically save to Supabase
      // const { data, error } = await supabase
      //   .from('vehicle_assignments')
      //   .insert([newAssignment]);

      // Show success and navigate back
      alert('Driver assigned successfully!');
      navigate(`/vehicles/${vehicleId}`);
      
    } catch (err) {
      setError('Failed to assign driver');
      console.error('Error assigning driver:', err);
    }
  };

  const filteredDrivers = availableDrivers.filter(driver => {
    const matchesSearch = driver.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'available' && !driver.current_vehicle_id) ||
                         (filterStatus === 'assigned' && driver.current_vehicle_id);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading assignment data...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error || 'Vehicle not found'}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
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
        <h1 className="text-2xl font-bold text-gray-900">Assign Driver to Vehicle</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Vehicle Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{vehicle.vehicle_number}</h3>
                  <p className="text-sm text-gray-600">{vehicle.license_plate}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Make/Model:</span>
                  <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Year:</span>
                  <span className="font-medium">{vehicle.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{vehicle.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium">{vehicle.capacity} passengers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={vehicle.is_active ? "default" : "secondary"}>
                    {vehicle.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Type</CardTitle>
              <CardDescription>
                Choose the type of assignment for this driver
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    assignmentType === 'permanent' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleAssignmentTypeChange('permanent')}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Permanent Assignment</h4>
                      <p className="text-sm text-gray-600">Long-term driver assignment</p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    assignmentType === 'temporary' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleAssignmentTypeChange('temporary')}
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium">Temporary (Daily)</h4>
                      <p className="text-sm text-gray-600">Single day assignment</p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    assignmentType === 'job' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleAssignmentTypeChange('job')}
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Job Assignment</h4>
                      <p className="text-sm text-gray-600">Specific job or project</p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    assignmentType === 'school_route' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleAssignmentTypeChange('school_route')}
                >
                  <div className="flex items-center gap-3">
                    <Route className="w-5 h-5 text-orange-600" />
                    <div>
                      <h4 className="font-medium">School Route</h4>
                      <p className="text-sm text-gray-600">Regular school transport</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {endDate !== undefined && (
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => setEndDate(date)}
                          initialFocus
                          disabled={(date) => date < startDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              {assignmentType === 'job' && (
                <div>
                  <Label htmlFor="job">Select Job</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a job" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title} - {job.client}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {assignmentType === 'school_route' && (
                <div>
                  <Label htmlFor="route">Select Route</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this assignment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Driver Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Driver</CardTitle>
              <CardDescription>
                Choose from available drivers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search drivers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Drivers</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Currently Assigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Drivers List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDriver === driver.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedDriver(driver.id)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {driver.first_name[0]}{driver.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {driver.first_name} {driver.last_name}
                        </h4>
                        <p className="text-sm text-gray-600">{driver.email}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500">
                            License: {driver.license_number}
                          </span>
                          <span className="text-xs text-gray-500">
                            Expires: {driver.license_expiry ? format(new Date(driver.license_expiry), 'MMM dd, yyyy') : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {driver.current_vehicle_id ? (
                          <Badge variant="secondary">Currently Assigned</Badge>
                        ) : (
                          <Badge variant="default">Available</Badge>
                        )}
                        {selectedDriver === driver.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDrivers.length === 0 && (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No drivers found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleAssignDriver}
              disabled={!selectedDriver || !assignmentType}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Assign Driver
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/vehicles/${vehicleId}`)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

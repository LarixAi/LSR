import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  Plus, 
  Search,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  Truck,
  AlertTriangle,
  CheckCircle,
  FileText,
  Activity,
  BarChart3,
  Settings,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc,
  FileUp,
  Database,
  Shield,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TachographCardReader from '@/components/tachograph/TachographCardReader';
import AnalogTachographManager from '@/components/tachograph/AnalogTachographManager';

interface TachographRecord {
  id: string;
  organization_id: string;
  driver_id: string | null;
  vehicle_id: string | null;
  record_date: string;
  start_time: string;
  end_time: string | null;
  activity_type: string;
  distance_km: number | null;
  start_location: string | null;
  end_location: string | null;
  digital_signature: string | null;
  card_number: string | null;
  downloaded_at: string | null;
  file_path: string | null;
  raw_data: any;
  violations: any;
  is_validated: boolean | null;
  validation_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  driver_name?: string;
  vehicle_number?: string;
  vehicle_license_plate?: string;
}

interface TachographStats {
  totalRecords: number;
  validatedRecords: number;
  pendingValidation: number;
  recordsWithViolations: number;
  averageDistance: number;
  complianceRate: number;
  totalDrivingTime: number;
  totalRestTime: number;
}

const TachographManager: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [isAnalogUploadOpen, setIsAnalogUploadOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<TachographRecord | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);

  // Fetch real tachograph records from database
  const { data: tachographRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ['tachograph-records', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      // Fetch tachograph records
      const { data: records, error: recordsError } = await supabase
        .from('tachograph_records')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('record_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (recordsError) {
        console.error('Error fetching tachograph records:', recordsError);
        toast({
          title: "Error",
          description: "Failed to load tachograph records",
          variant: "destructive"
        });
        return [];
      }

      // Fetch drivers and vehicles separately
      const driverIds = [...new Set(records?.filter(r => r.driver_id).map(r => r.driver_id) || [])];
      const vehicleIds = [...new Set(records?.filter(r => r.vehicle_id).map(r => r.vehicle_id) || [])];

      let drivers: any[] = [];
      let vehicles: any[] = [];

      if (driverIds.length > 0) {
        const { data: driversData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', driverIds);
        drivers = driversData || [];
      }

      if (vehicleIds.length > 0) {
        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('id, vehicle_number, license_plate')
          .in('id', vehicleIds);
        vehicles = vehiclesData || [];
      }

      // Create lookup maps
      const driverMap = new Map(drivers.map(d => [d.id, d]));
      const vehicleMap = new Map(vehicles.map(v => [v.id, v]));

      // Transform the data to include joined fields
      return records?.map(record => ({
        ...record,
        driver_name: record.driver_id && driverMap.has(record.driver_id) ? 
          `${driverMap.get(record.driver_id)?.first_name || ''} ${driverMap.get(record.driver_id)?.last_name || ''}`.trim() : 
          'Unknown Driver',
        vehicle_number: record.vehicle_id && vehicleMap.has(record.vehicle_id) ? 
          vehicleMap.get(record.vehicle_id)?.vehicle_number || 'Unknown Vehicle' : 
          'Unknown Vehicle',
        vehicle_license_plate: record.vehicle_id && vehicleMap.has(record.vehicle_id) ? 
          vehicleMap.get(record.vehicle_id)?.license_plate || 'No Plate' : 
          'No Plate'
      })) || [];
    },
    enabled: !!profile?.organization_id
  });

  // Fetch vehicles for upload form
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, vehicle_number, license_plate')
        .eq('organization_id', profile.organization_id);
      
      if (error) {
        console.error('Error fetching vehicles:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  // Fetch drivers for upload form
  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('organization_id', profile.organization_id)
        .eq('role', 'driver');
      
      if (error) {
        console.error('Error fetching drivers:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  // Calculate statistics from real data
  const calculateStats = (): TachographStats => {
    if (tachographRecords.length === 0) {
      return {
        totalRecords: 0,
        validatedRecords: 0,
        pendingValidation: 0,
        recordsWithViolations: 0,
        averageDistance: 0,
        complianceRate: 100,
        totalDrivingTime: 0,
        totalRestTime: 0
      };
    }

    const totalRecords = tachographRecords.length;
    const validatedRecords = tachographRecords.filter(r => r.is_validated).length;
    const pendingValidation = totalRecords - validatedRecords;
    const recordsWithViolations = tachographRecords.filter(r => 
      r.violations && Array.isArray(r.violations) && r.violations.length > 0
    ).length;
    
    const totalDistance = tachographRecords.reduce((sum, r) => sum + (r.distance_km || 0), 0);
    const averageDistance = totalDistance / totalRecords;

    const drivingRecords = tachographRecords.filter(r => r.activity_type === 'driving');
    const restRecords = tachographRecords.filter(r => r.activity_type === 'rest');
    
    const totalDrivingTime = drivingRecords.length; // Simplified - in real app would calculate actual hours
    const totalRestTime = restRecords.length; // Simplified - in real app would calculate actual hours
    
    const complianceRate = totalRecords > 0 ? ((totalRecords - recordsWithViolations) / totalRecords) * 100 : 100;

    return {
      totalRecords,
      validatedRecords,
      pendingValidation,
      recordsWithViolations,
      averageDistance: Math.round(averageDistance * 100) / 100,
      complianceRate: Math.round(complianceRate * 100) / 100,
      totalDrivingTime,
      totalRestTime
    };
  };

  const stats = calculateStats();

  // Filter records based on search and filters
  const filteredRecords = tachographRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.activity_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'validated' && record.is_validated) ||
      (statusFilter === 'pending' && !record.is_validated) ||
      (statusFilter === 'violations' && record.violations && Array.isArray(record.violations) && record.violations.length > 0);

    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && record.record_date === new Date().toISOString().split('T')[0]) ||
      (dateFilter === 'week' && (() => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(record.record_date) >= weekAgo;
      })()) ||
      (dateFilter === 'month' && (() => {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return new Date(record.record_date) >= monthAgo;
      })());

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const file = formData.get('file') as File;
      const { data, error } = await supabase.storage
        .from('tachograph-files')
        .upload(`${profile?.organization_id}/${Date.now()}_${file.name}`, file);

      if (error) throw error;

      // Create tachograph record
      const recordData = {
        organization_id: profile?.organization_id,
        driver_id: formData.get('driver_id') as string || null,
        vehicle_id: formData.get('vehicle_id') as string || null,
        record_date: formData.get('record_date') as string,
        start_time: formData.get('start_time') as string,
        end_time: formData.get('end_time') as string || null,
        activity_type: formData.get('activity_type') as string,
        distance_km: parseFloat(formData.get('distance_km') as string) || null,
        start_location: formData.get('start_location') as string || null,
        end_location: formData.get('end_location') as string || null,
        file_path: data.path,
        raw_data: {},
        violations: [],
        is_validated: false
      };

      const { error: insertError } = await supabase
        .from('tachograph_records')
        .insert(recordData);

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tachograph-records'] });
      setIsUploadDialogOpen(false);
      toast({
        title: "Success",
        description: "Tachograph record uploaded successfully"
      });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload tachograph record",
        variant: "destructive"
      });
    }
  });

  // Validation mutation
  const validateMutation = useMutation({
    mutationFn: async ({ recordId, isValidated, notes }: { recordId: string; isValidated: boolean; notes?: string }) => {
      const { error } = await supabase
        .from('tachograph_records')
        .update({ 
          is_validated: isValidated,
          validation_notes: notes || null
        })
        .eq('id', recordId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tachograph-records'] });
      toast({
        title: "Success",
        description: "Record validation updated"
      });
    },
    onError: (error) => {
      console.error('Validation error:', error);
      toast({
        title: "Error",
        description: "Failed to update validation",
        variant: "destructive"
      });
    }
  });

  if (loading || recordsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading tachograph manager...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only admins and council can access
  if (!['admin', 'council'].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  const getStatusBadge = (record: TachographRecord) => {
    if (record.is_validated) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Validated</Badge>;
    }
    if (record.violations && Array.isArray(record.violations) && record.violations.length > 0) {
      return <Badge variant="destructive">Violations</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const getActivityTypeBadge = (activityType: string) => {
    const colors = {
      driving: 'bg-blue-100 text-blue-800',
      rest: 'bg-green-100 text-green-800',
      work: 'bg-yellow-100 text-yellow-800',
      availability: 'bg-purple-100 text-purple-800',
      break: 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[activityType as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
      {activityType.charAt(0).toUpperCase() + activityType.slice(1)}
    </Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tachograph Manager</h1>
          <p className="text-muted-foreground">
            Manage digital and analog tachograph records
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsUploadDialogOpen(true)} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload Digital
          </Button>
          <Button onClick={() => setIsAnalogUploadOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Upload Analog
                  </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              All time tachograph records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validated Records</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.validatedRecords}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalRecords > 0 ? Math.round((stats.validatedRecords / stats.totalRecords) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complianceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.recordsWithViolations} violations detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Distance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageDistance} km</div>
            <p className="text-xs text-muted-foreground">
              Per tachograph record
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Digital vs Analog */}
      <Tabs defaultValue="digital" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="digital">Digital Records</TabsTrigger>
          <TabsTrigger value="card-reader">Card Reader</TabsTrigger>
          <TabsTrigger value="analog">Analog Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="digital" className="space-y-6">
          {/* Digital Records Content */}
          <Card>
            <CardHeader>
          <CardTitle>Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
                <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                  placeholder="Search by driver, vehicle, or activity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
              </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="validated">Validated</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="violations">With Violations</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

          {/* Records Table */}
          <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                  <TableHead>Date</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Vehicle</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Distance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {tachographRecords.length === 0 ? (
                          <div>
                            <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No tachograph records found</p>
                            <p className="text-sm">Upload your first tachograph record to get started</p>
                            <Button 
                              onClick={() => setIsUploadDialogOpen(true)} 
                              className="mt-4"
                              variant="outline"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload First Record
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No records match your filters</p>
                            <p className="text-sm">Try adjusting your search criteria</p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="font-medium">
                          {new Date(record.record_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{record.driver_name}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.vehicle_number}</div>
                          <div className="text-sm text-muted-foreground">{record.vehicle_license_plate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActivityTypeBadge(record.activity_type)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {record.start_time} - {record.end_time || 'Ongoing'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.distance_km ? `${record.distance_km} km` : '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(record);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              validateMutation.mutate({
                                recordId: record.id,
                                isValidated: !record.is_validated,
                                notes: record.validation_notes || undefined
                              });
                            }}
                            disabled={validateMutation.isPending}
                          >
                            {record.is_validated ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                </TableBody>
              </Table>
          </div>
            </CardContent>
          </Card>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Tachograph Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            uploadMutation.mutate(formData);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="driver_id">Driver</Label>
                <Select name="driver_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="vehicle_id">Vehicle</Label>
                <Select name="vehicle_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.vehicle_number} ({vehicle.license_plate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="record_date">Record Date</Label>
                <Input
                  type="date"
                  name="record_date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="activity_type">Activity Type</Label>
                <Select name="activity_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driving">Driving</SelectItem>
                    <SelectItem value="rest">Rest</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="availability">Availability</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Input type="time" name="start_time" required />
              </div>

              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input type="time" name="end_time" />
              </div>

              <div>
                <Label htmlFor="distance_km">Distance (km)</Label>
                <Input type="number" name="distance_km" step="0.1" />
                        </div>

              <div>
                <Label htmlFor="file">Tachograph File</Label>
                <Input type="file" name="file" accept=".ddd,.tgd,.c1b,.v1b,.v2b,.esm" required />
                        </div>
                      </div>

            <div className="mt-4">
              <Label htmlFor="start_location">Start Location</Label>
              <Input name="start_location" placeholder="Enter start location" />
            </div>

            <div className="mt-4">
              <Label htmlFor="end_location">End Location</Label>
              <Input name="end_location" placeholder="Enter end location" />
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadDialogOpen(false)}
              >
                Cancel
                        </Button>
              <Button
                type="submit"
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Record'}
                        </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Record Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Tachograph Record Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Date:</span> {new Date(selectedRecord.record_date).toLocaleDateString()}</div>
                    <div><span className="font-medium">Driver:</span> {selectedRecord.driver_name}</div>
                    <div><span className="font-medium">Vehicle:</span> {selectedRecord.vehicle_number} ({selectedRecord.vehicle_license_plate})</div>
                    <div><span className="font-medium">Activity:</span> {getActivityTypeBadge(selectedRecord.activity_type)}</div>
                    <div><span className="font-medium">Time:</span> {selectedRecord.start_time} - {selectedRecord.end_time || 'Ongoing'}</div>
                    <div><span className="font-medium">Distance:</span> {selectedRecord.distance_km ? `${selectedRecord.distance_km} km` : 'Not recorded'}</div>
                      </div>
                    </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Location & Validation</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Start Location:</span> {selectedRecord.start_location || 'Not specified'}</div>
                    <div><span className="font-medium">End Location:</span> {selectedRecord.end_location || 'Not specified'}</div>
                    <div><span className="font-medium">Card Number:</span> {selectedRecord.card_number || 'Not recorded'}</div>
                    <div><span className="font-medium">Downloaded:</span> {selectedRecord.downloaded_at ? new Date(selectedRecord.downloaded_at).toLocaleString() : 'Not downloaded'}</div>
                    <div><span className="font-medium">Status:</span> {getStatusBadge(selectedRecord)}</div>
                  </div>
                </div>
              </div>

              {selectedRecord.violations && Array.isArray(selectedRecord.violations) && selectedRecord.violations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Violations Detected</h3>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                      {selectedRecord.violations.map((violation: string, index: number) => (
                        <li key={index}>{violation}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {selectedRecord.validation_notes && (
                <div>
                  <h3 className="font-semibold mb-2">Validation Notes</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-sm text-blue-800">{selectedRecord.validation_notes}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    validateMutation.mutate({
                      recordId: selectedRecord.id,
                      isValidated: !selectedRecord.is_validated,
                      notes: selectedRecord.validation_notes || undefined
                    });
                  }}
                  disabled={validateMutation.isPending}
                >
                  {selectedRecord.is_validated ? 'Mark as Pending' : 'Mark as Validated'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </TabsContent>

        <TabsContent value="card-reader" className="space-y-6">
          <TachographCardReader 
            onDataDownloaded={(cardData) => {
              toast({
                title: "Card Data Downloaded",
                description: `Successfully downloaded ${cardData.recordsCount} records from ${cardData.cardType} card`
              });
              queryClient.invalidateQueries({ queryKey: ['tachograph-records'] });
            }}
          />
        </TabsContent>

        <TabsContent value="analog" className="space-y-6">
          <AnalogTachographManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TachographManager;

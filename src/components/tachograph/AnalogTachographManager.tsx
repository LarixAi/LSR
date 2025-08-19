import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Archive,
  Image,
  FileImage,
  BarChart3,
  Settings,
  Plus,
  FileUp,
  Database,
  Shield,
  TrendingUp,
  AlertCircle,
  FileCheck,
  FileX
} from 'lucide-react';

interface AnalogChart {
  id: string;
  organization_id: string;
  driver_id: string | null;
  vehicle_id: string | null;
  chart_number: string;
  chart_date: string;
  start_time: string | null;
  end_time: string | null;
  total_distance_km: number | null;
  chart_type: '24_hour' | '7_day' | 'custom';
  chart_format: 'circular' | 'strip';
  chart_size: 'standard' | 'large' | 'small';
  chart_image_url: string | null;
  chart_pdf_url: string | null;
  driving_periods: any[];
  rest_periods: any[];
  violations: any[];
  manual_analysis_completed: boolean;
  analysis_notes: string | null;
  chart_condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  uploaded_at: string;
  // Joined data
  driver_name?: string;
  vehicle_number?: string;
  vehicle_license_plate?: string;
}

interface AnalogTachographStats {
  totalCharts: number;
  analyzedCharts: number;
  pendingAnalysis: number;
  chartsWithViolations: number;
  averageDistance: number;
  complianceRate: number;
}

const AnalogTachographManager: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [selectedChart, setSelectedChart] = useState<AnalogChart | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState<boolean>(false);

  // Fetch analog charts
  const { data: analogCharts = [], isLoading: chartsLoading } = useQuery({
    queryKey: ['analog-charts', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('analog_tachograph_charts')
        .select(`
          *,
          profiles!analog_tachograph_charts_driver_id_fkey(
            first_name,
            last_name
          ),
          vehicles!analog_tachograph_charts_vehicle_id_fkey(
            vehicle_number,
            license_plate
          )
        `)
        .eq('organization_id', profile.organization_id)
        .order('chart_date', { ascending: false });

      if (error) {
        console.error('Error fetching analog charts:', error);
        toast({
          title: "Error",
          description: "Failed to load analog charts",
          variant: "destructive"
        });
        return [];
      }

      return data?.map(chart => ({
        ...chart,
        driver_name: chart.profiles ? 
          `${chart.profiles.first_name || ''} ${chart.profiles.last_name || ''}`.trim() : 
          'Unknown Driver',
        vehicle_number: chart.vehicles?.vehicle_number || 'Unknown Vehicle',
        vehicle_license_plate: chart.vehicles?.license_plate || 'No Plate'
      })) || [];
    },
    enabled: !!profile?.organization_id
  });

  // Fetch vehicles and drivers for upload form
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, vehicle_number, license_plate')
        .eq('organization_id', profile.organization_id);
      return error ? [] : (data || []);
    },
    enabled: !!profile?.organization_id
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('organization_id', profile.organization_id)
        .eq('role', 'driver');
      return error ? [] : (data || []);
    },
    enabled: !!profile?.organization_id
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const file = formData.get('chart_file') as File;
      const chartNumber = formData.get('chart_number') as string;
      const chartDate = formData.get('chart_date') as string;
      
      // Upload chart image to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('analog-charts')
        .upload(`${profile?.organization_id}/${chartDate}_${chartNumber}_${Date.now()}.jpg`, file);

      if (uploadError) throw uploadError;

      // Create database record
      const chartData = {
        organization_id: profile?.organization_id,
        driver_id: formData.get('driver_id') as string || null,
        vehicle_id: formData.get('vehicle_id') as string || null,
        chart_number: chartNumber,
        chart_date: chartDate,
        start_time: formData.get('start_time') as string || null,
        end_time: formData.get('end_time') as string || null,
        total_distance_km: parseFloat(formData.get('total_distance_km') as string) || null,
        chart_type: formData.get('chart_type') as '24_hour' | '7_day' | 'custom',
        chart_format: formData.get('chart_format') as 'circular' | 'strip',
        chart_size: formData.get('chart_size') as 'standard' | 'large' | 'small',
        chart_image_url: uploadData.path,
        chart_condition: formData.get('chart_condition') as 'excellent' | 'good' | 'fair' | 'poor' | 'damaged',
        uploaded_by: profile?.id,
        driving_periods: [],
        rest_periods: [],
        violations: [],
        manual_analysis_completed: false
      };

      const { error: insertError } = await supabase
        .from('analog_tachograph_charts')
        .insert(chartData);

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analog-charts'] });
      setIsUploadDialogOpen(false);
      toast({
        title: "Success",
        description: "Analog chart uploaded successfully"
      });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload analog chart",
        variant: "destructive"
      });
    }
  });

  // Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async ({ chartId, analysisData }: { chartId: string; analysisData: any }) => {
      const { error } = await supabase
        .from('analog_tachograph_charts')
        .update({
          driving_periods: analysisData.driving_periods,
          rest_periods: analysisData.rest_periods,
          work_periods: analysisData.work_periods,
          availability_periods: analysisData.availability_periods,
          break_periods: analysisData.break_periods,
          violations: analysisData.violations,
          manual_analysis_completed: true,
          analysis_notes: analysisData.notes,
          analyzed_by: profile?.id,
          analyzed_at: new Date().toISOString()
        })
        .eq('id', chartId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analog-charts'] });
      setIsAnalysisDialogOpen(false);
      toast({
        title: "Success",
        description: "Chart analysis completed"
      });
    },
    onError: (error) => {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to save analysis",
        variant: "destructive"
      });
    }
  });

  // Calculate statistics
  const calculateStats = (): AnalogTachographStats => {
    if (analogCharts.length === 0) {
      return {
        totalCharts: 0,
        analyzedCharts: 0,
        pendingAnalysis: 0,
        chartsWithViolations: 0,
        averageDistance: 0,
        complianceRate: 100
      };
    }

    const totalCharts = analogCharts.length;
    const analyzedCharts = analogCharts.filter(c => c.manual_analysis_completed).length;
    const pendingAnalysis = totalCharts - analyzedCharts;
    const chartsWithViolations = analogCharts.filter(c => 
      c.violations && Array.isArray(c.violations) && c.violations.length > 0
    ).length;
    
    const totalDistance = analogCharts.reduce((sum, c) => sum + (c.total_distance_km || 0), 0);
    const averageDistance = totalDistance / totalCharts;
    
    const complianceRate = totalCharts > 0 ? ((totalCharts - chartsWithViolations) / totalCharts) * 100 : 100;

    return {
      totalCharts,
      analyzedCharts,
      pendingAnalysis,
      chartsWithViolations,
      averageDistance: Math.round(averageDistance * 100) / 100,
      complianceRate: Math.round(complianceRate * 100) / 100
    };
  };

  const stats = calculateStats();

  // Filter charts
  const filteredCharts = analogCharts.filter(chart => {
    const matchesSearch = searchTerm === '' || 
      chart.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chart.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chart.chart_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'analyzed' && chart.manual_analysis_completed) ||
      (statusFilter === 'pending' && !chart.manual_analysis_completed) ||
      (statusFilter === 'violations' && chart.violations && Array.isArray(chart.violations) && chart.violations.length > 0);

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (chart: AnalogChart) => {
    if (chart.manual_analysis_completed) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Analyzed</Badge>;
    }
    if (chart.violations && Array.isArray(chart.violations) && chart.violations.length > 0) {
      return <Badge variant="destructive">Violations</Badge>;
    }
    return <Badge variant="secondary">Pending Analysis</Badge>;
  };

  const getChartTypeBadge = (chartType: string) => {
    const colors = {
      '24_hour': 'bg-blue-100 text-blue-800',
      '7_day': 'bg-purple-100 text-purple-800',
      'custom': 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[chartType as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
      {chartType.replace('_', ' ').toUpperCase()}
    </Badge>;
  };

  const getChartConditionBadge = (condition: string) => {
    const colors = {
      'excellent': 'bg-green-100 text-green-800',
      'good': 'bg-blue-100 text-blue-800',
      'fair': 'bg-yellow-100 text-yellow-800',
      'poor': 'bg-orange-100 text-orange-800',
      'damaged': 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
      {condition.charAt(0).toUpperCase() + condition.slice(1)}
    </Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analog Charts</h2>
          <p className="text-muted-foreground">
            Manage analog tachograph charts and manual analysis
          </p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)} className="inline-flex items-center">
          <Upload className="mr-2 h-4 w-4" />
          Upload Chart
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Charts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCharts}</div>
            <p className="text-xs text-muted-foreground">
              All time analog charts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyzed Charts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.analyzedCharts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCharts > 0 ? Math.round((stats.analyzedCharts / stats.totalCharts) * 100) : 0}% of total
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
              {stats.chartsWithViolations} violations detected
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
              Per chart
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Analog Charts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by driver, vehicle, or chart number..."
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
                <SelectItem value="analyzed">Analyzed</SelectItem>
                <SelectItem value="pending">Pending Analysis</SelectItem>
                <SelectItem value="violations">With Violations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Chart Number</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCharts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {analogCharts.length === 0 ? (
                          <div>
                            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No analog charts found</p>
                            <p className="text-sm">Upload your first analog chart to get started</p>
                            <Button 
                              onClick={() => setIsUploadDialogOpen(true)} 
                              className="mt-4"
                              variant="outline"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload First Chart
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No charts match your filters</p>
                            <p className="text-sm">Try adjusting your search criteria</p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCharts.map((chart) => (
                    <TableRow key={chart.id}>
                      <TableCell>
                        <div className="font-medium">
                          {new Date(chart.chart_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{chart.chart_number}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{chart.driver_name}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{chart.vehicle_number}</div>
                          <div className="text-sm text-muted-foreground">{chart.vehicle_license_plate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getChartTypeBadge(chart.chart_type)}
                      </TableCell>
                      <TableCell>
                        {chart.total_distance_km ? `${chart.total_distance_km} km` : '-'}
                      </TableCell>
                      <TableCell>
                        {getChartConditionBadge(chart.chart_condition)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(chart)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedChart(chart);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!chart.manual_analysis_completed && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedChart(chart);
                                setIsAnalysisDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
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
            <DialogTitle>Upload Analog Chart</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            uploadMutation.mutate(formData);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chart_number">Chart Number</Label>
                <Input name="chart_number" required placeholder="e.g., CHART-2024-001" />
              </div>
              
              <div>
                <Label htmlFor="chart_date">Chart Date</Label>
                <Input type="date" name="chart_date" required />
              </div>

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
                <Label htmlFor="chart_type">Chart Type</Label>
                <Select name="chart_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24_hour">24 Hour</SelectItem>
                    <SelectItem value="7_day">7 Day</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="chart_format">Chart Format</Label>
                <Select name="chart_format" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circular">Circular</SelectItem>
                    <SelectItem value="strip">Strip</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Input type="time" name="start_time" />
              </div>

              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input type="time" name="end_time" />
              </div>

              <div>
                <Label htmlFor="total_distance_km">Total Distance (km)</Label>
                <Input type="number" name="total_distance_km" step="0.1" />
              </div>

              <div>
                <Label htmlFor="chart_condition">Chart Condition</Label>
                <Select name="chart_condition" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="chart_file">Chart Image</Label>
              <Input 
                type="file" 
                name="chart_file" 
                accept="image/*,.pdf" 
                required 
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload a clear image or PDF of the analog chart
              </p>
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
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Chart'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Chart Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Analog Chart Details</DialogTitle>
          </DialogHeader>
          {selectedChart && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Chart Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Chart Number:</span> {selectedChart.chart_number}</div>
                    <div><span className="font-medium">Date:</span> {new Date(selectedChart.chart_date).toLocaleDateString()}</div>
                    <div><span className="font-medium">Driver:</span> {selectedChart.driver_name}</div>
                    <div><span className="font-medium">Vehicle:</span> {selectedChart.vehicle_number} ({selectedChart.vehicle_license_plate})</div>
                    <div><span className="font-medium">Type:</span> {getChartTypeBadge(selectedChart.chart_type)}</div>
                    <div><span className="font-medium">Format:</span> {selectedChart.chart_format}</div>
                    <div><span className="font-medium">Distance:</span> {selectedChart.total_distance_km ? `${selectedChart.total_distance_km} km` : 'Not recorded'}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Analysis Status</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Status:</span> {getStatusBadge(selectedChart)}</div>
                    <div><span className="font-medium">Condition:</span> {getChartConditionBadge(selectedChart.chart_condition)}</div>
                    <div><span className="font-medium">Uploaded:</span> {new Date(selectedChart.uploaded_at).toLocaleString()}</div>
                    {selectedChart.analysis_notes && (
                      <div><span className="font-medium">Notes:</span> {selectedChart.analysis_notes}</div>
                    )}
                  </div>
                </div>
              </div>

              {selectedChart.chart_image_url && (
                <div>
                  <h3 className="font-semibold mb-2">Chart Image</h3>
                  <div className="border rounded-lg p-4">
                    <img 
                      src={`${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/analog-charts/${selectedChart.chart_image_url}`}
                      alt="Analog Chart"
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
              )}

              {selectedChart.violations && Array.isArray(selectedChart.violations) && selectedChart.violations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Violations Detected</h3>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                      {selectedChart.violations.map((violation: string, index: number) => (
                        <li key={index}>{violation}</li>
                      ))}
                    </ul>
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
                {!selectedChart.manual_analysis_completed && (
                  <Button
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setIsAnalysisDialogOpen(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Analyze Chart
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Analysis Dialog */}
      <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Analyze Analog Chart</DialogTitle>
          </DialogHeader>
          {selectedChart && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Chart Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Chart:</span> {selectedChart.chart_number}</div>
                    <div><span className="font-medium">Date:</span> {new Date(selectedChart.chart_date).toLocaleDateString()}</div>
                    <div><span className="font-medium">Driver:</span> {selectedChart.driver_name}</div>
                    <div><span className="font-medium">Vehicle:</span> {selectedChart.vehicle_number}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Chart Image</h3>
                  {selectedChart.chart_image_url && (
                    <img 
                      src={`${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/analog-charts/${selectedChart.chart_image_url}`}
                      alt="Analog Chart"
                      className="max-w-full h-auto rounded border"
                    />
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Manual Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Analyze the chart and record the periods of activity, rest, and any violations detected.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="analysis_notes">Analysis Notes</Label>
                    <Textarea 
                      id="analysis_notes"
                      placeholder="Record your analysis findings, violations detected, and any notes..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="driving_periods">Driving Periods</Label>
                      <Textarea 
                        id="driving_periods"
                        placeholder="e.g., 06:00-12:00, 14:00-18:00"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="rest_periods">Rest Periods</Label>
                      <Textarea 
                        id="rest_periods"
                        placeholder="e.g., 12:00-14:00, 18:00-06:00"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="violations">Violations Detected</Label>
                    <Textarea 
                      id="violations"
                      placeholder="List any violations found during analysis..."
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAnalysisDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Collect analysis data and save
                    const analysisData = {
                      driving_periods: [], // Parse from textarea
                      rest_periods: [], // Parse from textarea
                      work_periods: [],
                      availability_periods: [],
                      break_periods: [],
                      violations: [], // Parse from textarea
                      notes: (document.getElementById('analysis_notes') as HTMLTextAreaElement)?.value || ''
                    };
                    
                    analysisMutation.mutate({
                      chartId: selectedChart.id,
                      analysisData
                    });
                  }}
                  disabled={analysisMutation.isPending}
                >
                  {analysisMutation.isPending ? 'Saving...' : 'Save Analysis'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalogTachographManager;

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Fuel, 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  MapPin,
  Car,
  Zap,
  AlertTriangle,
  RefreshCw,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { useFuelPurchases, useCreateFuelPurchase, useUpdateFuelPurchase, useDeleteFuelPurchase, useFuelStatistics, type FuelPurchaseWithDetails, type CreateFuelPurchaseData } from '@/hooks/useFuelPurchases';
import { useVehicles } from '@/hooks/useVehicles';

const DriverFuelSystem: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('new-purchase');
  const [searchTerm, setSearchTerm] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<FuelPurchaseWithDetails | null>(null);
  const [viewingPurchase, setViewingPurchase] = useState<FuelPurchaseWithDetails | null>(null);

  // Fetch real data from backend
  const { data: fuelPurchases = [], isLoading: fuelLoading, error, refetch } = useFuelPurchases();
  const { data: vehicles = [] } = useVehicles();
  const createFuelPurchase = useCreateFuelPurchase();
  const updateFuelPurchase = useUpdateFuelPurchase();
  const deleteFuelPurchase = useDeleteFuelPurchase();
  const { statistics } = useFuelStatistics();

  // Form state for new purchase
  const [formData, setFormData] = useState<CreateFuelPurchaseData>({
    vehicle_id: '',
    fuel_type: 'diesel',
    quantity: 0,
    unit_price: 0,
    total_cost: 0,
    location: '',
    odometer_reading: 0,
    purchase_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  if (authLoading || fuelLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading fuel system...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Authentication Required</h3>
          <p className="text-red-700">Please log in to access the fuel system.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Fuel Data</h3>
          <p className="text-red-700 mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const filteredPurchases = fuelPurchases.filter(purchase => {
    const matchesSearch = purchase.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFuelType = fuelTypeFilter === 'all' || purchase.fuel_type === fuelTypeFilter;
    return matchesSearch && matchesFuelType;
  });

  const getFuelTypeBadge = (type: string) => {
    switch (type) {
      case 'diesel':
        return <Badge variant="outline" className="text-blue-600">Diesel</Badge>;
      case 'petrol':
        return <Badge variant="outline" className="text-green-600">Petrol</Badge>;
      case 'electric':
        return <Badge variant="outline" className="text-purple-600">Electric</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleAddPurchase = () => {
    setFormData({
      vehicle_id: '',
      fuel_type: 'diesel',
      quantity: 0,
      unit_price: 0,
      total_cost: 0,
      location: '',
      odometer_reading: 0,
      purchase_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowAddDialog(true);
  };

  const handleEditPurchase = (purchase: FuelPurchaseWithDetails) => {
    setEditingPurchase(purchase);
    setFormData({
      vehicle_id: purchase.vehicle_id,
      fuel_type: purchase.fuel_type,
      quantity: Number(purchase.quantity),
      unit_price: Number(purchase.unit_price),
      total_cost: Number(purchase.total_cost),
      location: purchase.location || '',
      odometer_reading: purchase.odometer_reading || 0,
      purchase_date: purchase.purchase_date,
      notes: purchase.notes || ''
    });
    setShowAddDialog(true);
  };

  const handleViewPurchase = (purchase: FuelPurchaseWithDetails) => {
    setViewingPurchase(purchase);
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    if (confirm('Are you sure you want to delete this fuel purchase?')) {
      try {
        await deleteFuelPurchase.mutateAsync(purchaseId);
      } catch (error) {
        // Error is handled by the hook
      }
    }
  };

  const handleSubmitPurchase = async () => {
    try {
      if (editingPurchase) {
        await updateFuelPurchase.mutateAsync({
          id: editingPurchase.id,
          updates: formData
        });
      } else {
        await createFuelPurchase.mutateAsync(formData);
      }
      setShowAddDialog(false);
      setEditingPurchase(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleFormChange = (field: keyof CreateFuelPurchaseData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate total cost
      if (field === 'quantity' || field === 'unit_price') {
        updated.total_cost = Number(updated.quantity) * Number(updated.unit_price);
      }
      
      return updated;
    });
  };

  const handleExportData = () => {
    const csvContent = [
      ['Date', 'Vehicle', 'License Plate', 'Fuel Type', 'Quantity (L)', 'Unit Price (£)', 'Total Cost (£)', 'Location', 'Odometer', 'Notes'],
      ...filteredPurchases.map(purchase => [
        purchase.purchase_date,
        purchase.vehicle_number || '',
        purchase.license_plate || '',
        purchase.fuel_type,
        purchase.quantity,
        purchase.unit_price,
        purchase.total_cost,
        purchase.location || '',
        purchase.odometer_reading || '',
        purchase.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel-purchases-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Fuel purchase data exported to CSV",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuel System</h1>
          <p className="text-muted-foreground">
            Record fuel purchases and track consumption
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => refetch()} variant="outline" size="sm" disabled={fuelLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${fuelLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddPurchase}>
            <Plus className="w-4 h-4 mr-2" />
            Add Purchase
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{statistics.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fuel</CardTitle>
            <Fuel className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statistics.totalQuantity.toFixed(1)}L
            </div>
            <p className="text-xs text-muted-foreground">
              Liters purchased
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              £{statistics.averagePrice.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per liter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchases</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fuelPurchases.length}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new-purchase">New Purchase</TabsTrigger>
          <TabsTrigger value="history">Purchase History</TabsTrigger>
        </TabsList>

        <TabsContent value="new-purchase" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Fuel className="w-5 h-5" />
                <span>Record Fuel Purchase</span>
              </CardTitle>
              <CardDescription>
                Add a new fuel purchase for your assigned vehicle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Select Vehicle</Label>
                  <Select onValueChange={(value) => handleFormChange('vehicle_id', value)} value={formData.vehicle_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.vehicle_number} - {vehicle.license_plate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuel-type">Fuel Type</Label>
                  <Select onValueChange={(value) => handleFormChange('fuel_type', value)} value={formData.fuel_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (Liters/kWh)</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    placeholder="0.00"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => handleFormChange('quantity', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-price">Unit Price (£)</Label>
                  <Input 
                    id="unit-price" 
                    type="number" 
                    placeholder="0.00"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => handleFormChange('unit_price', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total-cost">Total Cost (£)</Label>
                  <Input 
                    id="total-cost" 
                    type="number" 
                    placeholder="0.00"
                    step="0.01"
                    value={formData.total_cost}
                    onChange={(e) => handleFormChange('total_cost', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="Fuel station name and location"
                    value={formData.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="odometer">Odometer Reading</Label>
                  <Input 
                    id="odometer" 
                    type="number" 
                    placeholder="Current mileage"
                    value={formData.odometer_reading}
                    onChange={(e) => handleFormChange('odometer_reading', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any additional notes about this purchase..."
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSubmitPurchase}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingPurchase ? 'Update Purchase' : 'Record Purchase'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fuel Efficiency Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span>Fuel Efficiency Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-start space-x-3">
                  <Car className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Smooth Driving</h4>
                    <p className="text-sm text-muted-foreground">
                      Avoid rapid acceleration and braking to improve fuel efficiency
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Regular Maintenance</h4>
                    <p className="text-sm text-muted-foreground">
                      Keep tires properly inflated and engine well-maintained
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingDown className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Reduce Idling</h4>
                    <p className="text-sm text-muted-foreground">
                      Turn off engine when parked for more than 30 seconds
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>
                View and manage your fuel purchase history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by vehicle, location, or notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <Label htmlFor="fuel-type-filter">Fuel Type</Label>
                  <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Fuel Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{purchase.vehicle_number}</div>
                          <div className="text-sm text-muted-foreground">{purchase.license_plate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{format(new Date(purchase.purchase_date), 'MMM dd, yyyy')}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(purchase.created_at), 'HH:mm')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getFuelTypeBadge(purchase.fuel_type)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {purchase.fuel_type === 'electric' ? `${purchase.quantity}kWh` : `${purchase.quantity}L`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            £{purchase.unit_price.toFixed(2)}/unit
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">£{purchase.total_cost.toFixed(2)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {purchase.location}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewPurchase(purchase)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditPurchase(purchase)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePurchase(purchase.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredPurchases.length === 0 && (
                <div className="text-center py-8">
                  <Fuel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No fuel purchases found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || fuelTypeFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Record your first fuel purchase to see it here'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Purchase Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPurchase ? 'Edit Fuel Purchase' : 'Add Fuel Purchase'}</DialogTitle>
            <DialogDescription>
              Record a new fuel purchase for your vehicle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {editingPurchase && (
              <div className="flex items-center space-x-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                <p>Editing existing purchase: {editingPurchase.vehicle_number} - {editingPurchase.license_plate}</p>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vehicle">Select Vehicle</Label>
                <Select onValueChange={(value) => handleFormChange('vehicle_id', value)} value={formData.vehicle_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.vehicle_number} - {vehicle.license_plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel-type">Fuel Type</Label>
                <Select onValueChange={(value) => handleFormChange('fuel_type', value)} value={formData.fuel_type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (Liters/kWh)</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  placeholder="0.00"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => handleFormChange('quantity', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit-price">Unit Price (£)</Label>
                <Input 
                  id="unit-price" 
                  type="number" 
                  placeholder="0.00"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => handleFormChange('unit_price', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total-cost">Total Cost (£)</Label>
                <Input 
                  id="total-cost" 
                  type="number" 
                  placeholder="0.00"
                  step="0.01"
                  value={formData.total_cost}
                  onChange={(e) => handleFormChange('total_cost', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="Fuel station name and location"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="odometer">Odometer Reading</Label>
                <Input 
                  id="odometer" 
                  type="number" 
                  placeholder="Current mileage"
                  value={formData.odometer_reading}
                  onChange={(e) => handleFormChange('odometer_reading', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Any additional notes about this purchase..."
                rows={3}
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSubmitPurchase}>
                <Save className="w-4 h-4 mr-2" />
                {editingPurchase ? 'Update Purchase' : 'Record Purchase'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Purchase Dialog */}
      <Dialog open={!!viewingPurchase} onOpenChange={setViewingPurchase}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>View Fuel Purchase</DialogTitle>
            <DialogDescription>
              Details of a specific fuel purchase
            </DialogDescription>
          </DialogHeader>
          {viewingPurchase ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Vehicle</Label>
                  <div className="font-medium">{viewingPurchase.vehicle_number}</div>
                  <div className="text-sm text-muted-foreground">License Plate: {viewingPurchase.license_plate}</div>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <div className="font-medium">{format(new Date(viewingPurchase.purchase_date), 'MMM dd, yyyy')}</div>
                  <div className="text-sm text-muted-foreground">Created: {format(new Date(viewingPurchase.created_at), 'MMM dd, yyyy HH:mm')}</div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Fuel Type</Label>
                  <Badge variant="outline">{viewingPurchase.fuel_type}</Badge>
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <div className="font-medium">
                    {viewingPurchase.fuel_type === 'electric' ? `${viewingPurchase.quantity}kWh` : `${viewingPurchase.quantity}L`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    £{viewingPurchase.unit_price.toFixed(2)}/unit
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Total Cost</Label>
                  <div className="font-medium">£{viewingPurchase.total_cost.toFixed(2)}</div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="font-medium">{viewingPurchase.location}</div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Odometer Reading</Label>
                  <div className="font-medium">{viewingPurchase.odometer_reading || 'N/A'}</div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <div className="font-medium">{viewingPurchase.notes || 'No notes'}</div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setViewingPurchase(null)}>
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Fuel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No purchase selected for viewing.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverFuelSystem;


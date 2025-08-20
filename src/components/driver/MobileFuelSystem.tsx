import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  X,
  Gauge,
  CreditCard,
  Receipt,
  BarChart3
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useFuelPurchases, useCreateFuelPurchase, useUpdateFuelPurchase, useDeleteFuelPurchase, useFuelStatistics, type FuelPurchaseWithDetails, type CreateFuelPurchaseData } from '@/hooks/useFuelPurchases';
import { useVehicles } from '@/hooks/useVehicles';
import { useToast } from '@/hooks/use-toast';
import MobileOptimizedLayout from '@/components/mobile/MobileOptimizedLayout';

export default function MobileFuelSystem() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('purchases');
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

  // Filter purchases based on search and filters
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

  if (fuelLoading) {
    return (
      <MobileOptimizedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-lg">Loading fuel system...</p>
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  if (error) {
    return (
      <MobileOptimizedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
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
      </MobileOptimizedLayout>
    );
  }

  return (
    <MobileOptimizedLayout>
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Fuel System</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage fuel purchases and track consumption
            </p>
          </div>
          <Button size="sm" className="ml-4 flex-shrink-0" onClick={handleAddPurchase}>
            <Plus className="w-4 h-4 mr-2" />
            Add Fuel
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{fuelPurchases.length}</div>
                <p className="text-sm text-muted-foreground">Total Purchases</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  £{statistics?.totalSpent?.toFixed(2) || '0.00'}
                </div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {statistics?.totalLiters?.toFixed(1) || '0.0'}L
                </div>
                <p className="text-sm text-muted-foreground">Total Fuel</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  £{statistics?.averagePricePerLiter?.toFixed(2) || '0.00'}
                </div>
                <p className="text-sm text-muted-foreground">Avg Price/L</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="purchases" className="text-xs">
              Purchases
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-4">
            {/* Search and Filter */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search purchases"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
                    <SelectTrigger>
                      <Fuel className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Fuel Purchases */}
            {filteredPurchases.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Fuel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No fuel purchases found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || fuelTypeFilter !== 'all' 
                        ? 'No purchases match your search criteria'
                        : 'You haven\'t recorded any fuel purchases yet'
                      }
                    </p>
                    <Button onClick={handleAddPurchase}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Purchase
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredPurchases.map((purchase) => (
                  <Card key={purchase.id} className="overflow-hidden">
                    <CardContent className="p-4 space-y-4">
                      {/* Header with Vehicle and Fuel Type */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 pr-4">
                          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                            {purchase.vehicle_number || 'Unknown Vehicle'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {purchase.license_plate || 'No license plate'}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          {getFuelTypeBadge(purchase.fuel_type)}
                          <Badge variant="outline" className="text-green-600">
                            £{Number(purchase.total_cost).toFixed(2)}
                          </Badge>
                        </div>
                      </div>

                      {/* Purchase Details */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {format(parseISO(purchase.purchase_date), 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-2">
                            <Gauge className="w-4 h-4 text-gray-400" />
                            {purchase.odometer_reading?.toLocaleString() || 'N/A'} km
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {purchase.location || 'Location not specified'}
                          </span>
                          <span className="flex items-center gap-2">
                            <Fuel className="w-4 h-4 text-gray-400" />
                            {Number(purchase.quantity).toFixed(1)}L
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      {purchase.notes && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600">{purchase.notes}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewPurchase(purchase)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditPurchase(purchase)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeletePurchase(purchase.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Fuel Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-1">Monthly Average</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      £{statistics?.monthlyAverage?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-sm text-blue-600">per month</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-1">Efficiency</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {statistics?.averageEfficiency?.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-sm text-green-600">km/L</p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-1">Best Price</h4>
                    <p className="text-2xl font-bold text-orange-600">
                      £{statistics?.bestPricePerLiter?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-sm text-orange-600">per liter</p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-1">Total Distance</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {statistics?.totalDistance?.toFixed(0) || '0'}
                    </p>
                    <p className="text-sm text-purple-600">km</p>
                  </div>
                </div>
                
                <Button className="w-full mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  Export Analytics Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Fuel System Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <h4 className="font-medium text-yellow-800 mb-2">Fuel Alerts</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Low fuel level notifications</li>
                      <li>• Price change alerts</li>
                      <li>• Maintenance reminders</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-medium text-blue-800 mb-2">Data Management</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Auto-sync with vehicle systems</li>
                      <li>• Backup fuel purchase history</li>
                      <li>• Export data for reporting</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <h4 className="font-medium text-green-800 mb-2">Preferences</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Default fuel type</li>
                      <li>• Preferred fuel stations</li>
                      <li>• Currency settings</li>
                    </ul>
                  </div>
                </div>
                
                <Button className="w-full mt-4">
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Fuel Purchase Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPurchase ? 'Edit Fuel Purchase' : 'Add New Fuel Purchase'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select value={formData.vehicle_id} onValueChange={(value) => handleFormChange('vehicle_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
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

              <div>
                <Label htmlFor="fuel_type">Fuel Type</Label>
                <Select value={formData.fuel_type} onValueChange={(value) => handleFormChange('fuel_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity (L)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => handleFormChange('quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="unit_price">Unit Price (£)</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => handleFormChange('unit_price', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="total_cost">Total Cost (£)</Label>
                <Input
                  id="total_cost"
                  type="number"
                  step="0.01"
                  value={formData.total_cost}
                  onChange={(e) => handleFormChange('total_cost', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  placeholder="Fuel station name"
                />
              </div>

              <div>
                <Label htmlFor="odometer">Odometer Reading (km)</Label>
                <Input
                  id="odometer"
                  type="number"
                  value={formData.odometer_reading}
                  onChange={(e) => handleFormChange('odometer_reading', parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => handleFormChange('purchase_date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmitPurchase} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {editingPurchase ? 'Update' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Purchase Details Dialog */}
        <Dialog open={!!viewingPurchase} onOpenChange={() => setViewingPurchase(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Fuel Purchase Details</DialogTitle>
            </DialogHeader>
            {viewingPurchase && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Vehicle:</span>
                    <p>{viewingPurchase.vehicle_number}</p>
                  </div>
                  <div>
                    <span className="font-medium">License Plate:</span>
                    <p>{viewingPurchase.license_plate}</p>
                  </div>
                  <div>
                    <span className="font-medium">Fuel Type:</span>
                    <p>{getFuelTypeBadge(viewingPurchase.fuel_type)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Quantity:</span>
                    <p>{Number(viewingPurchase.quantity).toFixed(1)}L</p>
                  </div>
                  <div>
                    <span className="font-medium">Unit Price:</span>
                    <p>£{Number(viewingPurchase.unit_price).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Total Cost:</span>
                    <p>£{Number(viewingPurchase.total_cost).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>
                    <p>{viewingPurchase.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Odometer:</span>
                    <p>{viewingPurchase.odometer_reading?.toLocaleString() || 'N/A'} km</p>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>
                    <p>{format(parseISO(viewingPurchase.purchase_date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                
                {viewingPurchase.notes && (
                  <div>
                    <span className="font-medium">Notes:</span>
                    <p className="text-sm text-gray-600 mt-1">{viewingPurchase.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MobileOptimizedLayout>
  );
}

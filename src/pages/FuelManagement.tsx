import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  BarChart3,
  Filter
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useFuelPurchases, useCreateFuelPurchase, useUpdateFuelPurchase, useDeleteFuelPurchase, useFuelStatistics, type FuelPurchaseWithDetails, type CreateFuelPurchaseData } from '@/hooks/useFuelPurchases';
import { useVehicles } from '@/hooks/useVehicles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const FuelManagement = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
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

  // For now, use the same data for all users since the admin view needs the fuel_purchases table in types
  const allFuelPurchases = fuelPurchases;

  // Form state for new purchase
  const [formData, setFormData] = useState({
    vehicle_id: '',
    fuel_type: 'diesel' as 'diesel' | 'petrol' | 'electric',
    quantity: 0,
    unit_price: 0,
    total_cost: 0,
    location: '',
    odometer_reading: 0,
    purchase_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only admins, council, and drivers can access
  if (!['admin', 'council', 'driver'].includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  // Use appropriate data based on user role
  const displayPurchases = ['admin', 'council'].includes(profile.role) ? allFuelPurchases : fuelPurchases;
  const isLoading = fuelLoading;

  // Filter purchases
  const filteredPurchases = displayPurchases.filter(purchase => {
    const matchesSearch = 
      purchase.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.driver_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFuelType = fuelTypeFilter === 'all' || purchase.fuel_type === fuelTypeFilter;
    
    return matchesSearch && matchesFuelType;
  });

  const getFuelTypeBadge = (fuelType: string) => {
    const colors = {
      diesel: 'bg-blue-100 text-blue-800',
      petrol: 'bg-green-100 text-green-800',
      electric: 'bg-purple-100 text-purple-800'
    };
    return (
      <Badge className={colors[fuelType as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {fuelType.charAt(0).toUpperCase() + fuelType.slice(1)}
      </Badge>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPurchase) {
        await updateFuelPurchase.mutateAsync({
          id: editingPurchase.id,
          updates: formData as any
        });
        setEditingPurchase(null);
      } else {
        await createFuelPurchase.mutateAsync(formData as any);
      }
      
      setShowAddDialog(false);
      setFormData({
        vehicle_id: '',
        fuel_type: 'diesel' as 'diesel' | 'petrol' | 'electric',
        quantity: 0,
        unit_price: 0,
        total_cost: 0,
        location: '',
        odometer_reading: 0,
        purchase_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (error) {
      console.error('Error saving fuel purchase:', error);
    }
  };

  const handleEdit = (purchase: FuelPurchaseWithDetails) => {
    setEditingPurchase(purchase);
    setFormData({
      vehicle_id: purchase.vehicle_id,
      fuel_type: purchase.fuel_type,
      quantity: purchase.quantity,
      unit_price: purchase.unit_price,
      total_cost: purchase.total_cost,
      location: purchase.location || '',
      odometer_reading: purchase.odometer_reading || 0,
      purchase_date: purchase.purchase_date,
      notes: purchase.notes || ''
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this fuel purchase?')) {
      await deleteFuelPurchase.mutateAsync(id);
    }
  };

  return (
    <PageLayout
      title="Fuel Management"
      description="Track and manage fuel consumption, costs, and efficiency"
      actionButton={{
        label: "Add Purchase",
        onClick: () => setShowAddDialog(true),
        icon: <Plus className="w-4 h-4 mr-2" />
      }}
      summaryCards={[
        {
          title: "Total Spent",
          value: `£${statistics.totalSpent.toFixed(2)}`,
          icon: <DollarSign className="h-4 w-4" />,
          color: "text-green-600"
        },
        {
          title: "Total Fuel",
          value: `${statistics.totalQuantity.toFixed(1)}L`,
          icon: <Fuel className="h-4 w-4" />,
          color: "text-blue-600"
        },
        {
          title: "Avg Price/L",
          value: `£${statistics.averagePrice.toFixed(2)}`,
          icon: <TrendingUp className="h-4 w-4" />,
          color: "text-orange-600"
        },
        {
          title: "Purchases",
          value: statistics.purchaseCount,
          icon: <BarChart3 className="h-4 w-4" />,
          color: "text-purple-600"
        }
      ]}
      searchPlaceholder="Search purchases..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          label: "All Fuel Types",
          value: fuelTypeFilter,
          options: [
            { value: "all", label: "All Types" },
            { value: "diesel", label: "Diesel" },
            { value: "petrol", label: "Petrol" },
            { value: "electric", label: "Electric" }
          ],
          onChange: setFuelTypeFilter
        }
      ]}
      tabs={[
        { value: "overview", label: "Overview" },
        { value: "purchases", label: "Purchase History" },
        { value: "analytics", label: "Analytics" }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={isLoading}
    >
      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Fuel Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPurchases.length === 0 ? (
              <div className="text-center py-8">
                <Fuel className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No fuel purchases found</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your fuel consumption by adding your first purchase.
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Purchase
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPurchases.slice(0, 5).map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Fuel className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{purchase.vehicle_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(purchase.purchase_date), 'MMM dd, yyyy')} • {purchase.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">£{purchase.total_cost.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{purchase.quantity}L {purchase.fuel_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'purchases' && (
        <Card>
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  {['admin', 'council'].includes(profile.role) && <TableHead>Driver</TableHead>}
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
                    {['admin', 'council'].includes(profile.role) && (
                      <TableCell>{purchase.driver_name}</TableCell>
                    )}
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
                        <div className="font-medium">{purchase.quantity}L</div>
                        <div className="text-sm text-muted-foreground">£{purchase.unit_price}/L</div>
                      </div>
                    </TableCell>
                    <TableCell>£{purchase.total_cost.toFixed(2)}</TableCell>
                    <TableCell>{purchase.location}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingPurchase(purchase)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(purchase)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(purchase.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(statistics.byFuelType).map(([type, data]) => (
                <div key={type} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    {getFuelTypeBadge(type)}
                    <span className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{data.quantity.toFixed(1)}L</div>
                    <div className="text-sm text-muted-foreground">£{data.cost.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(statistics.monthlyData).slice(0, 6).map(([month, data]) => (
                <div key={month} className="flex items-center justify-between py-2">
                  <span className="font-medium">{format(new Date(month + '-01'), 'MMM yyyy')}</span>
                  <div className="text-right">
                    <div className="font-medium">{data.quantity.toFixed(1)}L</div>
                    <div className="text-sm text-muted-foreground">£{data.cost.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Purchase Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPurchase ? 'Edit Fuel Purchase' : 'Add Fuel Purchase'}
              </DialogTitle>
              <DialogDescription>
                Record a new fuel purchase for your vehicle.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select value={formData.vehicle_id} onValueChange={(value) => setFormData({...formData, vehicle_id: value})}>
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

              <div className="space-y-2">
                <Label htmlFor="fuel_type">Fuel Type</Label>
                <Select value={formData.fuel_type} onValueChange={(value: any) => setFormData({...formData, fuel_type: value})}>
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
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (L)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit_price">Price per L</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({...formData, unit_price: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_cost">Total Cost</Label>
                <Input
                  id="total_cost"
                  type="number"
                  step="0.01"
                  value={formData.total_cost}
                  onChange={(e) => setFormData({...formData, total_cost: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Fuel station name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createFuelPurchase.isPending || updateFuelPurchase.isPending}>
                  {createFuelPurchase.isPending || updateFuelPurchase.isPending ? 'Saving...' : 'Save Purchase'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Purchase Dialog */}
        <Dialog open={!!viewingPurchase} onOpenChange={() => setViewingPurchase(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fuel Purchase Details</DialogTitle>
            </DialogHeader>
            {viewingPurchase && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Vehicle</Label>
                    <p>{viewingPurchase.vehicle_number} - {viewingPurchase.license_plate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fuel Type</Label>
                    <p>{getFuelTypeBadge(viewingPurchase.fuel_type)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Quantity</Label>
                    <p>{viewingPurchase.quantity}L</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Unit Price</Label>
                    <p>£{viewingPurchase.unit_price}/L</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Cost</Label>
                    <p>£{viewingPurchase.total_cost.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Purchase Date</Label>
                    <p>{format(new Date(viewingPurchase.purchase_date), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <p>{viewingPurchase.location || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Odometer</Label>
                    <p>{viewingPurchase.odometer_reading || 'N/A'}</p>
                  </div>
                </div>
                {viewingPurchase.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm text-muted-foreground">{viewingPurchase.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
    </PageLayout>
  );
};

export default FuelManagement;
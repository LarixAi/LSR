import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Circle, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  BarChart3,
  Settings,
  FileText,
  Calendar,
  MapPin,
  Activity,
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useTireInventory, useVehicleTires, useCreateTireInventory, useUpdateVehicleTire, useTireStats } from '@/hooks/useTires';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '@/components/layout/PageLayout';

export default function TireManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedTire, setSelectedTire] = useState<any>(null);

  // Fetch tire data
  const { data: tireInventory, isLoading: inventoryLoading } = useTireInventory();
  const { data: vehicleTires, isLoading: vehicleTiresLoading } = useVehicleTires();

  // Mutations
  const addTireMutation = useCreateTireInventory();
  const updateTireMutation = useUpdateVehicleTire();
  // Note: Delete function not available in current hook, will implement later

  // Filter tire inventory
  const filteredInventory = tireInventory?.filter(tire =>
    tire.tire_brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tire.tire_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tire.tire_size.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate statistics
  const totalTires = tireInventory?.length || 0;
  const lowStockTires = tireInventory?.filter(tire => tire.stock_quantity <= tire.minimum_stock).length || 0;
  const outOfStockTires = tireInventory?.filter(tire => tire.stock_quantity === 0).length || 0;
  const totalValue = tireInventory?.reduce((sum, tire) => sum + (tire.stock_quantity * (tire.cost_per_tire || 0)), 0) || 0;

  // Vehicle tire statistics
  const activeVehicleTires = vehicleTires?.filter(tire => tire.status === 'active').length || 0;
  const wornTires = vehicleTires?.filter(tire => tire.status === 'worn').length || 0;
  const damagedTires = vehicleTires?.filter(tire => tire.status === 'damaged').length || 0;

  const handleAddTire = async (tireData: any) => {
    try {
      await addTireMutation.mutateAsync(tireData);
      setShowAddDialog(false);
      toast({
        title: "Tire Added",
        description: "New tire has been added to inventory successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tire to inventory.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTire = async (tireId: string, updates: any) => {
    try {
      await updateTireMutation.mutateAsync({ id: tireId, updates });
      toast({
        title: "Tire Updated",
        description: "Tire information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tire information.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTire = async (tireId: string) => {
    // Delete functionality not implemented in current hook
    toast({
      title: "Not Available",
      description: "Delete functionality will be implemented soon.",
      variant: "destructive",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'worn':
        return <Badge className="bg-yellow-100 text-yellow-800">Worn</Badge>;
      case 'damaged':
        return <Badge className="bg-red-100 text-red-800">Damaged</Badge>;
      case 'replaced':
        return <Badge className="bg-gray-100 text-gray-800">Replaced</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (inventoryLoading || vehicleTiresLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading tire management...</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      title="Tire Management"
      description="Track tire inventory, vehicle tires, and maintenance schedules"
      actionButton={{
        label: "Add Tire to Inventory",
        onClick: () => setShowAddDialog(true),
        icon: <Plus className="w-4 h-4" />
      }}
      summaryCards={[
        {
          title: "Total Tires in Stock",
          value: totalTires,
          icon: <Circle className="h-4 w-4" />,
          color: "text-blue-600"
        },
        {
          title: "Low Stock Alert",
          value: lowStockTires,
          icon: <AlertTriangle className="h-4 w-4" />,
          color: "text-yellow-600"
        },
        {
          title: "Active Vehicle Tires",
          value: activeVehicleTires,
          icon: <CheckCircle className="h-4 w-4" />,
          color: "text-green-600"
        },
        {
          title: "Total Inventory Value",
          value: `$${totalValue.toLocaleString()}`,
          icon: <DollarSign className="h-4 w-4" />,
          color: "text-purple-600"
        }
      ]}
      searchPlaceholder="Search tires..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          label: "All Types",
          value: filterType,
          options: [
            { value: "all", label: "All Types" },
            { value: "drive", label: "Drive" },
            { value: "steer", label: "Steer" },
            { value: "trailer", label: "Trailer" },
            { value: "all_position", label: "All Position" }
          ],
          onChange: setFilterType
        }
      ]}
      tabs={[
        { value: "inventory", label: "Tire Inventory" },
        { value: "vehicles", label: "Vehicle Tires" },
        { value: "maintenance", label: "Maintenance Schedule" },
        { value: "analytics", label: "Analytics" }
      ]}
      activeTab="inventory"
      onTabChange={() => {}}
      isLoading={inventoryLoading || vehicleTiresLoading}
    >

            {/* Content based on active tab */}
      {activeTab === 'inventory' && (
        <Card>
          <CardHeader>
            <CardTitle>Tire Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand & Model</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((tire) => (
                  <TableRow key={tire.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tire.tire_brand}</p>
                        <p className="text-sm text-gray-500">{tire.tire_model}</p>
                      </div>
                    </TableCell>
                    <TableCell>{tire.tire_size}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tire.tire_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={tire.stock_quantity <= tire.minimum_stock ? 'text-red-600 font-medium' : ''}>
                          {tire.stock_quantity}
                        </span>
                        {tire.stock_quantity <= tire.minimum_stock && (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>${tire.cost_per_tire?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>
                      {tire.stock_quantity === 0 ? (
                        <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
                      ) : tire.stock_quantity <= tire.minimum_stock ? (
                        <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTire(tire)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTire(tire.id)}
                        >
                          Delete
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
            {activeTab === 'vehicles' && (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Tire Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Tire Details</TableHead>
                  <TableHead>Installation Date</TableHead>
                  <TableHead>Tread Depth</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Inspection</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicleTires?.map((tire) => (
                  <TableRow key={tire.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tire.vehicle?.vehicle_number}</p>
                        <p className="text-sm text-gray-500">{tire.vehicle?.make} {tire.vehicle?.model}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tire.position.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tire.tire_inventory?.tire_brand} {tire.tire_inventory?.tire_model}</p>
                        <p className="text-sm text-gray-500">{tire.tire_inventory?.tire_size}</p>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(tire.installation_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={tire.current_tread_depth && tire.current_tread_depth < 4 ? 'text-red-600 font-medium' : ''}>
                          {tire.current_tread_depth || 'N/A'} mm
                        </span>
                        {tire.current_tread_depth && tire.current_tread_depth < 4 && (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(tire.status)}</TableCell>
                    <TableCell>
                      {tire.next_inspection_due ? (
                        <div className="flex items-center gap-2">
                          <span className={new Date(tire.next_inspection_due) < new Date() ? 'text-red-600 font-medium' : ''}>
                            {new Date(tire.next_inspection_due).toLocaleDateString()}
                          </span>
                          {new Date(tire.next_inspection_due) < new Date() && (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      ) : (
                        'Not set'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'maintenance' && (
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Overdue Inspections
                </h3>
                <div className="space-y-2">
                  {vehicleTires?.filter(tire => 
                    tire.next_inspection_due && new Date(tire.next_inspection_due) < new Date()
                  ).map((tire) => (
                    <div key={tire.id} className="p-3 border border-red-200 rounded-lg bg-red-50">
                      <p className="font-medium">{tire.vehicle?.vehicle_number} - {tire.position}</p>
                      <p className="text-sm text-red-600">
                        Due: {new Date(tire.next_inspection_due).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-yellow-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Upcoming Inspections
                </h3>
                <div className="space-y-2">
                  {vehicleTires?.filter(tire => 
                    tire.next_inspection_due && 
                    new Date(tire.next_inspection_due) > new Date() &&
                    new Date(tire.next_inspection_due) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  ).map((tire) => (
                    <div key={tire.id} className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                      <p className="font-medium">{tire.vehicle?.vehicle_number} - {tire.position}</p>
                      <p className="text-sm text-yellow-600">
                        Due: {new Date(tire.next_inspection_due).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Recent Activities
                </h3>
                <div className="space-y-2">
                  {vehicleTires?.filter(tire => 
                    tire.status === 'replaced' || tire.status === 'rotated'
                  ).slice(0, 5).map((tire) => (
                    <div key={tire.id} className="p-3 border border-green-200 rounded-lg bg-green-50">
                      <p className="font-medium">{tire.vehicle?.vehicle_number} - {tire.position}</p>
                      <p className="text-sm text-green-600 capitalize">{tire.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tire Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Active Tires</span>
                  <Badge className="bg-green-100 text-green-800">{activeVehicleTires}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Worn Tires</span>
                  <Badge className="bg-yellow-100 text-yellow-800">{wornTires}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Damaged Tires</span>
                  <Badge className="bg-red-100 text-red-800">{damagedTires}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Low Stock Items</span>
                  <Badge className="bg-yellow-100 text-yellow-800">{lowStockTires}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Out of Stock</span>
                  <Badge className="bg-red-100 text-red-800">{outOfStockTires}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Value</span>
                  <Badge className="bg-blue-100 text-blue-800">${totalValue.toLocaleString()}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
            {/* Edit Tire Dialog */}
      {selectedTire && (
        <Dialog open={!!selectedTire} onOpenChange={() => setSelectedTire(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Tire Information</DialogTitle>
            </DialogHeader>
            <EditTireForm 
              tire={selectedTire} 
              onSubmit={(updates) => {
                handleUpdateTire(selectedTire.id, updates);
                setSelectedTire(null);
              }} 
              onCancel={() => setSelectedTire(null)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </PageLayout>
  );
}

// Add Tire Form Component
function AddTireForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    tire_brand: '',
    tire_model: '',
    tire_size: '',
    tire_type: 'all_position' as 'drive' | 'steer' | 'trailer' | 'all_position',
    load_index: '',
    speed_rating: '',
    stock_quantity: '',
    minimum_stock: '',
    cost_per_tire: '',
    supplier: '',
    warranty_months: '',
    location_storage: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      load_index: parseInt(formData.load_index) || 0,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      minimum_stock: parseInt(formData.minimum_stock) || 0,
      cost_per_tire: parseFloat(formData.cost_per_tire) || 0,
      warranty_months: parseInt(formData.warranty_months) || 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Brand</label>
          <Input
            value={formData.tire_brand}
            onChange={(e) => setFormData({...formData, tire_brand: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Model</label>
          <Input
            value={formData.tire_model}
            onChange={(e) => setFormData({...formData, tire_model: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Size</label>
          <Input
            value={formData.tire_size}
            onChange={(e) => setFormData({...formData, tire_size: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Type</label>
          <Select value={formData.tire_type} onValueChange={(value: any) => setFormData({...formData, tire_type: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="drive">Drive</SelectItem>
              <SelectItem value="steer">Steer</SelectItem>
              <SelectItem value="trailer">Trailer</SelectItem>
              <SelectItem value="all_position">All Position</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Stock Quantity</label>
          <Input
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Minimum Stock</label>
          <Input
            type="number"
            value={formData.minimum_stock}
            onChange={(e) => setFormData({...formData, minimum_stock: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Cost per Tire</label>
          <Input
            type="number"
            step="0.01"
            value={formData.cost_per_tire}
            onChange={(e) => setFormData({...formData, cost_per_tire: e.target.value})}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Supplier</label>
          <Input
            value={formData.supplier}
            onChange={(e) => setFormData({...formData, supplier: e.target.value})}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Tire
        </Button>
      </div>
    </form>
  );
}

// Edit Tire Form Component
function EditTireForm({ tire, onSubmit, onCancel }: { tire: any; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    tire_brand: tire.tire_brand || '',
    tire_model: tire.tire_model || '',
    tire_size: tire.tire_size || '',
    tire_type: tire.tire_type || 'all_position',
    stock_quantity: tire.stock_quantity?.toString() || '',
    minimum_stock: tire.minimum_stock?.toString() || '',
    cost_per_tire: tire.cost_per_tire?.toString() || '',
    supplier: tire.supplier || '',
    location_storage: tire.location_storage || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      minimum_stock: parseInt(formData.minimum_stock) || 0,
      cost_per_tire: parseFloat(formData.cost_per_tire) || 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Brand</label>
          <Input
            value={formData.tire_brand}
            onChange={(e) => setFormData({...formData, tire_brand: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Model</label>
          <Input
            value={formData.tire_model}
            onChange={(e) => setFormData({...formData, tire_model: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Size</label>
          <Input
            value={formData.tire_size}
            onChange={(e) => setFormData({...formData, tire_size: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Type</label>
          <Select value={formData.tire_type} onValueChange={(value: any) => setFormData({...formData, tire_type: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="drive">Drive</SelectItem>
              <SelectItem value="steer">Steer</SelectItem>
              <SelectItem value="trailer">Trailer</SelectItem>
              <SelectItem value="all_position">All Position</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Stock Quantity</label>
          <Input
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Minimum Stock</label>
          <Input
            type="number"
            value={formData.minimum_stock}
            onChange={(e) => setFormData({...formData, minimum_stock: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Cost per Tire</label>
          <Input
            type="number"
            step="0.01"
            value={formData.cost_per_tire}
            onChange={(e) => setFormData({...formData, cost_per_tire: e.target.value})}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Supplier</label>
          <Input
            value={formData.supplier}
            onChange={(e) => setFormData({...formData, supplier: e.target.value})}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Update Tire
        </Button>
      </div>
    </form>
  );
}
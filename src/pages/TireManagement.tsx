import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useTireStats, useTireInventory, useVehicleTires } from '@/hooks/useTires';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CircleDot, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Package,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

const TireManagement = () => {
  const { user, profile, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Fetch real data from backend
  const { data: tireInventory = [], isLoading: inventoryLoading } = useTireInventory();
  const { data: vehicleTires = [], isLoading: vehicleTiresLoading } = useVehicleTires();
  const tireStats = useTireStats();

  if (loading || inventoryLoading || vehicleTiresLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading tire management...</p>
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

  // Helper functions for status display

  const getStockStatus = (current: number, minimum: number) => {
    if (current <= minimum) return 'critical';
    if (current <= minimum * 1.5) return 'low';
    return 'good';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Good</Badge>;
      case 'worn':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Worn</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Replace</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>;
      case 'low':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Low Stock</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CircleDot className="w-8 h-8 text-red-600" />
            Tire Management
          </h1>
          <p className="text-gray-600 mt-1">Manage tire inventory and vehicle tire tracking</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Tire Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Tire Stock</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" placeholder="e.g., Michelin" />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input id="model" placeholder="e.g., XZE" />
              </div>
              <div>
                <Label htmlFor="size">Size</Label>
                <Input id="size" placeholder="e.g., 295/80R22.5" />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tire type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="steer">Steer</SelectItem>
                    <SelectItem value="drive">Drive</SelectItem>
                    <SelectItem value="trailer">Trailer</SelectItem>
                    <SelectItem value="all_position">All Position</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="cost">Cost Per Tire</Label>
                <Input id="cost" type="number" step="0.01" placeholder="0.00" />
              </div>
              <Button className="w-full bg-red-600 hover:bg-red-700">Add to Inventory</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold">{tireStats.total_inventory}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600">{tireStats.low_stock_items}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Due for Replacement</p>
                <p className="text-2xl font-bold text-yellow-600">{tireStats.tires_due_inspection}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Monthly Cost</p>
                <p className="text-2xl font-bold">£{tireStats.total_stock_value.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
          <TabsTrigger value="vehicle-tires">Vehicle Tires</TabsTrigger>
          <TabsTrigger value="maintenance">Tire Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Tire Inventory
              </CardTitle>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search tires..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="steer">Steer Tires</SelectItem>
                    <SelectItem value="drive">Drive Tires</SelectItem>
                    <SelectItem value="trailer">Trailer Tires</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand & Model</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cost/Unit</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tireInventory.map((tire) => (
                    <TableRow key={tire.id}>
                      <TableCell className="font-medium">
                        {tire.brand} {tire.model}
                      </TableCell>
                      <TableCell>{tire.size}</TableCell>
                      <TableCell className="capitalize">{tire.type}</TableCell>
                      <TableCell>
                        {tire.stockQuantity} / {tire.minimumStock} min
                      </TableCell>
                      <TableCell>
                        {getStockBadge(getStockStatus(tire.stockQuantity, tire.minimumStock))}
                      </TableCell>
                      <TableCell>£{tire.costPerTire.toFixed(2)}</TableCell>
                      <TableCell>{tire.supplier}</TableCell>
                      <TableCell>{tire.location}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicle-tires" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleDot className="w-5 h-5" />
                Vehicle Tire Tracking
              </CardTitle>
              <div className="flex gap-4">
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vehicles</SelectItem>
                    <SelectItem value="LSR-001">LSR-001</SelectItem>
                    <SelectItem value="LSR-002">LSR-002</SelectItem>
                    <SelectItem value="LSR-003">LSR-003</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Tire Model</TableHead>
                    <TableHead>Installation Date</TableHead>
                    <TableHead>Tread Depth (mm)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Inspection</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleTires.map((tire) => (
                    <TableRow key={tire.id}>
                      <TableCell className="font-medium">{tire.vehicleNumber}</TableCell>
                      <TableCell>{tire.position}</TableCell>
                      <TableCell>{tire.tireModel}</TableCell>
                      <TableCell>{tire.installationDate}</TableCell>
                      <TableCell>{tire.currentTread}</TableCell>
                      <TableCell>{getStatusBadge(tire.status)}</TableCell>
                      <TableCell>{tire.nextInspection}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Replace
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Tire Maintenance Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Maintenance Tracking</h3>
                <p className="text-gray-600 mb-6">
                  Set up automatic reminders for tire rotations, inspections, and replacements.
                </p>
                <Button className="bg-red-600 hover:bg-red-700">
                  Configure Maintenance Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TireManagement;

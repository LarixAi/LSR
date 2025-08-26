import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  Plus,
  Search,
  Edit,
  Eye,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  ShoppingCart,
  Minus,
  BarChart3,
  FileText,
  MapPin,
  Phone,
  Settings
} from 'lucide-react';

interface Part {
  id: string;
  part_number: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit_price: number;
  supplier: string;
  supplier_contact: string;
  location: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order';
  last_ordered: string;
  next_order_date: string;
  created_at: string;
  updated_at: string;
}

interface InventoryTabProps {
  parts: Part[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddPart: () => void;
  onEditPart: (part: Part) => void;
  onViewPart: (part: Part) => void;
  onStockIn: (part: Part) => void;
  onStockOut: (part: Part) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  parts,
  searchTerm,
  onSearchChange,
  onAddPart,
  onEditPart,
  onViewPart,
  onStockIn,
  onStockOut,
  onRefresh,
  isLoading
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
      case 'low_stock':
        return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
      case 'on_order':
        return <Badge className="bg-blue-100 text-blue-800">On Order</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredParts = parts.filter(part =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = filteredParts.reduce((sum, part) => sum + (part.quantity * part.unit_price), 0);
  const totalParts = filteredParts.length;
  const lowStockCount = filteredParts.filter(part => part.status === 'low_stock').length;
  const outOfStockCount = filteredParts.filter(part => part.status === 'out_of_stock').length;

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parts by name, number, category, or supplier..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={onAddPart}>
            <Plus className="w-4 h-4 mr-2" />
            Add Part
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Parts</p>
                <p className="text-2xl font-bold">{totalParts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">£{totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Minus className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory ({filteredParts.length} parts)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading inventory...</p>
            </div>
          ) : filteredParts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No parts found</p>
              <Button onClick={onAddPart} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add First Part
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">
                      {part.part_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{part.name}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {part.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{part.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="font-medium">{part.quantity}</p>
                        <p className="text-xs text-muted-foreground">
                          Min: {part.min_quantity}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <p className="font-medium">£{part.unit_price.toFixed(2)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <p className="font-medium">£{(part.quantity * part.unit_price).toFixed(2)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(part.status)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm font-medium truncate">{part.supplier}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {part.supplier_contact}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{part.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewPart(part)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditPart(part)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStockIn(part)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStockOut(part)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Download className="w-6 h-6" />
              <div className="text-center">
                <p className="font-medium">Export Inventory</p>
                <p className="text-sm text-muted-foreground">Download CSV report</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Upload className="w-6 h-6" />
              <div className="text-center">
                <p className="font-medium">Import Parts</p>
                <p className="text-sm text-muted-foreground">Upload CSV file</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              <div className="text-center">
                <p className="font-medium">Inventory Report</p>
                <p className="text-sm text-muted-foreground">Generate analytics</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

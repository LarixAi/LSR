import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { usePartsInventory, CreatePartData } from '@/hooks/usePartsInventory';
import DefaultViewPageLayout from '@/components/layout/DefaultViewPageLayout';
import { Package, Save, Loader2, Wrench, Zap, Car, Droplets, Building, User, Settings } from 'lucide-react';

const AddPart = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { selectedOrganizationId } = useOrganization();

  const [formData, setFormData] = useState<CreatePartData>({
    part_number: '',
    name: '',
    description: '',
    category: 'other',
    quantity: 0,
    min_quantity: 0,
    max_quantity: 1000,
    unit_price: 0,
    supplier: '',
    supplier_contact: '',
    location: ''
  });

  const organizationIdToUse = profile?.role === 'mechanic' ? selectedOrganizationId : profile?.organization_id;

  const { createPart, isCreating } = usePartsInventory(organizationIdToUse);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.part_number || !formData.name) {
      // You could add toast notification here
      return;
    }

    try {
      createPart(formData, {
        onSuccess: () => navigate('/parts-supplies')
      });
    } catch (error) {
      console.error('Error creating part:', error);
    }
  };

  const navigationItems = [
    { id: 'basic-info', label: 'Basic Information' },
    { id: 'stock-details', label: 'Stock Details' },
    { id: 'supplier-info', label: 'Supplier Information' },
    { id: 'location', label: 'Location' }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engine': return <Settings className="w-4 h-4" />;
      case 'brakes': return <Wrench className="w-4 h-4" />;
      case 'electrical': return <Zap className="w-4 h-4" />;
      case 'tires': return <Car className="w-4 h-4" />;
      case 'fluids': return <Droplets className="w-4 h-4" />;
      case 'body': return <Car className="w-4 h-4" />;
      case 'interior': return <Building className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <DefaultViewPageLayout
      title="Add New Part"
      subtitle="Add a new part to your inventory"
      backUrl="/parts-supplies"
      backLabel="Back to Parts & Supplies"
      navigationItems={navigationItems}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card id="basic-info">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="part_number">Part Number *</Label>
                <Input
                  id="part_number"
                  value={formData.part_number}
                  onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                  placeholder="e.g., ENG-001"
                  required
                />
              </div>

              <div>
                <Label htmlFor="name">Part Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Engine Oil Filter"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the part"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engine">Engine</SelectItem>
                  <SelectItem value="brakes">Brakes</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="tires">Tires</SelectItem>
                  <SelectItem value="fluids">Fluids</SelectItem>
                  <SelectItem value="body">Body</SelectItem>
                  <SelectItem value="interior">Interior</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stock Details */}
        <Card id="stock-details">
          <CardHeader>
            <CardTitle>Stock Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="quantity">Current Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="min_quantity">Minimum Quantity</Label>
                <Input
                  id="min_quantity"
                  type="number"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="max_quantity">Maximum Quantity</Label>
                <Input
                  id="max_quantity"
                  type="number"
                  value={formData.max_quantity}
                  onChange={(e) => setFormData({ ...formData, max_quantity: parseInt(e.target.value) || 1000 })}
                  placeholder="1000"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="unit_price">Unit Price (£)</Label>
              <Input
                id="unit_price"
                type="number"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Supplier Information */}
        <Card id="supplier-info">
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="supplier">Supplier Name</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="e.g., AutoParts Ltd"
              />
            </div>

            <div>
              <Label htmlFor="supplier_contact">Supplier Contact</Label>
              <Input
                id="supplier_contact"
                value={formData.supplier_contact}
                onChange={(e) => setFormData({ ...formData, supplier_contact: e.target.value })}
                placeholder="e.g., sales@autoparts.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card id="location">
          <CardHeader>
            <CardTitle>Storage Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="location">Storage Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Warehouse A - Shelf 3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="w-4 h-4" />
              <span>All fields marked with * are required</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/parts-supplies')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Part
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </DefaultViewPageLayout>
  );
};

export default AddPart;

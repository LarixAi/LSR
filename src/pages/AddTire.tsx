import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateTireInventory, useTireInventory, useUpdateTireInventory } from '@/hooks/useTires';
import { ArrowLeft, Home } from 'lucide-react';

export default function AddTire() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const addTireMutation = useCreateTireInventory();
  const updateTireMutation = useUpdateTireInventory();
  const { data: inventory = [] } = useTireInventory();

  const qp = new URLSearchParams(location.search);
  const mode = qp.get('mode');
  const editId = qp.get('id');
  const editing = mode === 'edit' && !!editId;
  const current = editing ? inventory.find(i => i.id === editId) : undefined;

  const [formData, setFormData] = React.useState({
    tire_brand: current?.tire_brand || '',
    tire_model: current?.tire_model || '',
    tire_size: current?.tire_size || '',
    tire_type: (current?.tire_type || 'all_position') as 'drive' | 'steer' | 'trailer' | 'all_position',
    load_index: (current?.load_index?.toString() || ''),
    speed_rating: current?.speed_rating || '',
    stock_quantity: (current?.stock_quantity?.toString() || ''),
    minimum_stock: (current?.minimum_stock?.toString() || ''),
    cost_per_tire: (current?.cost_per_tire?.toString() || ''),
    supplier: current?.supplier || '',
    warranty_months: (current?.warranty_months?.toString() || ''),
    location_storage: current?.location_storage || '',
    notes: ''
  });

  React.useEffect(() => {
    if (editing && current) {
      setFormData({
        tire_brand: current.tire_brand || '',
        tire_model: current.tire_model || '',
        tire_size: current.tire_size || '',
        tire_type: (current.tire_type || 'all_position') as any,
        load_index: current.load_index?.toString() || '',
        speed_rating: current.speed_rating || '',
        stock_quantity: current.stock_quantity?.toString() || '',
        minimum_stock: current.minimum_stock?.toString() || '',
        cost_per_tire: current.cost_per_tire?.toString() || '',
        supplier: current.supplier || '',
        warranty_months: current.warranty_months?.toString() || '',
        location_storage: current.location_storage || '',
        notes: ''
      });
    }
  }, [editing, editId, current]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing && editId) {
        await updateTireMutation.mutateAsync({
          id: editId,
          updates: {
            ...formData,
            load_index: parseInt(formData.load_index) || 0,
            stock_quantity: parseInt(formData.stock_quantity) || 0,
            minimum_stock: parseInt(formData.minimum_stock) || 0,
            cost_per_tire: parseFloat(formData.cost_per_tire) || 0,
            warranty_months: parseInt(formData.warranty_months) || 0,
          }
        });
        toast({ title: 'Tire Updated', description: 'Tire information saved.' });
      } else {
        await addTireMutation.mutateAsync({
          ...formData,
          load_index: parseInt(formData.load_index) || 0,
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          minimum_stock: parseInt(formData.minimum_stock) || 0,
          cost_per_tire: parseFloat(formData.cost_per_tire) || 0,
          warranty_months: parseInt(formData.warranty_months) || 0
        } as any);
        toast({ title: 'Tire Added', description: 'New tire has been added to inventory successfully.' });
      }
      navigate('/admin/tire-management');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save tire.', variant: 'destructive' });
    }
  };

  const handleBack = () => navigate('/admin/tire-management');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Tire Management
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{editing ? 'Edit Tire' : 'Add New Tire'}</h1>
                <p className="text-gray-600">{editing ? 'Update tire record in the inventory' : 'Create a tire record in the inventory'}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quick Navigation */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('tire-details')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs">Tire Details</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('stock-supplier')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs">Stock & Supplier</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('pricing-warranty')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs">Pricing & Warranty</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('storage-notes')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs">Storage & Notes</Button>
            </div>
          </div>

          {/* Tire Details */}
          <Card id="tire-details">
            <CardHeader>
              <CardTitle>Tire Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Brand</label>
                  <Input value={formData.tire_brand} onChange={(e) => setFormData({ ...formData, tire_brand: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Model</label>
                  <Input value={formData.tire_model} onChange={(e) => setFormData({ ...formData, tire_model: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Size</label>
                  <Input value={formData.tire_size} onChange={(e) => setFormData({ ...formData, tire_size: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={formData.tire_type} onValueChange={(v: any) => setFormData({ ...formData, tire_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drive">Drive</SelectItem>
                      <SelectItem value="steer">Steer</SelectItem>
                      <SelectItem value="trailer">Trailer</SelectItem>
                      <SelectItem value="all_position">All Position</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Load Index</label>
                  <Input value={formData.load_index} onChange={(e) => setFormData({ ...formData, load_index: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Speed Rating</label>
                  <Input value={formData.speed_rating} onChange={(e) => setFormData({ ...formData, speed_rating: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock & Supplier */}
          <Card id="stock-supplier">
            <CardHeader>
              <CardTitle>Stock & Supplier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Stock Quantity</label>
                  <Input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Minimum Stock</label>
                  <Input type="number" value={formData.minimum_stock} onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Supplier</label>
                  <Input value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Warranty */}
          <Card id="pricing-warranty">
            <CardHeader>
              <CardTitle>Pricing & Warranty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Cost per Tire</label>
                  <Input type="number" step="0.01" value={formData.cost_per_tire} onChange={(e) => setFormData({ ...formData, cost_per_tire: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Warranty (months)</label>
                  <Input type="number" value={formData.warranty_months} onChange={(e) => setFormData({ ...formData, warranty_months: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage & Notes */}
          <Card id="storage-notes">
            <CardHeader>
              <CardTitle>Storage & Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Storage Location</label>
                  <Input value={formData.location_storage} onChange={(e) => setFormData({ ...formData, location_storage: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit">{editing ? 'Save Changes' : 'Add Tire'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

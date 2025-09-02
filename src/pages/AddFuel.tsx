import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFuelPurchases, useCreateFuelPurchase, useUpdateFuelPurchase } from '@/hooks/useFuelPurchases';
import { useVehicles } from '@/hooks/useVehicles';
import { ArrowLeft, Home } from 'lucide-react';

export default function AddFuel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { data: vehicles = [] } = useVehicles();
  const { data: purchases = [] } = useFuelPurchases();
  const createFuel = useCreateFuelPurchase();
  const updateFuel = useUpdateFuelPurchase();

  const qp = new URLSearchParams(location.search);
  const editing = qp.get('mode') === 'edit';
  const editId = qp.get('id') || '';
  const current = editing ? purchases.find(p => p.id === editId) : undefined;

  const [formData, setFormData] = React.useState({
    vehicle_id: current?.vehicle_id || '',
    fuel_type: (current?.fuel_type || 'diesel') as 'diesel' | 'petrol' | 'electric',
    quantity: current?.quantity || 0,
    unit_price: current?.unit_price || 0,
    total_cost: current?.total_cost || 0,
    location: current?.location || '',
    odometer_reading: current?.odometer_reading || 0,
    purchase_date: (current?.purchase_date || new Date().toISOString().split('T')[0]) as string,
    notes: current?.notes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.vehicle_id) {
        toast({ title: 'Vehicle required', description: 'Please select a vehicle.', variant: 'destructive' });
        return;
      }
      if (editing && editId) {
        await updateFuel.mutateAsync({ id: editId, updates: formData as any });
        toast({ title: 'Purchase Updated', description: 'Fuel purchase saved.' });
      } else {
        await createFuel.mutateAsync(formData as any);
        toast({ title: 'Purchase Added', description: 'Fuel purchase recorded.' });
      }
      navigate('/fuel-management');
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save purchase.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/fuel-management')} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Fuel Management
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{editing ? 'Edit Fuel Purchase' : 'Add Fuel Purchase'}</h1>
                <p className="text-gray-600">{editing ? 'Update a fuel purchase record' : 'Create a fuel purchase record'}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
              <Home className="w-4 h-4" /> Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vehicle</Label>
                  <Select value={formData.vehicle_id} onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                    <SelectContent>
                      {vehicles.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.vehicle_number} - {v.license_plate}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fuel Type</Label>
                  <Select value={formData.fuel_type} onValueChange={(value: any) => setFormData({ ...formData, fuel_type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity (L)</Label>
                  <Input type="number" step="0.01" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Price per L</Label>
                  <Input type="number" step="0.01" value={formData.unit_price} onChange={e => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Total Cost</Label>
                  <Input type="number" step="0.01" value={formData.total_cost} onChange={e => setFormData({ ...formData, total_cost: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Fuel station name" />
                </div>
                <div>
                  <Label>Purchase Date</Label>
                  <Input type="date" value={formData.purchase_date} onChange={e => setFormData({ ...formData, purchase_date: e.target.value })} />
                </div>
                <div>
                  <Label>Odometer</Label>
                  <Input type="number" value={formData.odometer_reading} onChange={e => setFormData({ ...formData, odometer_reading: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Notes</Label>
                  <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Any additional notes..." />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit">{editing ? 'Save Changes' : 'Add Purchase'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

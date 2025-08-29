import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Fuel } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

interface FuelPurchaseFormProps {
  onComplete?: () => void;
}

const FuelPurchaseForm: React.FC<FuelPurchaseFormProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    vehicleId: '',
    fuelType: 'diesel',
    quantity: '',
    unitPrice: '',
    location: '',
    odometerReading: '',
    notes: ''
  });

  // Fetch vehicles for this driver
  const { data: vehicles = [] } = useQuery({
    queryKey: ['driver-vehicles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: assignments, error } = await supabase
        .from('driver_assignments')
        .select('vehicle_id')
        .eq('driver_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      if (!assignments?.length) return [];

      const vehicleIds = assignments.map(a => a.vehicle_id);
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, vehicle_number, make, model, license_plate')
        .in('id', vehicleIds);

      if (vehiclesError) throw vehiclesError;
      return vehicles || [];
    },
    enabled: !!user
  });

  const submitFuelPurchase = useMutation({
    mutationFn: async () => {
      if (!user || !formData.vehicleId || !formData.quantity || !formData.unitPrice) {
        throw new Error('Missing required fields');
      }

      const quantity = parseFloat(formData.quantity);
      const unitPrice = parseFloat(formData.unitPrice);
      const totalCost = quantity * unitPrice;

      // Insert fuel purchase
      const { data: fuelPurchase, error: purchaseError } = await supabase
        .from('fuel_purchases')
        .insert({
          driver_id: user.id,
          vehicle_id: formData.vehicleId,
          fuel_type: formData.fuelType,
          quantity,
          unit_price: unitPrice,
          total_cost: totalCost,
          location: formData.location || 'Not specified',
          odometer_reading: formData.odometerReading ? parseInt(formData.odometerReading) : null,
          purchase_date: new Date().toISOString().split('T')[0],
          notes: formData.notes,
          organization_id: user.user_metadata?.organization_id
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Send notification to admin
      await supabase.functions.invoke('notification-sender', {
        body: {
          title: 'Fuel Purchase Recorded',
          body: `${user.user_metadata?.first_name || 'Driver'} ${user.user_metadata?.last_name || ''} recorded a fuel purchase of ${quantity}L for £${totalCost.toFixed(2)}.`,
          type: 'info',
          priority: 'normal',
          recipient_role: 'admin',
          action_url: '/fuel-management',
          metadata: {
            vehicle_id: formData.vehicleId,
            purchase_id: fuelPurchase.id,
            amount: totalCost,
            quantity,
            driver_id: user.id
          }
        }
      });

      return fuelPurchase;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Fuel purchase recorded successfully! Admin has been notified.",
      });
      
      // Reset form
      setFormData({
        vehicleId: '',
        fuelType: 'diesel',
        quantity: '',
        unitPrice: '',
        location: '',
        odometerReading: '',
        notes: ''
      });
      
      queryClient.invalidateQueries({ queryKey: ['fuel-purchases'] });
      onComplete?.();
    },
    onError: (error) => {
      console.error('Error submitting fuel purchase:', error);
      toast({
        title: "Error",
        description: "Failed to record fuel purchase",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFuelPurchase.mutate();
  };

  const totalCost = formData.quantity && formData.unitPrice 
    ? (parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toFixed(2)
    : '0.00';

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="w-5 h-5" />
          Record Fuel Purchase
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle *</Label>
              <Select
                value={formData.vehicleId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_number} - {vehicle.make} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel Type *</Label>
              <Select
                value={formData.fuelType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, fuelType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="petrol">Petrol</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (Liters) *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Price per Liter (£) *</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.001"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                placeholder="0.000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Station name or location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="odometerReading">Odometer Reading</Label>
              <Input
                id="odometerReading"
                type="number"
                min="0"
                value={formData.odometerReading}
                onChange={(e) => setFormData(prev => ({ ...prev, odometerReading: e.target.value }))}
                placeholder="Miles/KM"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about this fuel purchase..."
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Cost:</span>
              <span className="text-2xl font-bold">£{totalCost}</span>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={submitFuelPurchase.isPending || !formData.vehicleId || !formData.quantity || !formData.unitPrice}
          >
            {submitFuelPurchase.isPending ? 'Recording...' : 'Record Fuel Purchase'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FuelPurchaseForm;
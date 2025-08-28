import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calculator, TrendingDown, DollarSign, Calendar, Gauge, Shield } from 'lucide-react';

interface VehicleFormData {
  vehicle_number: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
  fuel_type: string;
  seating_capacity: number;
  wheelchair_accessible: boolean;
  purchase_price?: number;
  purchase_date?: string;
  estimated_mileage?: number;
  mpg_rating?: number;
  useful_life_years?: number;
  annual_maintenance_cost?: number;
  insurance_estimate?: number;
}

interface FinancialAnalysis {
  monthlyDepreciation: number;
  annualDepreciation: number;
  totalOwnershipCost: number;
  costPerMile: number;
  breakEvenMileage: number;
}

interface EnhancedAddVehicleFormProps {
  onSubmit: (data: VehicleFormData) => void;
  onCancel: () => void;
}

const EnhancedAddVehicleForm = ({ onSubmit, onCancel }: EnhancedAddVehicleFormProps) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<VehicleFormData>({
    vehicle_number: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    vin: '',
    fuel_type: 'diesel',
    seating_capacity: 16,
    wheelchair_accessible: false,
    purchase_price: 0,
    purchase_date: '',
    estimated_mileage: 0,
    mpg_rating: 0,
    useful_life_years: 7,
    annual_maintenance_cost: 0,
    insurance_estimate: 0,
  });

  const [financialAnalysis, setFinancialAnalysis] = useState<FinancialAnalysis | null>(null);

  const fuelTypes = [
    { value: 'diesel', label: 'Diesel' },
    { value: 'petrol', label: 'Petrol' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'cng', label: 'CNG' },
    { value: 'lpg', label: 'LPG' }
  ];

  const vehicleMakes = [
    'Mercedes-Benz', 'Volvo', 'Scania', 'MAN', 'Iveco', 'DAF', 
    'Ford', 'Volkswagen', 'Renault', 'Peugeot', 'Citroën', 'Fiat'
  ];

  // Calculate financial analysis
  const calculateFinancialAnalysis = () => {
    const {
      purchase_price = 0,
      useful_life_years = 7,
      annual_maintenance_cost = 0,
      insurance_estimate = 0,
      estimated_mileage = 0
    } = formData;

    if (purchase_price === 0 || useful_life_years === 0) {
      setFinancialAnalysis(null);
      return;
    }

    const annualDepreciation = purchase_price / useful_life_years;
    const monthlyDepreciation = annualDepreciation / 12;
    const totalOwnershipCost = purchase_price + (annual_maintenance_cost * useful_life_years) + (insurance_estimate * useful_life_years);
    const totalMileage = estimated_mileage * useful_life_years;
    const costPerMile = totalMileage > 0 ? totalOwnershipCost / totalMileage : 0;
    const breakEvenMileage = estimated_mileage > 0 ? purchase_price / (estimated_mileage * 0.5) : 0; // Rough break-even calculation

    setFinancialAnalysis({
      monthlyDepreciation,
      annualDepreciation,
      totalOwnershipCost,
      costPerMile,
      breakEvenMileage
    });
  };

  useEffect(() => {
    calculateFinancialAnalysis();
  }, [
    formData.purchase_price,
    formData.useful_life_years,
    formData.annual_maintenance_cost,
    formData.insurance_estimate,
    formData.estimated_mileage
  ]);

  const handleInputChange = (field: keyof VehicleFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicle_number.trim() || !formData.make || !formData.model) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Vehicle Information</span>
          </CardTitle>
          <CardDescription>
            Basic details about the vehicle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_number">Vehicle Number *</Label>
              <Input
                id="vehicle_number"
                placeholder="e.g., BUS-001"
                value={formData.vehicle_number}
                onChange={(e) => handleInputChange('vehicle_number', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_plate">License Plate *</Label>
              <Input
                id="license_plate"
                placeholder="e.g., ABC 123"
                value={formData.license_plate}
                onChange={(e) => handleInputChange('license_plate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="make">Make *</Label>
              <Select
                value={formData.make}
                onValueChange={(value) => handleInputChange('make', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select make" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleMakes.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                placeholder="e.g., Sprinter"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="1990"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value) || new Date().getFullYear())}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_type">Fuel Type</Label>
              <Select
                value={formData.fuel_type}
                onValueChange={(value) => handleInputChange('fuel_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((fuel) => (
                    <SelectItem key={fuel.value} value={fuel.value}>
                      {fuel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seating_capacity">Seating Capacity</Label>
              <Input
                id="seating_capacity"
                type="number"
                min="1"
                max="100"
                value={formData.seating_capacity}
                onChange={(e) => handleInputChange('seating_capacity', parseInt(e.target.value) || 16)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                placeholder="17-character VIN"
                value={formData.vin}
                onChange={(e) => handleInputChange('vin', e.target.value)}
                maxLength={17}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="wheelchair_accessible"
              checked={formData.wheelchair_accessible}
              onChange={(e) => handleInputChange('wheelchair_accessible', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="wheelchair_accessible">Wheelchair Accessible</Label>
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Financial Details</span>
          </CardTitle>
          <CardDescription>
            Purchase and operational cost information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price (£)</Label>
              <Input
                id="purchase_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.purchase_price || ''}
                onChange={(e) => handleInputChange('purchase_price', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date || ''}
                onChange={(e) => handleInputChange('purchase_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_mileage">Annual Mileage (miles)</Label>
              <Input
                id="estimated_mileage"
                type="number"
                min="0"
                placeholder="e.g., 25000"
                value={formData.estimated_mileage || ''}
                onChange={(e) => handleInputChange('estimated_mileage', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mpg_rating">MPG Rating</Label>
              <Input
                id="mpg_rating"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g., 35.5"
                value={formData.mpg_rating || ''}
                onChange={(e) => handleInputChange('mpg_rating', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="useful_life_years">Useful Life (years)</Label>
              <Input
                id="useful_life_years"
                type="number"
                min="1"
                max="20"
                value={formData.useful_life_years || 7}
                onChange={(e) => handleInputChange('useful_life_years', parseInt(e.target.value) || 7)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annual_maintenance_cost">Annual Maintenance (£)</Label>
              <Input
                id="annual_maintenance_cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 3500.00"
                value={formData.annual_maintenance_cost || ''}
                onChange={(e) => handleInputChange('annual_maintenance_cost', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance_estimate">Annual Insurance (£)</Label>
              <Input
                id="insurance_estimate"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 2500.00"
                value={formData.insurance_estimate || ''}
                onChange={(e) => handleInputChange('insurance_estimate', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Analysis */}
      {financialAnalysis && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Calculator className="w-5 h-5" />
              <span>Financial Analysis</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              Automated calculations based on your inputs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Monthly Depreciation</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  £{financialAnalysis.monthlyDepreciation.toFixed(2)}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Annual Depreciation</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  £{financialAnalysis.annualDepreciation.toFixed(2)}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Total Ownership Cost</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  £{financialAnalysis.totalOwnershipCost.toFixed(2)}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Gauge className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Cost Per Mile</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  £{financialAnalysis.costPerMile.toFixed(3)}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-lg border-l-4 border-green-500">
              <h4 className="font-medium text-green-900 mb-2">Summary</h4>
              <p className="text-sm text-green-800">
                This vehicle will cost approximately <strong>£{financialAnalysis.monthlyDepreciation.toFixed(2)}</strong> per month in depreciation, 
                with a total ownership cost of <strong>£{financialAnalysis.totalOwnershipCost.toFixed(2)}</strong> over {formData.useful_life_years} years.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button type="submit" className="flex-1">
          Add Vehicle
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EnhancedAddVehicleForm;
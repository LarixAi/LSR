
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { AddRouteFormData } from '../types';

interface PaymentStepProps {
  formData: AddRouteFormData;
  errors: Record<string, string>;
  onUpdateField: (field: keyof AddRouteFormData, value: string | boolean) => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  formData,
  errors,
  onUpdateField,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Payment & Route Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="transportCompany">Transport Company</Label>
          <Input
            id="transportCompany"
            value={formData.transportCompany || ''}
            onChange={(e) => onUpdateField('transportCompany', e.target.value)}
            placeholder="e.g., LSR Transport Services"
            className={errors.transportCompany ? 'border-red-500' : ''}
          />
          {errors.transportCompany && <p className="text-red-500 text-sm mt-1">{errors.transportCompany}</p>}
        </div>
        
        <div>
          <Label htmlFor="routeNumber">Route Number</Label>
          <Input
            id="routeNumber"
            value={formData.routeNumber || ''}
            onChange={(e) => onUpdateField('routeNumber', e.target.value)}
            placeholder="e.g., R001, A-12"
            className={errors.routeNumber ? 'border-red-500' : ''}
          />
          {errors.routeNumber && <p className="text-red-500 text-sm mt-1">{errors.routeNumber}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Payment Rates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="morningPayment">Morning Run Payment (£)</Label>
            <Input
              id="morningPayment"
              type="number"
              step="0.01"
              min="0"
              value={formData.morningPayment || ''}
              onChange={(e) => onUpdateField('morningPayment', e.target.value)}
              placeholder="0.00"
              className={errors.morningPayment ? 'border-red-500' : ''}
            />
            {errors.morningPayment && <p className="text-red-500 text-sm mt-1">{errors.morningPayment}</p>}
          </div>
          
          <div>
            <Label htmlFor="afternoonPayment">Afternoon Run Payment (£)</Label>
            <Input
              id="afternoonPayment"
              type="number"
              step="0.01"
              min="0"
              value={formData.afternoonPayment || ''}
              onChange={(e) => onUpdateField('afternoonPayment', e.target.value)}
              placeholder="0.00"
              className={errors.afternoonPayment ? 'border-red-500' : ''}
            />
            {errors.afternoonPayment && <p className="text-red-500 text-sm mt-1">{errors.afternoonPayment}</p>}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <Switch
            id="afternoonReverse"
            checked={formData.afternoonIsReverse ?? true}
            onCheckedChange={(checked) => onUpdateField('afternoonIsReverse', checked)}
          />
          <div>
            <Label htmlFor="afternoonReverse" className="font-medium">
              Afternoon run is reverse of morning run
            </Label>
            <p className="text-sm text-gray-600">
              When enabled, the afternoon route will automatically follow the reverse order of morning stops
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">Route Calculations</h4>
        <p className="text-sm text-yellow-700">
          Estimated distance, duration, and student count will be automatically calculated based on the stops and assignments you've configured.
        </p>
      </div>
    </div>
  );
};

export default PaymentStep;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Truck, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Wrench, 
  Fuel, 
  Gauge, 
  Calendar,
  Info,
  Save,
  RefreshCw,
  Database,
  Zap,
  Eye,
  Bell,
  Lock,
  Scale,
  Car,
  Bus,
  Package,
  Users
} from 'lucide-react';

interface VehicleSettings {
  // General Fleet Settings
  maxVehicleAge: number;
  requireDailyChecks: boolean;
  maintenanceReminderDays: number;
  fuelThresholdPercentage: number;
  
  // Driver Assignment
  allowDriverReassignment: boolean;
  requireDriverTraining: boolean;
  maxDriverHoursPerDay: number;
  requireRestPeriods: boolean;
  
  // Document Management
  requireDigitalDocumentUpload: boolean;
  documentExpiryWarningDays: number;
  requireDocumentApproval: boolean;
}

interface GeneralSettingsTabProps {
  settings: VehicleSettings;
  onSettingsChange: (settings: Partial<VehicleSettings>) => void;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
  settings,
  onSettingsChange
}) => {
  return (
    <div className="space-y-6">
      {/* General Fleet Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            General Fleet Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxVehicleAge">Maximum Vehicle Age (years)</Label>
              <Input
                id="maxVehicleAge"
                type="number"
                value={settings.maxVehicleAge}
                onChange={(e) => onSettingsChange({ maxVehicleAge: parseInt(e.target.value) })}
                placeholder="15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenanceReminderDays">Maintenance Reminder (days)</Label>
              <Input
                id="maintenanceReminderDays"
                type="number"
                value={settings.maintenanceReminderDays}
                onChange={(e) => onSettingsChange({ maintenanceReminderDays: parseInt(e.target.value) })}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuelThresholdPercentage">Fuel Threshold (%)</Label>
              <Input
                id="fuelThresholdPercentage"
                type="number"
                value={settings.fuelThresholdPercentage}
                onChange={(e) => onSettingsChange({ fuelThresholdPercentage: parseInt(e.target.value) })}
                placeholder="20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentExpiryWarningDays">Document Expiry Warning (days)</Label>
              <Input
                id="documentExpiryWarningDays"
                type="number"
                value={settings.documentExpiryWarningDays}
                onChange={(e) => onSettingsChange({ documentExpiryWarningDays: parseInt(e.target.value) })}
                placeholder="30"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Daily Vehicle Checks</Label>
                <p className="text-sm text-muted-foreground">
                  Enforce daily pre-trip vehicle inspections
                </p>
              </div>
              <Switch
                checked={settings.requireDailyChecks}
                onCheckedChange={(checked) => onSettingsChange({ requireDailyChecks: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Digital Document Upload</Label>
                <p className="text-sm text-muted-foreground">
                  Mandate digital upload of all vehicle documents
                </p>
              </div>
              <Switch
                checked={settings.requireDigitalDocumentUpload}
                onCheckedChange={(checked) => onSettingsChange({ requireDigitalDocumentUpload: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Document Approval</Label>
                <p className="text-sm text-muted-foreground">
                  Require admin approval for uploaded documents
                </p>
              </div>
              <Switch
                checked={settings.requireDocumentApproval}
                onCheckedChange={(checked) => onSettingsChange({ requireDocumentApproval: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Assignment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Driver Assignment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxDriverHoursPerDay">Maximum Driver Hours Per Day</Label>
              <Input
                id="maxDriverHoursPerDay"
                type="number"
                value={settings.maxDriverHoursPerDay}
                onChange={(e) => onSettingsChange({ maxDriverHoursPerDay: parseInt(e.target.value) })}
                placeholder="9"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Driver Reassignment</Label>
                <p className="text-sm text-muted-foreground">
                  Allow drivers to be reassigned to different vehicles
                </p>
              </div>
              <Switch
                checked={settings.allowDriverReassignment}
                onCheckedChange={(checked) => onSettingsChange({ allowDriverReassignment: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Driver Training</Label>
                <p className="text-sm text-muted-foreground">
                  Mandate training before driver assignment
                </p>
              </div>
              <Switch
                checked={settings.requireDriverTraining}
                onCheckedChange={(checked) => onSettingsChange({ requireDriverTraining: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Rest Periods</Label>
                <p className="text-sm text-muted-foreground">
                  Enforce mandatory rest periods for drivers
                </p>
              </div>
              <Switch
                checked={settings.requireRestPeriods}
                onCheckedChange={(checked) => onSettingsChange({ requireRestPeriods: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Settings Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">General settings configured</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Driver assignment rules set</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Document management active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

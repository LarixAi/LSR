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
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Calendar,
  Info,
  Scale,
  Car,
  Bus,
  Gauge,
  Truck
} from 'lucide-react';

interface VehicleSettings {
  // Compliance Settings
  motReminderDays: number;
  insuranceReminderDays: number;
  psvLicenseReminderDays: number;
  annualTestReminderDays: number;
  tachographCalibrationReminderDays: number;
  
  // Compliance Standards
  dvsaComplianceLevel: 'basic' | 'enhanced' | 'premium';
  requireDvsaWalkaround: boolean;
  requireDefectReporting: boolean;
  requireIncidentReporting: boolean;
  
  // PSV Specific Settings
  psvOperatorLicense: string;
  psvLicenseExpiry: string;
  requirePsvTraining: boolean;
  psvInspectionFrequency: 'daily' | 'weekly' | 'monthly';
  
  // HGV Specific Settings
  hgvOperatorLicense: string;
  hgvLicenseExpiry: string;
  requireHgvTraining: boolean;
  hgvInspectionFrequency: 'daily' | 'weekly' | 'monthly';
}

interface ComplianceSettingsTabProps {
  settings: VehicleSettings;
  onSettingsChange: (settings: Partial<VehicleSettings>) => void;
}

export const ComplianceSettingsTab: React.FC<ComplianceSettingsTabProps> = ({
  settings,
  onSettingsChange
}) => {
  return (
    <div className="space-y-6">
      {/* Compliance Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Compliance Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="motReminderDays">MOT Reminder (days)</Label>
              <Input
                id="motReminderDays"
                type="number"
                value={settings.motReminderDays}
                onChange={(e) => onSettingsChange({ motReminderDays: parseInt(e.target.value) })}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insuranceReminderDays">Insurance Reminder (days)</Label>
              <Input
                id="insuranceReminderDays"
                type="number"
                value={settings.insuranceReminderDays}
                onChange={(e) => onSettingsChange({ insuranceReminderDays: parseInt(e.target.value) })}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="psvLicenseReminderDays">PSV License Reminder (days)</Label>
              <Input
                id="psvLicenseReminderDays"
                type="number"
                value={settings.psvLicenseReminderDays}
                onChange={(e) => onSettingsChange({ psvLicenseReminderDays: parseInt(e.target.value) })}
                placeholder="60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualTestReminderDays">Annual Test Reminder (days)</Label>
              <Input
                id="annualTestReminderDays"
                type="number"
                value={settings.annualTestReminderDays}
                onChange={(e) => onSettingsChange({ annualTestReminderDays: parseInt(e.target.value) })}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tachographCalibrationReminderDays">Tachograph Calibration Reminder (days)</Label>
              <Input
                id="tachographCalibrationReminderDays"
                type="number"
                value={settings.tachographCalibrationReminderDays}
                onChange={(e) => onSettingsChange({ tachographCalibrationReminderDays: parseInt(e.target.value) })}
                placeholder="90"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DVSA Compliance Standards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            DVSA Compliance Standards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dvsaComplianceLevel">DVSA Compliance Level</Label>
            <Select
              value={settings.dvsaComplianceLevel}
              onValueChange={(value: 'basic' | 'enhanced' | 'premium') => 
                onSettingsChange({ dvsaComplianceLevel: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select compliance level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="enhanced">Enhanced</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require DVSA Walkaround</Label>
                <p className="text-sm text-muted-foreground">
                  Enforce DVSA walkaround check procedures
                </p>
              </div>
              <Switch
                checked={settings.requireDvsaWalkaround}
                onCheckedChange={(checked) => onSettingsChange({ requireDvsaWalkaround: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Defect Reporting</Label>
                <p className="text-sm text-muted-foreground">
                  Mandate reporting of vehicle defects
                </p>
              </div>
              <Switch
                checked={settings.requireDefectReporting}
                onCheckedChange={(checked) => onSettingsChange({ requireDefectReporting: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Incident Reporting</Label>
                <p className="text-sm text-muted-foreground">
                  Mandate reporting of all incidents
                </p>
              </div>
              <Switch
                checked={settings.requireIncidentReporting}
                onCheckedChange={(checked) => onSettingsChange({ requireIncidentReporting: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PSV Specific Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="w-5 h-5" />
            PSV (Public Service Vehicle) Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="psvOperatorLicense">PSV Operator License</Label>
              <Input
                id="psvOperatorLicense"
                value={settings.psvOperatorLicense}
                onChange={(e) => onSettingsChange({ psvOperatorLicense: e.target.value })}
                placeholder="Enter PSV operator license number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="psvLicenseExpiry">PSV License Expiry</Label>
              <Input
                id="psvLicenseExpiry"
                type="date"
                value={settings.psvLicenseExpiry}
                onChange={(e) => onSettingsChange({ psvLicenseExpiry: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="psvInspectionFrequency">PSV Inspection Frequency</Label>
              <Select
                value={settings.psvInspectionFrequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                  onSettingsChange({ psvInspectionFrequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require PSV Training</Label>
              <p className="text-sm text-muted-foreground">
                Mandate PSV-specific driver training
              </p>
            </div>
            <Switch
              checked={settings.requirePsvTraining}
              onCheckedChange={(checked) => onSettingsChange({ requirePsvTraining: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* HGV Specific Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            HGV (Heavy Goods Vehicle) Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hgvOperatorLicense">HGV Operator License</Label>
              <Input
                id="hgvOperatorLicense"
                value={settings.hgvOperatorLicense}
                onChange={(e) => onSettingsChange({ hgvOperatorLicense: e.target.value })}
                placeholder="Enter HGV operator license number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hgvLicenseExpiry">HGV License Expiry</Label>
              <Input
                id="hgvLicenseExpiry"
                type="date"
                value={settings.hgvLicenseExpiry}
                onChange={(e) => onSettingsChange({ hgvLicenseExpiry: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hgvInspectionFrequency">HGV Inspection Frequency</Label>
              <Select
                value={settings.hgvInspectionFrequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                  onSettingsChange({ hgvInspectionFrequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require HGV Training</Label>
              <p className="text-sm text-muted-foreground">
                Mandate HGV-specific driver training
              </p>
            </div>
            <Switch
              checked={settings.requireHgvTraining}
              onCheckedChange={(checked) => onSettingsChange({ requireHgvTraining: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">DVSA compliance configured</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">PSV settings active</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">HGV settings active</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Reminder system configured</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

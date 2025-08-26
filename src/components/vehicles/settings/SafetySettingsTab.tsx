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
  Eye,
  Bell,
  Lock,
  Car,
  Bus,
  Truck
} from 'lucide-react';

interface VehicleSettings {
  // Safety Settings
  requirePreTripInspections: boolean;
  requirePostTripInspections: boolean;
  requireWeeklyInspections: boolean;
  requireMonthlyInspections: boolean;
  requireAnnualInspections: boolean;
}

interface SafetySettingsTabProps {
  settings: VehicleSettings;
  onSettingsChange: (settings: Partial<VehicleSettings>) => void;
}

export const SafetySettingsTab: React.FC<SafetySettingsTabProps> = ({
  settings,
  onSettingsChange
}) => {
  return (
    <div className="space-y-6">
      {/* Inspection Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Inspection Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Pre-Trip Inspections</Label>
                <p className="text-sm text-muted-foreground">
                  Mandate pre-trip vehicle inspections before each journey
                </p>
              </div>
              <Switch
                checked={settings.requirePreTripInspections}
                onCheckedChange={(checked) => onSettingsChange({ requirePreTripInspections: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Post-Trip Inspections</Label>
                <p className="text-sm text-muted-foreground">
                  Mandate post-trip vehicle inspections after each journey
                </p>
              </div>
              <Switch
                checked={settings.requirePostTripInspections}
                onCheckedChange={(checked) => onSettingsChange({ requirePostTripInspections: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Weekly Inspections</Label>
                <p className="text-sm text-muted-foreground">
                  Enforce weekly comprehensive vehicle inspections
                </p>
              </div>
              <Switch
                checked={settings.requireWeeklyInspections}
                onCheckedChange={(checked) => onSettingsChange({ requireWeeklyInspections: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Monthly Inspections</Label>
                <p className="text-sm text-muted-foreground">
                  Enforce monthly detailed vehicle inspections
                </p>
              </div>
              <Switch
                checked={settings.requireMonthlyInspections}
                onCheckedChange={(checked) => onSettingsChange({ requireMonthlyInspections: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Annual Inspections</Label>
                <p className="text-sm text-muted-foreground">
                  Enforce annual comprehensive vehicle inspections
                </p>
              </div>
              <Switch
                checked={settings.requireAnnualInspections}
                onCheckedChange={(checked) => onSettingsChange({ requireAnnualInspections: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Safety Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Safety inspections are critical for maintaining vehicle roadworthiness and ensuring driver safety.
              All inspection requirements are enforced according to DVSA guidelines.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Pre-trip inspections active</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Post-trip inspections active</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Weekly inspections scheduled</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Monthly inspections scheduled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Safety Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                <span>Vehicle Inspections</span>
              </div>
              <Badge variant="default">Compliant</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4" />
                <span>PSV Safety Standards</span>
              </div>
              <Badge variant="default">Compliant</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>HGV Safety Standards</span>
              </div>
              <Badge variant="default">Compliant</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Driver Safety Protocols</span>
              </div>
              <Badge variant="default">Compliant</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Safety Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              • All inspection requirements are based on DVSA guidelines and industry best practices
            </p>
            <p>
              • Pre-trip inspections must be completed before any vehicle departure
            </p>
            <p>
              • Post-trip inspections help identify issues for immediate attention
            </p>
            <p>
              • Regular inspections ensure ongoing vehicle safety and compliance
            </p>
            <p>
              • All inspection results are logged and tracked for audit purposes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

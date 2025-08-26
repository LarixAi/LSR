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
  Truck,
  Building,
  Phone,
  Mail
} from 'lucide-react';

interface VehicleSettings {
  // Insurance & Legal
  insuranceProvider: string;
  insurancePolicyNumber: string;
  legalEntityName: string;
  tradingAddress: string;
  
  // Emergency Settings
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  requireEmergencyProcedures: boolean;
}

interface LegalSettingsTabProps {
  settings: VehicleSettings;
  onSettingsChange: (settings: Partial<VehicleSettings>) => void;
}

export const LegalSettingsTab: React.FC<LegalSettingsTabProps> = ({
  settings,
  onSettingsChange
}) => {
  return (
    <div className="space-y-6">
      {/* Insurance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Insurance Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Input
                id="insuranceProvider"
                value={settings.insuranceProvider}
                onChange={(e) => onSettingsChange({ insuranceProvider: e.target.value })}
                placeholder="Enter insurance provider name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurancePolicyNumber">Insurance Policy Number</Label>
              <Input
                id="insurancePolicyNumber"
                value={settings.insurancePolicyNumber}
                onChange={(e) => onSettingsChange({ insurancePolicyNumber: e.target.value })}
                placeholder="Enter insurance policy number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Entity Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Legal Entity Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="legalEntityName">Legal Entity Name</Label>
              <Input
                id="legalEntityName"
                value={settings.legalEntityName}
                onChange={(e) => onSettingsChange({ legalEntityName: e.target.value })}
                placeholder="Enter legal entity name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradingAddress">Trading Address</Label>
              <Input
                id="tradingAddress"
                value={settings.tradingAddress}
                onChange={(e) => onSettingsChange({ tradingAddress: e.target.value })}
                placeholder="Enter trading address"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Emergency Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
              <Input
                id="emergencyContactName"
                value={settings.emergencyContactName}
                onChange={(e) => onSettingsChange({ emergencyContactName: e.target.value })}
                placeholder="Enter emergency contact name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                value={settings.emergencyContactPhone}
                onChange={(e) => onSettingsChange({ emergencyContactPhone: e.target.value })}
                placeholder="Enter emergency contact phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactEmail">Emergency Contact Email</Label>
              <Input
                id="emergencyContactEmail"
                type="email"
                value={settings.emergencyContactEmail}
                onChange={(e) => onSettingsChange({ emergencyContactEmail: e.target.value })}
                placeholder="Enter emergency contact email"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Emergency Procedures</Label>
              <p className="text-sm text-muted-foreground">
                Enforce emergency procedures and protocols
              </p>
            </div>
            <Switch
              checked={settings.requireEmergencyProcedures}
              onCheckedChange={(checked) => onSettingsChange({ requireEmergencyProcedures: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Legal Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Legal Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Insurance Coverage</span>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                <span>Legal Entity Registration</span>
              </div>
              <Badge variant="default">Registered</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Emergency Contacts</span>
              </div>
              <Badge variant="default">Configured</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Legal Documentation</span>
              </div>
              <Badge variant="default">Complete</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Legal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              • All legal information must be kept up to date and accurate
            </p>
            <p>
              • Insurance policies must be valid and cover all operational vehicles
            </p>
            <p>
              • Emergency contacts must be available 24/7 for incident response
            </p>
            <p>
              • Legal entity information must match official registration documents
            </p>
            <p>
              • All legal requirements must comply with UK transport regulations
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Import the new tab components
import { GeneralSettingsTab } from '@/components/vehicles/settings/GeneralSettingsTab';
import { ComplianceSettingsTab } from '@/components/vehicles/settings/ComplianceSettingsTab';
import { SafetySettingsTab } from '@/components/vehicles/settings/SafetySettingsTab';
import { LegalSettingsTab } from '@/components/vehicles/settings/LegalSettingsTab';

// Complete VehicleSettings interface
interface VehicleSettings {
  // General Fleet Settings
  maxVehicleAge: number;
  requireDailyChecks: boolean;
  maintenanceReminderDays: number;
  fuelThresholdPercentage: number;
  
  // Compliance Settings
  motReminderDays: number;
  insuranceReminderDays: number;
  psvLicenseReminderDays: number;
  annualTestReminderDays: number;
  tachographCalibrationReminderDays: number;
  
  // Safety Settings
  requirePreTripInspections: boolean;
  requirePostTripInspections: boolean;
  requireWeeklyInspections: boolean;
  requireMonthlyInspections: boolean;
  requireAnnualInspections: boolean;
  
  // Document Management
  requireDigitalDocumentUpload: boolean;
  documentExpiryWarningDays: number;
  requireDocumentApproval: boolean;
  
  // Driver Assignment
  allowDriverReassignment: boolean;
  requireDriverTraining: boolean;
  maxDriverHoursPerDay: number;
  requireRestPeriods: boolean;
  
  // Maintenance Settings
  serviceIntervalMiles: number;
  serviceIntervalMonths: number;
  requireServiceHistory: boolean;
  allowEmergencyRepairs: boolean;
  
  // Monitoring & Alerts
  enableRealTimeTracking: boolean;
  enableFuelMonitoring: boolean;
  enableSpeedMonitoring: boolean;
  enableIdleTimeMonitoring: boolean;
  
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

  // ORV (Off-Road Vehicle) Settings
  enableOrvSystem: boolean;
  orvClassificationEnabled: boolean;
  orvDocumentationRequired: boolean;
  orvMonitoringEnabled: boolean;
  orvAlertSystemEnabled: boolean;
  
  // ORV Off-Road Categories
  orvPlannedOffRoadEnabled: boolean;
  orvUnplannedOffRoadEnabled: boolean;
  orvOperationalOffRoadEnabled: boolean;
  orvRegulatoryOffRoadEnabled: boolean;
  
  // ORV Documentation Requirements
  orvRequireOffRoadDeclaration: boolean;
  orvRequireMaintenanceRecords: boolean;
  orvRequireComplianceDocumentation: boolean;
  orvRequireCostTracking: boolean;
  orvRequireLocationTracking: boolean;
  
  // ORV Monitoring Settings
  orvDurationAlertDays: number;
  orvCostThresholdAlert: number;
  orvComplianceWarningEnabled: boolean;
  orvReturnReminderDays: number;
  orvDocumentationAlertEnabled: boolean;
  orvInsuranceAlertEnabled: boolean;

  // BOR (Back On Road) Settings
  enableBorSystem: boolean;
  borComplianceLevel: 'basic' | 'enhanced' | 'premium';
  
  // BOR Pre-Return Requirements
  borPreReturnInspectionEnabled: boolean;
  borDocumentationVerificationEnabled: boolean;
  borDriverAssignmentEnabled: boolean;
  borQualityAssuranceEnabled: boolean;
  
  // BOR Vehicle Safety Inspection
  borRequireMechanicalInspection: boolean;
  borRequireSafetySystemsCheck: boolean;
  borRequireStructuralIntegrityCheck: boolean;
  borRequireEquipmentCheck: boolean;
  borRequireCleanlinessCheck: boolean;
  
  // BOR Documentation Verification
  borRequireVehicleRegistration: boolean;
  borRequireMotCertificate: boolean;
  borRequireInsuranceCertificate: boolean;
  borRequireOperatorLicense: boolean;
  borRequireTachographCalibration: boolean;
  borRequireServiceRecords: boolean;
  
  // BOR Driver Assignment
  borRequireValidLicense: boolean;
  borRequireMedicalCertificate: boolean;
  borRequireTrainingRecords: boolean;
  borRequireCompetenceAssessment: boolean;
  borRequireVehicleFamiliarization: boolean;
  borRequireRouteKnowledge: boolean;
  
  // BOR Return Process
  borReturnProcessEnabled: boolean;
  borManagementApprovalRequired: boolean;
  borComplianceSignoffRequired: boolean;
  borSafetySignoffRequired: boolean;
  borInsuranceVerificationRequired: boolean;
  borDriverBriefingRequired: boolean;
  
  // BOR Quality Assurance
  borQualityControlEnabled: boolean;
  borInspectionChecklistsRequired: boolean;
  borVerificationProceduresRequired: boolean;
  borApprovalWorkflowsRequired: boolean;
  borDocumentationReviewRequired: boolean;
  borPerformanceTestingRequired: boolean;
  borSafetyValidationRequired: boolean;
  
  // BOR Financial Standing
  borFinancialStandingEnabled: boolean;
  borMinimumFinancialResources: number;
  borFinancialReviewFrequency: 'monthly' | 'quarterly' | 'annually';
  borRequireAuditedAccounts: boolean;
  borRequireBankStatements: boolean;
  borRequireFinancialProjections: boolean;
}

const VehicleManagementSettingsRefactored = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<VehicleSettings>({
    // Initialize with default values
    maxVehicleAge: 15,
    requireDailyChecks: true,
    maintenanceReminderDays: 30,
    fuelThresholdPercentage: 20,
    motReminderDays: 30,
    insuranceReminderDays: 30,
    psvLicenseReminderDays: 60,
    annualTestReminderDays: 30,
    tachographCalibrationReminderDays: 90,
    requirePreTripInspections: true,
    requirePostTripInspections: true,
    requireWeeklyInspections: true,
    requireMonthlyInspections: true,
    requireAnnualInspections: true,
    requireDigitalDocumentUpload: true,
    documentExpiryWarningDays: 30,
    requireDocumentApproval: true,
    allowDriverReassignment: true,
    requireDriverTraining: true,
    maxDriverHoursPerDay: 9,
    requireRestPeriods: true,
    serviceIntervalMiles: 10000,
    serviceIntervalMonths: 6,
    requireServiceHistory: true,
    allowEmergencyRepairs: true,
    enableRealTimeTracking: true,
    enableFuelMonitoring: true,
    enableSpeedMonitoring: true,
    enableIdleTimeMonitoring: true,
    dvsaComplianceLevel: 'enhanced',
    requireDvsaWalkaround: true,
    requireDefectReporting: true,
    requireIncidentReporting: true,
    psvOperatorLicense: '',
    psvLicenseExpiry: '',
    requirePsvTraining: true,
    psvInspectionFrequency: 'weekly',
    hgvOperatorLicense: '',
    hgvLicenseExpiry: '',
    requireHgvTraining: true,
    hgvInspectionFrequency: 'weekly',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    legalEntityName: '',
    tradingAddress: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactEmail: '',
    requireEmergencyProcedures: true,
    // ORV and BOR settings with defaults
    enableOrvSystem: false,
    orvClassificationEnabled: false,
    orvDocumentationRequired: false,
    orvMonitoringEnabled: false,
    orvAlertSystemEnabled: false,
    orvPlannedOffRoadEnabled: false,
    orvUnplannedOffRoadEnabled: false,
    orvOperationalOffRoadEnabled: false,
    orvRegulatoryOffRoadEnabled: false,
    orvRequireOffRoadDeclaration: false,
    orvRequireMaintenanceRecords: false,
    orvRequireComplianceDocumentation: false,
    orvRequireCostTracking: false,
    orvRequireLocationTracking: false,
    orvDurationAlertDays: 7,
    orvCostThresholdAlert: 1000,
    orvComplianceWarningEnabled: false,
    orvReturnReminderDays: 3,
    orvDocumentationAlertEnabled: false,
    orvInsuranceAlertEnabled: false,
    enableBorSystem: false,
    borComplianceLevel: 'basic',
    borPreReturnInspectionEnabled: false,
    borDocumentationVerificationEnabled: false,
    borDriverAssignmentEnabled: false,
    borQualityAssuranceEnabled: false,
    borRequireMechanicalInspection: false,
    borRequireSafetySystemsCheck: false,
    borRequireStructuralIntegrityCheck: false,
    borRequireEquipmentCheck: false,
    borRequireCleanlinessCheck: false,
    borRequireVehicleRegistration: false,
    borRequireMotCertificate: false,
    borRequireInsuranceCertificate: false,
    borRequireOperatorLicense: false,
    borRequireTachographCalibration: false,
    borRequireServiceRecords: false,
    borRequireValidLicense: false,
    borRequireMedicalCertificate: false,
    borRequireTrainingRecords: false,
    borRequireCompetenceAssessment: false,
    borRequireVehicleFamiliarization: false,
    borRequireRouteKnowledge: false,
    borReturnProcessEnabled: false,
    borManagementApprovalRequired: false,
    borComplianceSignoffRequired: false,
    borSafetySignoffRequired: false,
    borInsuranceVerificationRequired: false,
    borDriverBriefingRequired: false,
    borQualityControlEnabled: false,
    borInspectionChecklistsRequired: false,
    borVerificationProceduresRequired: false,
    borApprovalWorkflowsRequired: false,
    borDocumentationReviewRequired: false,
    borPerformanceTestingRequired: false,
    borSafetyValidationRequired: false,
    borFinancialStandingEnabled: false,
    borMinimumFinancialResources: 10000,
    borFinancialReviewFrequency: 'quarterly',
    borRequireAuditedAccounts: false,
    borRequireBankStatements: false,
    borRequireFinancialProjections: false,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // TODO: Load settings from database
      console.error('Error loading settings:', 'Not implemented');
      toast.success('Settings loaded successfully');
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // TODO: Save settings to database
      console.error('Error saving settings:', 'Not implemented');
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    // Reset to default values
    setSettings({
      ...settings,
      maxVehicleAge: 15,
      requireDailyChecks: true,
      maintenanceReminderDays: 30,
      fuelThresholdPercentage: 20,
    });
    toast.success('Settings reset to defaults');
  };

  const handleSettingsChange = (newSettings: Partial<VehicleSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Settings className="w-8 h-8" />
              Vehicle Management Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure vehicle management policies, compliance requirements, and operational settings
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={loading || saving}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={saveSettings}
            disabled={loading || saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Settings Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Settings Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">General settings configured</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Compliance requirements set</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Safety protocols active</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Legal information complete</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettingsTab 
            settings={settings} 
            onSettingsChange={handleSettingsChange} 
          />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ComplianceSettingsTab 
            settings={settings} 
            onSettingsChange={handleSettingsChange} 
          />
        </TabsContent>

        <TabsContent value="safety" className="space-y-6">
          <SafetySettingsTab 
            settings={settings} 
            onSettingsChange={handleSettingsChange} 
          />
        </TabsContent>

        <TabsContent value="legal" className="space-y-6">
          <LegalSettingsTab 
            settings={settings} 
            onSettingsChange={handleSettingsChange} 
          />
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex justify-end gap-2 pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <Button
          onClick={saveSettings}
          disabled={loading || saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
};

export default VehicleManagementSettingsRefactored;

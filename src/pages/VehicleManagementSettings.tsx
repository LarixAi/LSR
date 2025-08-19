import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  
  // BOR Professional Competence
  borProfessionalCompetenceEnabled: boolean;
  borRequireCpcCertificate: boolean;
  borCpcRenewalReminderDays: number;
  borRequireContinuousDevelopment: boolean;
  borTrainingHoursRequired: number; // 35 hours every 5 years
  borCompetenceAssessmentFrequency: 'monthly' | 'quarterly' | 'annually';
  
  // BOR Good Repute
  borGoodReputeEnabled: boolean;
  borRequireCriminalRecordChecks: boolean;
  borCriminalCheckFrequency: 'annually' | 'biennially' | 'every5years';
  borRequireComplianceHistory: boolean;
  borRequireBusinessConductStandards: boolean;
  
  // BOR Operating Centre
  borOperatingCentreEnabled: boolean;
  borRequireSuitablePremises: boolean;
  borRequireMaintenanceFacilities: boolean;
  borRequireSecureStorage: boolean;
  borRequireEnvironmentalCompliance: boolean;
  borFacilityInspectionFrequency: 'monthly' | 'quarterly' | 'annually';
  
  // BOR Vehicle Maintenance
  borVehicleMaintenanceEnabled: boolean;
  borRequirePreventiveMaintenance: boolean;
  borRequireDefectReporting: boolean;
  borRequireRepairAuthorization: boolean;
  borRequireQualityControl: boolean;
  borMaintenanceStandard: 'dvsa' | 'manufacturer' | 'industry' | 'custom';
  
  // BOR Compliance Monitoring
  borComplianceMonitoringEnabled: boolean;
  borVehicleRoadworthinessTarget: number; // 100% target
  borDriverComplianceTarget: number; // 95% target
  borDocumentationAccuracyTarget: number; // 100% target
  borSafetyPerformanceTarget: number; // 0 serious incidents
  
  // ORV-BOR Integration
  orvBorIntegrationEnabled: boolean;
  orvBorMatrixEnabled: boolean;
  orvBorPredictiveAnalytics: boolean;
  orvBorEarlyWarningSystem: boolean;
  orvBorAutomatedReporting: boolean;
}

const defaultSettings: VehicleSettings = {
  // General Fleet Settings
  maxVehicleAge: 10,
  requireDailyChecks: true,
  maintenanceReminderDays: 30,
  fuelThresholdPercentage: 25,
  
  // Compliance Settings
  motReminderDays: 30,
  insuranceReminderDays: 14,
  psvLicenseReminderDays: 60,
  annualTestReminderDays: 30,
  tachographCalibrationReminderDays: 30,
  
  // Safety Settings
  requirePreTripInspections: true,
  requirePostTripInspections: true,
  requireWeeklyInspections: true,
  requireMonthlyInspections: true,
  requireAnnualInspections: true,
  
  // Document Management
  requireDigitalDocumentUpload: true,
  documentExpiryWarningDays: 30,
  requireDocumentApproval: true,
  
  // Driver Assignment
  allowDriverReassignment: true,
  requireDriverTraining: true,
  maxDriverHoursPerDay: 8,
  requireRestPeriods: true,
  
  // Maintenance Settings
  serviceIntervalMiles: 10000,
  serviceIntervalMonths: 6,
  requireServiceHistory: true,
  allowEmergencyRepairs: true,
  
  // Monitoring & Alerts
  enableRealTimeTracking: true,
  enableFuelMonitoring: true,
  enableSpeedMonitoring: true,
  enableIdleTimeMonitoring: true,
  
  // Compliance Standards
  dvsaComplianceLevel: 'enhanced',
  requireDvsaWalkaround: true,
  requireDefectReporting: true,
  requireIncidentReporting: true,
  
  // PSV Specific Settings
  psvOperatorLicense: '',
  psvLicenseExpiry: '',
  requirePsvTraining: true,
  psvInspectionFrequency: 'daily',
  
  // HGV Specific Settings
  hgvOperatorLicense: '',
  hgvLicenseExpiry: '',
  requireHgvTraining: true,
  hgvInspectionFrequency: 'daily',
  
  // Insurance & Legal
  insuranceProvider: '',
  insurancePolicyNumber: '',
  legalEntityName: '',
  tradingAddress: '',
  
  // Emergency Settings
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactEmail: '',
  requireEmergencyProcedures: true,

  // ORV (Off-Road Vehicle) Settings
  enableOrvSystem: true,
  orvClassificationEnabled: true,
  orvDocumentationRequired: true,
  orvMonitoringEnabled: true,
  orvAlertSystemEnabled: true,
  
  // ORV Off-Road Categories
  orvPlannedOffRoadEnabled: true,
  orvUnplannedOffRoadEnabled: true,
  orvOperationalOffRoadEnabled: true,
  orvRegulatoryOffRoadEnabled: true,
  
  // ORV Documentation Requirements
  orvRequireOffRoadDeclaration: true,
  orvRequireMaintenanceRecords: true,
  orvRequireComplianceDocumentation: true,
  orvRequireCostTracking: true,
  orvRequireLocationTracking: true,
  
  // ORV Monitoring Settings
  orvDurationAlertDays: 30,
  orvCostThresholdAlert: 5000,
  orvComplianceWarningEnabled: true,
  orvReturnReminderDays: 7,
  orvDocumentationAlertEnabled: true,
  orvInsuranceAlertEnabled: true,

  // BOR (Back On Road) Settings
  enableBorSystem: true,
  borComplianceLevel: 'enhanced',
  
  // BOR Pre-Return Requirements
  borPreReturnInspectionEnabled: true,
  borDocumentationVerificationEnabled: true,
  borDriverAssignmentEnabled: true,
  borQualityAssuranceEnabled: true,
  
  // BOR Vehicle Safety Inspection
  borRequireMechanicalInspection: true,
  borRequireSafetySystemsCheck: true,
  borRequireStructuralIntegrityCheck: true,
  borRequireEquipmentCheck: true,
  borRequireCleanlinessCheck: true,
  
  // BOR Documentation Verification
  borRequireVehicleRegistration: true,
  borRequireMotCertificate: true,
  borRequireInsuranceCertificate: true,
  borRequireOperatorLicense: true,
  borRequireTachographCalibration: true,
  borRequireServiceRecords: true,
  
  // BOR Driver Assignment
  borRequireValidLicense: true,
  borRequireMedicalCertificate: true,
  borRequireTrainingRecords: true,
  borRequireCompetenceAssessment: true,
  borRequireVehicleFamiliarization: true,
  borRequireRouteKnowledge: true,
  
  // BOR Return Process
  borReturnProcessEnabled: true,
  borManagementApprovalRequired: true,
  borComplianceSignoffRequired: true,
  borSafetySignoffRequired: true,
  borInsuranceVerificationRequired: true,
  borDriverBriefingRequired: true,
  
  // BOR Quality Assurance
  borQualityControlEnabled: true,
  borInspectionChecklistsRequired: true,
  borVerificationProceduresRequired: true,
  borApprovalWorkflowsRequired: true,
  borDocumentationReviewRequired: true,
  borPerformanceTestingRequired: true,
  borSafetyValidationRequired: true,
  
  // BOR Financial Standing
  borFinancialStandingEnabled: true,
  borMinimumFinancialResources: 100000,
  borFinancialReviewFrequency: 'monthly',
  borRequireAuditedAccounts: true,
  borRequireBankStatements: true,
  borRequireFinancialProjections: true,
  
  // BOR Professional Competence
  borProfessionalCompetenceEnabled: true,
  borRequireCpcCertificate: true,
  borCpcRenewalReminderDays: 30,
  borRequireContinuousDevelopment: true,
  borTrainingHoursRequired: 35,
  borCompetenceAssessmentFrequency: 'monthly',
  
  // BOR Good Repute
  borGoodReputeEnabled: true,
  borRequireCriminalRecordChecks: true,
  borCriminalCheckFrequency: 'annually',
  borRequireComplianceHistory: true,
  borRequireBusinessConductStandards: true,
  
  // BOR Operating Centre
  borOperatingCentreEnabled: true,
  borRequireSuitablePremises: true,
  borRequireMaintenanceFacilities: true,
  borRequireSecureStorage: true,
  borRequireEnvironmentalCompliance: true,
  borFacilityInspectionFrequency: 'monthly',
  
  // BOR Vehicle Maintenance
  borVehicleMaintenanceEnabled: true,
  borRequirePreventiveMaintenance: true,
  borRequireDefectReporting: true,
  borRequireRepairAuthorization: true,
  borRequireQualityControl: true,
  borMaintenanceStandard: 'dvsa',
  
  // BOR Compliance Monitoring
  borComplianceMonitoringEnabled: true,
  borVehicleRoadworthinessTarget: 100,
  borDriverComplianceTarget: 95,
  borDocumentationAccuracyTarget: 100,
  borSafetyPerformanceTarget: 0,
  
  // ORV-BOR Integration
  orvBorIntegrationEnabled: true,
  orvBorMatrixEnabled: true,
  orvBorPredictiveAnalytics: true,
  orvBorEarlyWarningSystem: true,
  orvBorAutomatedReporting: true,
};

const VehicleManagementSettings = () => {
  const [settings, setSettings] = useState<VehicleSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Load settings from database
      // For now, use default settings
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Save settings to database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setHasChanges(false);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof VehicleSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8 text-blue-600" />
            Vehicle Management Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Configure fleet compliance, safety standards, and operational requirements
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/vehicles')}
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vehicles
          </Button>
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button 
            onClick={saveSettings}
            disabled={!hasChanges || isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Compliance Notice:</strong> These settings ensure compliance with UK transport regulations including 
          DVSA standards, PSV licensing requirements, and Road Traffic Act provisions. Regular updates are required 
          to maintain legal compliance.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="orv">ORV System</TabsTrigger>
          <TabsTrigger value="bor">BOR System</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
        </TabsList>

        {/* General Fleet Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                General Fleet Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxVehicleAge">Maximum Vehicle Age (years)</Label>
                  <Input
                    id="maxVehicleAge"
                    type="number"
                    value={settings.maxVehicleAge}
                    onChange={(e) => updateSetting('maxVehicleAge', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Vehicles older than this will trigger replacement alerts
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenanceReminderDays">Maintenance Reminder (days)</Label>
                  <Input
                    id="maintenanceReminderDays"
                    type="number"
                    value={settings.maintenanceReminderDays}
                    onChange={(e) => updateSetting('maintenanceReminderDays', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Days before maintenance due to send reminders
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuelThresholdPercentage">Fuel Threshold (%)</Label>
                  <Input
                    id="fuelThresholdPercentage"
                    type="number"
                    value={settings.fuelThresholdPercentage}
                    onChange={(e) => updateSetting('fuelThresholdPercentage', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Minimum fuel level before refueling alerts
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDriverHoursPerDay">Max Driver Hours/Day</Label>
                  <Input
                    id="maxDriverHoursPerDay"
                    type="number"
                    value={settings.maxDriverHoursPerDay}
                    onChange={(e) => updateSetting('maxDriverHoursPerDay', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Maximum driving hours per day per driver
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Operational Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireDailyChecks"
                      checked={settings.requireDailyChecks}
                      onCheckedChange={(checked) => updateSetting('requireDailyChecks', checked)}
                    />
                    <Label htmlFor="requireDailyChecks">Require Daily Vehicle Checks</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowDriverReassignment"
                      checked={settings.allowDriverReassignment}
                      onCheckedChange={(checked) => updateSetting('allowDriverReassignment', checked)}
                    />
                    <Label htmlFor="allowDriverReassignment">Allow Driver Reassignment</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireDriverTraining"
                      checked={settings.requireDriverTraining}
                      onCheckedChange={(checked) => updateSetting('requireDriverTraining', checked)}
                    />
                    <Label htmlFor="requireDriverTraining">Require Driver Training</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireRestPeriods"
                      checked={settings.requireRestPeriods}
                      onCheckedChange={(checked) => updateSetting('requireRestPeriods', checked)}
                    />
                    <Label htmlFor="requireRestPeriods">Require Rest Periods</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Settings */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Compliance & Regulatory Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>DVSA Compliance:</strong> These settings ensure compliance with Driver and Vehicle Standards Agency requirements.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="motReminderDays">MOT Reminder (days)</Label>
                  <Input
                    id="motReminderDays"
                    type="number"
                    value={settings.motReminderDays}
                    onChange={(e) => updateSetting('motReminderDays', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Days before MOT expiry to send reminders
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceReminderDays">Insurance Reminder (days)</Label>
                  <Input
                    id="insuranceReminderDays"
                    type="number"
                    value={settings.insuranceReminderDays}
                    onChange={(e) => updateSetting('insuranceReminderDays', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Days before insurance expiry to send reminders
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="psvLicenseReminderDays">PSV License Reminder (days)</Label>
                  <Input
                    id="psvLicenseReminderDays"
                    type="number"
                    value={settings.psvLicenseReminderDays}
                    onChange={(e) => updateSetting('psvLicenseReminderDays', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Days before PSV license expiry to send reminders
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualTestReminderDays">Annual Test Reminder (days)</Label>
                  <Input
                    id="annualTestReminderDays"
                    type="number"
                    value={settings.annualTestReminderDays}
                    onChange={(e) => updateSetting('annualTestReminderDays', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Days before annual test due to send reminders
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tachographCalibrationReminderDays">Tachograph Calibration (days)</Label>
                  <Input
                    id="tachographCalibrationReminderDays"
                    type="number"
                    value={settings.tachographCalibrationReminderDays}
                    onChange={(e) => updateSetting('tachographCalibrationReminderDays', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Days before tachograph calibration due
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dvsaComplianceLevel">DVSA Compliance Level</Label>
                  <Select
                    value={settings.dvsaComplianceLevel}
                    onValueChange={(value: 'basic' | 'enhanced' | 'premium') => 
                      updateSetting('dvsaComplianceLevel', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic Compliance</SelectItem>
                      <SelectItem value="enhanced">Enhanced Compliance</SelectItem>
                      <SelectItem value="premium">Premium Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Level of DVSA compliance monitoring
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">PSV (Public Service Vehicle) Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="psvOperatorLicense">PSV Operator License</Label>
                    <Input
                      id="psvOperatorLicense"
                      value={settings.psvOperatorLicense}
                      onChange={(e) => updateSetting('psvOperatorLicense', e.target.value)}
                      placeholder="Enter PSV operator license number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="psvLicenseExpiry">PSV License Expiry</Label>
                    <Input
                      id="psvLicenseExpiry"
                      type="date"
                      value={settings.psvLicenseExpiry}
                      onChange={(e) => updateSetting('psvLicenseExpiry', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="psvInspectionFrequency">PSV Inspection Frequency</Label>
                    <Select
                      value={settings.psvInspectionFrequency}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                        updateSetting('psvInspectionFrequency', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requirePsvTraining"
                      checked={settings.requirePsvTraining}
                      onCheckedChange={(checked) => updateSetting('requirePsvTraining', checked)}
                    />
                    <Label htmlFor="requirePsvTraining">Require PSV Training</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">HGV (Heavy Goods Vehicle) Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hgvOperatorLicense">HGV Operator License</Label>
                    <Input
                      id="hgvOperatorLicense"
                      value={settings.hgvOperatorLicense}
                      onChange={(e) => updateSetting('hgvOperatorLicense', e.target.value)}
                      placeholder="Enter HGV operator license number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hgvLicenseExpiry">HGV License Expiry</Label>
                    <Input
                      id="hgvLicenseExpiry"
                      type="date"
                      value={settings.hgvLicenseExpiry}
                      onChange={(e) => updateSetting('hgvLicenseExpiry', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hgvInspectionFrequency">HGV Inspection Frequency</Label>
                    <Select
                      value={settings.hgvInspectionFrequency}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                        updateSetting('hgvInspectionFrequency', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireHgvTraining"
                      checked={settings.requireHgvTraining}
                      onCheckedChange={(checked) => updateSetting('requireHgvTraining', checked)}
                    />
                    <Label htmlFor="requireHgvTraining">Require HGV Training</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Safety Settings */}
        <TabsContent value="safety" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Safety & Inspection Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Safety Critical:</strong> These settings ensure vehicle safety and compliance with DVSA walkaround requirements.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-semibold">Inspection Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requirePreTripInspections"
                      checked={settings.requirePreTripInspections}
                      onCheckedChange={(checked) => updateSetting('requirePreTripInspections', checked)}
                    />
                    <Label htmlFor="requirePreTripInspections">Require Pre-Trip Inspections</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requirePostTripInspections"
                      checked={settings.requirePostTripInspections}
                      onCheckedChange={(checked) => updateSetting('requirePostTripInspections', checked)}
                    />
                    <Label htmlFor="requirePostTripInspections">Require Post-Trip Inspections</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireWeeklyInspections"
                      checked={settings.requireWeeklyInspections}
                      onCheckedChange={(checked) => updateSetting('requireWeeklyInspections', checked)}
                    />
                    <Label htmlFor="requireWeeklyInspections">Require Weekly Inspections</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireMonthlyInspections"
                      checked={settings.requireMonthlyInspections}
                      onCheckedChange={(checked) => updateSetting('requireMonthlyInspections', checked)}
                    />
                    <Label htmlFor="requireMonthlyInspections">Require Monthly Inspections</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireAnnualInspections"
                      checked={settings.requireAnnualInspections}
                      onCheckedChange={(checked) => updateSetting('requireAnnualInspections', checked)}
                    />
                    <Label htmlFor="requireAnnualInspections">Require Annual Inspections</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireDvsaWalkaround"
                      checked={settings.requireDvsaWalkaround}
                      onCheckedChange={(checked) => updateSetting('requireDvsaWalkaround', checked)}
                    />
                    <Label htmlFor="requireDvsaWalkaround">Require DVSA Walkaround</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Reporting Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireDefectReporting"
                      checked={settings.requireDefectReporting}
                      onCheckedChange={(checked) => updateSetting('requireDefectReporting', checked)}
                    />
                    <Label htmlFor="requireDefectReporting">Require Defect Reporting</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireIncidentReporting"
                      checked={settings.requireIncidentReporting}
                      onCheckedChange={(checked) => updateSetting('requireIncidentReporting', checked)}
                    />
                    <Label htmlFor="requireIncidentReporting">Require Incident Reporting</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireEmergencyProcedures"
                      checked={settings.requireEmergencyProcedures}
                      onCheckedChange={(checked) => updateSetting('requireEmergencyProcedures', checked)}
                    />
                    <Label htmlFor="requireEmergencyProcedures">Require Emergency Procedures</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Settings */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Maintenance & Service Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="serviceIntervalMiles">Service Interval (miles)</Label>
                  <Input
                    id="serviceIntervalMiles"
                    type="number"
                    value={settings.serviceIntervalMiles}
                    onChange={(e) => updateSetting('serviceIntervalMiles', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Miles between scheduled services
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceIntervalMonths">Service Interval (months)</Label>
                  <Input
                    id="serviceIntervalMonths"
                    type="number"
                    value={settings.serviceIntervalMonths}
                    onChange={(e) => updateSetting('serviceIntervalMonths', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Months between scheduled services
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Maintenance Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireServiceHistory"
                      checked={settings.requireServiceHistory}
                      onCheckedChange={(checked) => updateSetting('requireServiceHistory', checked)}
                    />
                    <Label htmlFor="requireServiceHistory">Require Service History</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowEmergencyRepairs"
                      checked={settings.allowEmergencyRepairs}
                      onCheckedChange={(checked) => updateSetting('allowEmergencyRepairs', checked)}
                    />
                    <Label htmlFor="allowEmergencyRepairs">Allow Emergency Repairs</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Settings */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Monitoring & Tracking Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Real-Time Monitoring</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableRealTimeTracking"
                      checked={settings.enableRealTimeTracking}
                      onCheckedChange={(checked) => updateSetting('enableRealTimeTracking', checked)}
                    />
                    <Label htmlFor="enableRealTimeTracking">Enable Real-Time Tracking</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableFuelMonitoring"
                      checked={settings.enableFuelMonitoring}
                      onCheckedChange={(checked) => updateSetting('enableFuelMonitoring', checked)}
                    />
                    <Label htmlFor="enableFuelMonitoring">Enable Fuel Monitoring</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableSpeedMonitoring"
                      checked={settings.enableSpeedMonitoring}
                      onCheckedChange={(checked) => updateSetting('enableSpeedMonitoring', checked)}
                    />
                    <Label htmlFor="enableSpeedMonitoring">Enable Speed Monitoring</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableIdleTimeMonitoring"
                      checked={settings.enableIdleTimeMonitoring}
                      onCheckedChange={(checked) => updateSetting('enableIdleTimeMonitoring', checked)}
                    />
                    <Label htmlFor="enableIdleTimeMonitoring">Enable Idle Time Monitoring</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Document Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireDigitalDocumentUpload"
                      checked={settings.requireDigitalDocumentUpload}
                      onCheckedChange={(checked) => updateSetting('requireDigitalDocumentUpload', checked)}
                    />
                    <Label htmlFor="requireDigitalDocumentUpload">Require Digital Document Upload</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireDocumentApproval"
                      checked={settings.requireDocumentApproval}
                      onCheckedChange={(checked) => updateSetting('requireDocumentApproval', checked)}
                    />
                    <Label htmlFor="requireDocumentApproval">Require Document Approval</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentExpiryWarningDays">Document Expiry Warning (days)</Label>
                  <Input
                    id="documentExpiryWarningDays"
                    type="number"
                    value={settings.documentExpiryWarningDays}
                    onChange={(e) => updateSetting('documentExpiryWarningDays', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Days before document expiry to send warnings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ORV System Settings */}
        <TabsContent value="orv" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                ORV (Operator's Risk Value) System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>ORV System:</strong> Off-Road Vehicle management system for tracking vehicles removed from service and ensuring proper documentation and compliance.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-semibold">ORV System Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableOrvSystem"
                      checked={settings.enableOrvSystem}
                      onCheckedChange={(checked) => updateSetting('enableOrvSystem', checked)}
                    />
                    <Label htmlFor="enableOrvSystem">Enable ORV System</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvClassificationEnabled"
                      checked={settings.orvClassificationEnabled}
                      onCheckedChange={(checked) => updateSetting('orvClassificationEnabled', checked)}
                    />
                    <Label htmlFor="orvClassificationEnabled">Enable Off-Road Classification</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvDocumentationRequired"
                      checked={settings.orvDocumentationRequired}
                      onCheckedChange={(checked) => updateSetting('orvDocumentationRequired', checked)}
                    />
                    <Label htmlFor="orvDocumentationRequired">Require Documentation</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvMonitoringEnabled"
                      checked={settings.orvMonitoringEnabled}
                      onCheckedChange={(checked) => updateSetting('orvMonitoringEnabled', checked)}
                    />
                    <Label htmlFor="orvMonitoringEnabled">Enable Monitoring</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvAlertSystemEnabled"
                      checked={settings.orvAlertSystemEnabled}
                      onCheckedChange={(checked) => updateSetting('orvAlertSystemEnabled', checked)}
                    />
                    <Label htmlFor="orvAlertSystemEnabled">Enable Alert System</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">ORV Off-Road Categories</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvPlannedOffRoadEnabled"
                      checked={settings.orvPlannedOffRoadEnabled}
                      onCheckedChange={(checked) => updateSetting('orvPlannedOffRoadEnabled', checked)}
                    />
                    <Label htmlFor="orvPlannedOffRoadEnabled">Planned Off-Road (Maintenance)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvUnplannedOffRoadEnabled"
                      checked={settings.orvUnplannedOffRoadEnabled}
                      onCheckedChange={(checked) => updateSetting('orvUnplannedOffRoadEnabled', checked)}
                    />
                    <Label htmlFor="orvUnplannedOffRoadEnabled">Unplanned Off-Road (Repairs)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvOperationalOffRoadEnabled"
                      checked={settings.orvOperationalOffRoadEnabled}
                      onCheckedChange={(checked) => updateSetting('orvOperationalOffRoadEnabled', checked)}
                    />
                    <Label htmlFor="orvOperationalOffRoadEnabled">Operational Off-Road</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvRegulatoryOffRoadEnabled"
                      checked={settings.orvRegulatoryOffRoadEnabled}
                      onCheckedChange={(checked) => updateSetting('orvRegulatoryOffRoadEnabled', checked)}
                    />
                    <Label htmlFor="orvRegulatoryOffRoadEnabled">Regulatory Off-Road</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">ORV Documentation Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvRequireOffRoadDeclaration"
                      checked={settings.orvRequireOffRoadDeclaration}
                      onCheckedChange={(checked) => updateSetting('orvRequireOffRoadDeclaration', checked)}
                    />
                    <Label htmlFor="orvRequireOffRoadDeclaration">Require Off-Road Declaration</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvRequireMaintenanceRecords"
                      checked={settings.orvRequireMaintenanceRecords}
                      onCheckedChange={(checked) => updateSetting('orvRequireMaintenanceRecords', checked)}
                    />
                    <Label htmlFor="orvRequireMaintenanceRecords">Require Maintenance Records</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvRequireComplianceDocumentation"
                      checked={settings.orvRequireComplianceDocumentation}
                      onCheckedChange={(checked) => updateSetting('orvRequireComplianceDocumentation', checked)}
                    />
                    <Label htmlFor="orvRequireComplianceDocumentation">Require Compliance Documentation</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvRequireCostTracking"
                      checked={settings.orvRequireCostTracking}
                      onCheckedChange={(checked) => updateSetting('orvRequireCostTracking', checked)}
                    />
                    <Label htmlFor="orvRequireCostTracking">Require Cost Tracking</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvRequireLocationTracking"
                      checked={settings.orvRequireLocationTracking}
                      onCheckedChange={(checked) => updateSetting('orvRequireLocationTracking', checked)}
                    />
                    <Label htmlFor="orvRequireLocationTracking">Require Location Tracking</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">ORV Monitoring Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="orvDurationAlertDays">Duration Alert (days)</Label>
                    <Input
                      id="orvDurationAlertDays"
                      type="number"
                      value={settings.orvDurationAlertDays}
                      onChange={(e) => updateSetting('orvDurationAlertDays', parseInt(e.target.value))}
                    />
                    <p className="text-sm text-gray-500">Alert when vehicle off-road exceeds this duration</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orvCostThresholdAlert">Cost Threshold Alert (£)</Label>
                    <Input
                      id="orvCostThresholdAlert"
                      type="number"
                      value={settings.orvCostThresholdAlert}
                      onChange={(e) => updateSetting('orvCostThresholdAlert', parseInt(e.target.value))}
                    />
                    <p className="text-sm text-gray-500">Alert when off-road costs exceed this threshold</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orvReturnReminderDays">Return Reminder (days)</Label>
                    <Input
                      id="orvReturnReminderDays"
                      type="number"
                      value={settings.orvReturnReminderDays}
                      onChange={(e) => updateSetting('orvReturnReminderDays', parseInt(e.target.value))}
                    />
                    <p className="text-sm text-gray-500">Remind before planned return date</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvComplianceWarningEnabled"
                      checked={settings.orvComplianceWarningEnabled}
                      onCheckedChange={(checked) => updateSetting('orvComplianceWarningEnabled', checked)}
                    />
                    <Label htmlFor="orvComplianceWarningEnabled">Enable Compliance Warnings</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvDocumentationAlertEnabled"
                      checked={settings.orvDocumentationAlertEnabled}
                      onCheckedChange={(checked) => updateSetting('orvDocumentationAlertEnabled', checked)}
                    />
                    <Label htmlFor="orvDocumentationAlertEnabled">Enable Documentation Alerts</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvInsuranceAlertEnabled"
                      checked={settings.orvInsuranceAlertEnabled}
                      onCheckedChange={(checked) => updateSetting('orvInsuranceAlertEnabled', checked)}
                    />
                    <Label htmlFor="orvInsuranceAlertEnabled">Enable Insurance Alerts</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOR System Settings */}
        <TabsContent value="bor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                BOR (Basic Operator Requirements) System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>BOR System:</strong> Back On Road system for managing vehicle return to service after off-road periods, ensuring all safety and compliance requirements are met.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-semibold">BOR System Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableBorSystem"
                      checked={settings.enableBorSystem}
                      onCheckedChange={(checked) => updateSetting('enableBorSystem', checked)}
                    />
                    <Label htmlFor="enableBorSystem">Enable BOR System</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="borComplianceLevel">BOR Compliance Level</Label>
                    <Select
                      value={settings.borComplianceLevel}
                      onValueChange={(value: 'basic' | 'enhanced' | 'premium') => 
                        updateSetting('borComplianceLevel', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic Compliance</SelectItem>
                        <SelectItem value="enhanced">Enhanced Compliance</SelectItem>
                        <SelectItem value="premium">Premium Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Financial Standing Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borFinancialStandingEnabled"
                      checked={settings.borFinancialStandingEnabled}
                      onCheckedChange={(checked) => updateSetting('borFinancialStandingEnabled', checked)}
                    />
                    <Label htmlFor="borFinancialStandingEnabled">Enable Financial Standing</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="borMinimumFinancialResources">Minimum Financial Resources (£)</Label>
                    <Input
                      id="borMinimumFinancialResources"
                      type="number"
                      value={settings.borMinimumFinancialResources}
                      onChange={(e) => updateSetting('borMinimumFinancialResources', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="borFinancialReviewFrequency">Financial Review Frequency</Label>
                    <Select
                      value={settings.borFinancialReviewFrequency}
                      onValueChange={(value: 'monthly' | 'quarterly' | 'annually') => 
                        updateSetting('borFinancialReviewFrequency', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borRequireAuditedAccounts"
                      checked={settings.borRequireAuditedAccounts}
                      onCheckedChange={(checked) => updateSetting('borRequireAuditedAccounts', checked)}
                    />
                    <Label htmlFor="borRequireAuditedAccounts">Require Audited Accounts</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borRequireBankStatements"
                      checked={settings.borRequireBankStatements}
                      onCheckedChange={(checked) => updateSetting('borRequireBankStatements', checked)}
                    />
                    <Label htmlFor="borRequireBankStatements">Require Bank Statements</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borRequireFinancialProjections"
                      checked={settings.borRequireFinancialProjections}
                      onCheckedChange={(checked) => updateSetting('borRequireFinancialProjections', checked)}
                    />
                    <Label htmlFor="borRequireFinancialProjections">Require Financial Projections</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Professional Competence Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borProfessionalCompetenceEnabled"
                      checked={settings.borProfessionalCompetenceEnabled}
                      onCheckedChange={(checked) => updateSetting('borProfessionalCompetenceEnabled', checked)}
                    />
                    <Label htmlFor="borProfessionalCompetenceEnabled">Enable Professional Competence</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borRequireCpcCertificate"
                      checked={settings.borRequireCpcCertificate}
                      onCheckedChange={(checked) => updateSetting('borRequireCpcCertificate', checked)}
                    />
                    <Label htmlFor="borRequireCpcCertificate">Require CPC Certificate</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="borCpcRenewalReminderDays">CPC Renewal Reminder (days)</Label>
                    <Input
                      id="borCpcRenewalReminderDays"
                      type="number"
                      value={settings.borCpcRenewalReminderDays}
                      onChange={(e) => updateSetting('borCpcRenewalReminderDays', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borRequireContinuousDevelopment"
                      checked={settings.borRequireContinuousDevelopment}
                      onCheckedChange={(checked) => updateSetting('borRequireContinuousDevelopment', checked)}
                    />
                    <Label htmlFor="borRequireContinuousDevelopment">Require Continuous Development</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="borTrainingHoursRequired">Training Hours Required</Label>
                    <Input
                      id="borTrainingHoursRequired"
                      type="number"
                      value={settings.borTrainingHoursRequired}
                      onChange={(e) => updateSetting('borTrainingHoursRequired', parseInt(e.target.value))}
                    />
                    <p className="text-sm text-gray-500">Hours every 5 years (default: 35)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="borCompetenceAssessmentFrequency">Competence Assessment Frequency</Label>
                    <Select
                      value={settings.borCompetenceAssessmentFrequency}
                      onValueChange={(value: 'monthly' | 'quarterly' | 'annually') => 
                        updateSetting('borCompetenceAssessmentFrequency', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Good Repute Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borGoodReputeEnabled"
                      checked={settings.borGoodReputeEnabled}
                      onCheckedChange={(checked) => updateSetting('borGoodReputeEnabled', checked)}
                    />
                    <Label htmlFor="borGoodReputeEnabled">Enable Good Repute</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borRequireCriminalRecordChecks"
                      checked={settings.borRequireCriminalRecordChecks}
                      onCheckedChange={(checked) => updateSetting('borRequireCriminalRecordChecks', checked)}
                    />
                    <Label htmlFor="borRequireCriminalRecordChecks">Require Criminal Record Checks</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="borCriminalCheckFrequency">Criminal Check Frequency</Label>
                    <Select
                      value={settings.borCriminalCheckFrequency}
                      onValueChange={(value: 'annually' | 'biennially' | 'every5years') => 
                        updateSetting('borCriminalCheckFrequency', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annually">Annually</SelectItem>
                        <SelectItem value="biennially">Biennially</SelectItem>
                        <SelectItem value="every5years">Every 5 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borRequireComplianceHistory"
                      checked={settings.borRequireComplianceHistory}
                      onCheckedChange={(checked) => updateSetting('borRequireComplianceHistory', checked)}
                    />
                    <Label htmlFor="borRequireComplianceHistory">Require Compliance History</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borRequireBusinessConductStandards"
                      checked={settings.borRequireBusinessConductStandards}
                      onCheckedChange={(checked) => updateSetting('borRequireBusinessConductStandards', checked)}
                    />
                    <Label htmlFor="borRequireBusinessConductStandards">Require Business Conduct Standards</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Operating Centre Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borOperatingCentreEnabled"
                      checked={settings.borOperatingCentreEnabled}
                      onCheckedChange={(checked) => updateSetting('borOperatingCentreEnabled', checked)}
                    />
                    <Label htmlFor="borOperatingCentreEnabled">Enable Operating Centre</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borRequireSuitablePremises"
                      checked={settings.borRequireSuitablePremises}
                      onCheckedChange={(checked) => updateSetting('borRequireSuitablePremises', checked)}
                    />
                    <Label htmlFor="borRequireSuitablePremises">Require Suitable Premises</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borRequireMaintenanceFacilities"
                      checked={settings.borRequireMaintenanceFacilities}
                      onCheckedChange={(checked) => updateSetting('borRequireMaintenanceFacilities', checked)}
                    />
                    <Label htmlFor="borRequireMaintenanceFacilities">Require Maintenance Facilities</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borRequireSecureStorage"
                      checked={settings.borRequireSecureStorage}
                      onCheckedChange={(checked) => updateSetting('borRequireSecureStorage', checked)}
                    />
                    <Label htmlFor="borRequireSecureStorage">Require Secure Storage</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borRequireEnvironmentalCompliance"
                      checked={settings.borRequireEnvironmentalCompliance}
                      onCheckedChange={(checked) => updateSetting('borRequireEnvironmentalCompliance', checked)}
                    />
                    <Label htmlFor="borRequireEnvironmentalCompliance">Require Environmental Compliance</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="borFacilityInspectionFrequency">Facility Inspection Frequency</Label>
                    <Select
                      value={settings.borFacilityInspectionFrequency}
                      onValueChange={(value: 'monthly' | 'quarterly' | 'annually') => 
                        updateSetting('borFacilityInspectionFrequency', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Vehicle Maintenance Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borVehicleMaintenanceEnabled"
                      checked={settings.borVehicleMaintenanceEnabled}
                      onCheckedChange={(checked) => updateSetting('borVehicleMaintenanceEnabled', checked)}
                    />
                    <Label htmlFor="borVehicleMaintenanceEnabled">Enable Vehicle Maintenance</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borRequirePreventiveMaintenance"
                      checked={settings.borRequirePreventiveMaintenance}
                      onCheckedChange={(checked) => updateSetting('borRequirePreventiveMaintenance', checked)}
                    />
                    <Label htmlFor="borRequirePreventiveMaintenance">Require Preventive Maintenance</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borRequireDefectReporting"
                      checked={settings.borRequireDefectReporting}
                      onCheckedChange={(checked) => updateSetting('borRequireDefectReporting', checked)}
                    />
                    <Label htmlFor="borRequireDefectReporting">Require Defect Reporting</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borRequireRepairAuthorization"
                      checked={settings.borRequireRepairAuthorization}
                      onCheckedChange={(checked) => updateSetting('borRequireRepairAuthorization', checked)}
                    />
                    <Label htmlFor="borRequireRepairAuthorization">Require Repair Authorization</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="borRequireQualityControl"
                      checked={settings.borRequireQualityControl}
                      onCheckedChange={(checked) => updateSetting('borRequireQualityControl', checked)}
                    />
                    <Label htmlFor="borRequireQualityControl">Require Quality Control</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="borMaintenanceStandard">Maintenance Standard</Label>
                    <Select
                      value={settings.borMaintenanceStandard}
                      onValueChange={(value: 'dvsa' | 'manufacturer' | 'industry' | 'custom') => 
                        updateSetting('borMaintenanceStandard', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dvsa">DVSA Standards</SelectItem>
                        <SelectItem value="manufacturer">Manufacturer Specifications</SelectItem>
                        <SelectItem value="industry">Industry Best Practices</SelectItem>
                        <SelectItem value="custom">Custom Standards</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">ORV-BOR Integration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvBorIntegrationEnabled"
                      checked={settings.orvBorIntegrationEnabled}
                      onCheckedChange={(checked) => updateSetting('orvBorIntegrationEnabled', checked)}
                    />
                    <Label htmlFor="orvBorIntegrationEnabled">Enable ORV-BOR Integration</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvBorMatrixEnabled"
                      checked={settings.orvBorMatrixEnabled}
                      onCheckedChange={(checked) => updateSetting('orvBorMatrixEnabled', checked)}
                    />
                    <Label htmlFor="orvBorMatrixEnabled">Enable ORV-BOR Matrix</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvBorPredictiveAnalytics"
                      checked={settings.orvBorPredictiveAnalytics}
                      onCheckedChange={(checked) => updateSetting('orvBorPredictiveAnalytics', checked)}
                    />
                    <Label htmlFor="orvBorPredictiveAnalytics">Enable Predictive Analytics</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvBorEarlyWarningSystem"
                      checked={settings.orvBorEarlyWarningSystem}
                      onCheckedChange={(checked) => updateSetting('orvBorEarlyWarningSystem', checked)}
                    />
                    <Label htmlFor="orvBorEarlyWarningSystem">Enable Early Warning System</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orvBorAutomatedReporting"
                      checked={settings.orvBorAutomatedReporting}
                      onCheckedChange={(checked) => updateSetting('orvBorAutomatedReporting', checked)}
                    />
                    <Label htmlFor="orvBorAutomatedReporting">Enable Automated Reporting</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Settings */}
        <TabsContent value="legal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Legal & Insurance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Legal Compliance:</strong> These settings ensure proper legal entity registration and insurance coverage.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="legalEntityName">Legal Entity Name</Label>
                  <Input
                    id="legalEntityName"
                    value={settings.legalEntityName}
                    onChange={(e) => updateSetting('legalEntityName', e.target.value)}
                    placeholder="Enter legal entity name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tradingAddress">Trading Address</Label>
                  <Input
                    id="tradingAddress"
                    value={settings.tradingAddress}
                    onChange={(e) => updateSetting('tradingAddress', e.target.value)}
                    placeholder="Enter trading address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input
                    id="insuranceProvider"
                    value={settings.insuranceProvider}
                    onChange={(e) => updateSetting('insuranceProvider', e.target.value)}
                    placeholder="Enter insurance provider name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurancePolicyNumber">Insurance Policy Number</Label>
                  <Input
                    id="insurancePolicyNumber"
                    value={settings.insurancePolicyNumber}
                    onChange={(e) => updateSetting('insurancePolicyNumber', e.target.value)}
                    placeholder="Enter insurance policy number"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Emergency Contacts</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={settings.emergencyContactName}
                      onChange={(e) => updateSetting('emergencyContactName', e.target.value)}
                      placeholder="Enter emergency contact name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={settings.emergencyContactPhone}
                      onChange={(e) => updateSetting('emergencyContactPhone', e.target.value)}
                      placeholder="Enter emergency contact phone"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactEmail">Emergency Contact Email</Label>
                    <Input
                      id="emergencyContactEmail"
                      type="email"
                      value={settings.emergencyContactEmail}
                      onChange={(e) => updateSetting('emergencyContactEmail', e.target.value)}
                      placeholder="Enter emergency contact email"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compliance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Compliance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800">DVSA Compliant</h4>
              <p className="text-sm text-green-600">Meets DVSA standards</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-800">PSV Licensed</h4>
              <p className="text-sm text-blue-600">PSV requirements met</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Scale className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-800">Legal Compliant</h4>
              <p className="text-sm text-purple-600">Legal requirements met</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleManagementSettings;

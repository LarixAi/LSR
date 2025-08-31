import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Core Settings Interfaces
export interface FleetSettings {
  maxVehicles: number;
  maxDrivers: number;
  vehicleTypes: string[];
  bodyTypes: string[];
  fuelTypes: string[];
  customVehicleFields: CustomField[];
  customDriverFields: CustomField[];
}

export interface DisplaySettings {
  defaultPageSize: number;
  sortableColumns: string[];
  filterableColumns: string[];
  showAdvancedFields: boolean;
  showTechnicalSpecs: boolean;
  showComplianceHistory: boolean;
  quickActionButtons: QuickAction[];
}

export interface VehicleFieldSettings {
  requiredFields: string[];
  validationRules: ValidationRule[];
  fieldDependencies: FieldDependency[];
  customFieldTypes: CustomFieldType[];
}

export interface VehicleStatusSettings {
  statuses: VehicleStatus[];
  allowedTransitions: StatusTransition[];
  statusColors: Record<string, string>;
  autoStatusRules: AutoStatusRule[];
}

export interface MaintenanceSettings {
  serviceIntervals: ServiceInterval[];
  maintenanceCategories: MaintenanceCategory[];
  costThresholds: CostThreshold[];
  approvalWorkflows: ApprovalWorkflow[];
}

export interface ComplianceSettings {
  complianceStandards: ComplianceStandard[];
  inspectionRequirements: InspectionRequirement[];
  violationCategories: ViolationCategory[];
  penaltyStructures: PenaltyStructure[];
}

export interface InspectionSettings {
  questionSets: QuestionSet[];
  inspectionTypes: InspectionType[];
  passFailCriteria: PassFailCriteria[];
  followUpActions: FollowUpAction[];
}

export interface NotificationSettings {
  alertThresholds: AlertThreshold[];
  notificationRecipients: NotificationRecipient[];
  escalationRules: EscalationRule[];
  communicationChannels: CommunicationChannel[];
}

export interface WorkflowSettings {
  approvalProcesses: ApprovalProcess[];
  escalationRules: EscalationRule[];
  automationRules: AutomationRule[];
  notificationTemplates: NotificationTemplate[];
}

export interface ReportingSettings {
  reportTemplates: ReportTemplate[];
  scheduledReports: ScheduledReport[];
  dataExportFormats: string[];
  customMetrics: CustomMetric[];
}

// Main Settings Interface
export interface VehicleManagementSettings {
  fleet: FleetSettings;
  display: DisplaySettings;
  vehicles: VehicleFieldSettings;
  vehicleStatus: VehicleStatusSettings;
  maintenance: MaintenanceSettings;
  compliance: ComplianceSettings;
  inspections: InspectionSettings;
  notifications: NotificationSettings;
  workflows: WorkflowSettings;
  reporting: ReportingSettings;
}

// Supporting Interfaces
export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'file';
  label: string;
  placeholder?: string;
  options?: string[];
  isRequired: boolean;
  validationRules?: ValidationRule[];
  defaultValue?: any;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value: any;
  message: string;
}

export interface FieldDependency {
  field: string;
  dependsOn: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface CustomFieldType {
  name: string;
  displayName: string;
  component: string;
  props: Record<string, any>;
}

export interface VehicleStatus {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface StatusTransition {
  from: string;
  to: string;
  requiresApproval: boolean;
  approvalRole: string[];
  conditions: string[];
}

export interface AutoStatusRule {
  trigger: 'time' | 'event' | 'condition';
  condition: string;
  newStatus: string;
  delay?: number;
}

export interface ServiceInterval {
  id: string;
  name: string;
  mileage: number;
  months: number;
  description: string;
  isActive: boolean;
}

export interface MaintenanceCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  estimatedHours: number;
  estimatedCost: number;
}

export interface CostThreshold {
  id: string;
  name: string;
  amount: number;
  currency: string;
  requiresApproval: boolean;
  approvalRole: string[];
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  steps: ApprovalStep[];
  isActive: boolean;
}

export interface ApprovalStep {
  order: number;
  role: string;
  canApprove: boolean;
  canReject: boolean;
  canReturn: boolean;
  timeLimit?: number;
}

export interface ComplianceStandard {
  id: string;
  name: string;
  description: string;
  region: string;
  industry: string;
  version: string;
  effectiveDate: string;
}

export interface InspectionRequirement {
  id: string;
  name: string;
  frequency: string;
  vehicleTypes: string[];
  isMandatory: boolean;
  gracePeriod: number;
}

export interface ViolationCategory {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  points: number;
  fineRange: [number, number];
  description: string;
}

export interface PenaltyStructure {
  id: string;
  name: string;
  violations: string[];
  penalties: Penalty[];
  escalationRules: EscalationRule[];
}

export interface Penalty {
  type: 'fine' | 'points' | 'suspension' | 'training';
  value: any;
  duration?: number;
}

export interface QuestionSet {
  id: string;
  name: string;
  description: string;
  questions: InspectionQuestion[];
  isActive: boolean;
}

export interface InspectionQuestion {
  id: string;
  question: string;
  type: 'yes_no' | 'multiple_choice' | 'text' | 'number';
  options?: string[];
  isRequired: boolean;
  order: number;
}

export interface InspectionType {
  id: string;
  name: string;
  description: string;
  questionSets: string[];
  frequency: string;
  isActive: boolean;
}

export interface PassFailCriteria {
  id: string;
  name: string;
  criteria: Criterion[];
  passThreshold: number;
  failThreshold: number;
}

export interface Criterion {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
  weight: number;
}

export interface FollowUpAction {
  id: string;
  name: string;
  description: string;
  type: 'maintenance' | 'training' | 'investigation' | 'documentation';
  timeLimit: number;
  assignedRole: string[];
}

export interface AlertThreshold {
  id: string;
  name: string;
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  value: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface NotificationRecipient {
  id: string;
  name: string;
  email: string;
  role: string[];
  preferences: NotificationPreference[];
}

export interface NotificationPreference {
  type: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface EscalationRule {
  id: string;
  name: string;
  trigger: string;
  timeLimit: number;
  escalationLevel: number;
  recipients: string[];
}

export interface CommunicationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'webhook';
  config: Record<string, any>;
  isActive: boolean;
}

export interface ApprovalProcess {
  id: string;
  name: string;
  description: string;
  steps: ApprovalStep[];
  isActive: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  conditions: string[];
  actions: string[];
  isActive: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
  filters: string[];
  isActive: boolean;
}

export interface ScheduledReport {
  id: string;
  name: string;
  template: string;
  schedule: string;
  recipients: string[];
  isActive: boolean;
}

export interface CustomMetric {
  id: string;
  name: string;
  description: string;
  formula: string;
  unit: string;
  isActive: boolean;
}

export interface QuickAction {
  id: string;
  name: string;
  icon: string;
  action: string;
  isVisible: boolean;
  requiresPermission: boolean;
}

// Default Settings
const defaultSettings: VehicleManagementSettings = {
  fleet: {
    maxVehicles: 100,
    maxDrivers: 50,
    vehicleTypes: ['HGV', 'Van', 'Car', 'Trailer', 'Specialist'],
    bodyTypes: ['Box', 'Flatbed', 'Curtain', 'Refrigerated', 'Tanker'],
    fuelTypes: ['Diesel', 'Petrol', 'Electric', 'Hybrid', 'LPG'],
    customVehicleFields: [],
    customDriverFields: []
  },
  display: {
    defaultPageSize: 25,
    sortableColumns: ['license_plate', 'make', 'model', 'status', 'last_maintenance_date'],
    filterableColumns: ['status', 'vehicle_type', 'fuel_type', 'year'],
    showAdvancedFields: false,
    showTechnicalSpecs: false,
    showComplianceHistory: true,
    quickActionButtons: [
      { id: 'add-vehicle', name: 'Add Vehicle', icon: 'Plus', action: 'navigate', isVisible: true, requiresPermission: true },
      { id: 'bulk-edit', name: 'Bulk Edit', icon: 'Edit', action: 'bulk-edit', isVisible: true, requiresPermission: true },
      { id: 'export', name: 'Export', icon: 'Download', action: 'export', isVisible: true, requiresPermission: true }
    ]
  },
  vehicles: {
    requiredFields: ['vehicle_number', 'make', 'model', 'license_plate', 'status'],
    validationRules: [
      { type: 'required', value: true, message: 'This field is required' },
      { type: 'pattern', value: '^[A-Z0-9]{2,8}$', message: 'License plate must be 2-8 alphanumeric characters' }
    ],
    fieldDependencies: [],
    customFieldTypes: []
  },
  vehicleStatus: {
    statuses: [
      { id: 'active', name: 'Active', description: 'Vehicle is operational', color: '#10B981', isActive: true, canEdit: true, canDelete: false },
      { id: 'maintenance', name: 'In Maintenance', description: 'Vehicle is being serviced', color: '#F59E0B', isActive: true, canEdit: true, canDelete: false },
      { id: 'out_of_service', name: 'Out of Service', description: 'Vehicle is not operational', color: '#EF4444', isActive: true, canEdit: true, canDelete: false },
      { id: 'retired', name: 'Retired', description: 'Vehicle is no longer in use', color: '#6B7280', isActive: true, canEdit: false, canDelete: true }
    ],
    allowedTransitions: [
      { from: 'active', to: 'maintenance', requiresApproval: false, approvalRole: [], conditions: [] },
      { from: 'maintenance', to: 'active', requiresApproval: true, approvalRole: ['mechanic', 'admin'], conditions: [] },
      { from: 'active', to: 'out_of_service', requiresApproval: true, approvalRole: ['admin'], conditions: [] }
    ],
    statusColors: {
      active: '#10B981',
      maintenance: '#F59E0B',
      out_of_service: '#EF4444',
      retired: '#6B7280'
    },
    autoStatusRules: []
  },
  maintenance: {
    serviceIntervals: [
      { id: 'annual', name: 'Annual Service', mileage: 0, months: 12, description: 'Annual safety inspection and service', isActive: true },
      { id: '6month', name: '6-Month Service', mileage: 0, months: 6, description: 'Semi-annual maintenance check', isActive: true },
      { id: '10k', name: '10,000 Mile Service', mileage: 10000, months: 0, description: 'Service every 10,000 miles', isActive: true }
    ],
    maintenanceCategories: [
      { id: 'routine', name: 'Routine Maintenance', description: 'Regular scheduled maintenance', color: '#3B82F6', estimatedHours: 2, estimatedCost: 150 },
      { id: 'repair', name: 'Repair', description: 'Fix specific issues', color: '#EF4444', estimatedHours: 4, estimatedCost: 300 },
      { id: 'inspection', name: 'Inspection', description: 'Safety and compliance checks', color: '#10B981', estimatedHours: 1, estimatedCost: 75 }
    ],
    costThresholds: [
      { id: 'low', name: 'Low Cost', amount: 100, currency: 'GBP', requiresApproval: false, approvalRole: [] },
      { id: 'medium', name: 'Medium Cost', amount: 500, currency: 'GBP', requiresApproval: true, approvalRole: ['supervisor'] },
      { id: 'high', name: 'High Cost', amount: 1000, currency: 'GBP', requiresApproval: true, approvalRole: ['manager', 'admin'] }
    ],
    approvalWorkflows: [
      {
        id: 'standard',
        name: 'Standard Approval',
        steps: [
          { order: 1, role: 'supervisor', canApprove: true, canReject: true, canReturn: true, timeLimit: 24 },
          { order: 2, role: 'manager', canApprove: true, canReject: true, canReturn: false, timeLimit: 48 }
        ],
        isActive: true
      }
    ]
  },
  compliance: {
    complianceStandards: [
      { id: 'uk-hgv', name: 'UK HGV Standards', description: 'UK Heavy Goods Vehicle regulations', region: 'UK', industry: 'Transport', version: '2024', effectiveDate: '2024-01-01' }
    ],
    inspectionRequirements: [
      { id: 'daily', name: 'Daily Pre-Trip Inspection', frequency: 'daily', vehicleTypes: ['HGV', 'Van'], isMandatory: true, gracePeriod: 0 },
      { id: 'weekly', name: 'Weekly Safety Check', frequency: 'weekly', vehicleTypes: ['HGV', 'Van'], isMandatory: true, gracePeriod: 24 },
      { id: 'monthly', name: 'Monthly Compliance Review', frequency: 'monthly', vehicleTypes: ['HGV'], isMandatory: true, gracePeriod: 72 }
    ],
    violationCategories: [
      { id: 'minor', name: 'Minor Violation', severity: 'low', points: 1, fineRange: [50, 200], description: 'Minor regulatory infractions' },
      { id: 'moderate', name: 'Moderate Violation', severity: 'medium', points: 3, fineRange: [200, 500], description: 'Moderate compliance issues' },
      { id: 'major', name: 'Major Violation', severity: 'high', points: 6, fineRange: [500, 1000], description: 'Serious compliance breaches' },
      { id: 'critical', name: 'Critical Violation', severity: 'critical', points: 10, fineRange: [1000, 5000], description: 'Critical safety violations' }
    ],
    penaltyStructures: [
      {
        id: 'standard',
        name: 'Standard Penalty Structure',
        violations: ['minor', 'moderate', 'major', 'critical'],
        penalties: [
          { type: 'fine', value: 'range', duration: undefined },
          { type: 'points', value: 'standard', duration: undefined },
          { type: 'suspension', value: 'progressive', duration: 30 }
        ],
        escalationRules: []
      }
    ]
  },
  inspections: {
    questionSets: [
      {
        id: 'daily-pre-trip',
        name: 'Daily Pre-Trip Inspection',
        description: 'Standard daily vehicle safety check',
        questions: [
          { id: 'q1', question: 'Are all lights working?', type: 'yes_no', isRequired: true, order: 1 },
          { id: 'q2', question: 'Are tires in good condition?', type: 'yes_no', isRequired: true, order: 2 },
          { id: 'q3', question: 'Are brakes functioning properly?', type: 'yes_no', isRequired: true, order: 3 }
        ],
        isActive: true
      }
    ],
    inspectionTypes: [
      { id: 'daily', name: 'Daily Inspection', description: 'Daily pre-trip safety check', questionSets: ['daily-pre-trip'], frequency: 'daily', isActive: true }
    ],
    passFailCriteria: [
      {
        id: 'safety-critical',
        name: 'Safety Critical Items',
        criteria: [
          { field: 'brakes', operator: 'equals', value: 'pass', weight: 100 },
          { field: 'lights', operator: 'equals', value: 'pass', weight: 100 },
          { field: 'tires', operator: 'equals', value: 'pass', weight: 100 }
        ],
        passThreshold: 100,
        failThreshold: 0
      }
    ],
    followUpActions: [
      { id: 'immediate', name: 'Immediate Action Required', description: 'Vehicle must not be driven', type: 'maintenance', timeLimit: 0, assignedRole: ['mechanic', 'admin'] }
    ]
  },
  notifications: {
    alertThresholds: [
      { id: 'maintenance-due', name: 'Maintenance Due', metric: 'days_until_maintenance', operator: 'less_than', value: 7, severity: 'warning' },
      { id: 'inspection-overdue', name: 'Inspection Overdue', metric: 'days_since_last_inspection', operator: 'greater_than', value: 30, severity: 'error' }
    ],
    notificationRecipients: [
      { id: 'fleet-manager', name: 'Fleet Manager', email: 'fleet@company.com', role: ['admin'], preferences: [] }
    ],
    escalationRules: [
      { id: 'maintenance-escalation', name: 'Maintenance Escalation', trigger: 'maintenance_overdue', timeLimit: 24, escalationLevel: 1, recipients: ['supervisor'] }
    ],
    communicationChannels: [
      { id: 'email', name: 'Email Notifications', type: 'email', config: {}, isActive: true }
    ]
  },
  workflows: {
    approvalProcesses: [
      {
        id: 'maintenance-approval',
        name: 'Maintenance Approval',
        description: 'Standard maintenance request approval process',
        steps: [
          { order: 1, role: 'supervisor', canApprove: true, canReject: true, canReturn: true, timeLimit: 24 },
          { order: 2, role: 'manager', canApprove: true, canReject: true, canReturn: false, timeLimit: 48 }
        ],
        isActive: true
      }
    ],
    escalationRules: [
      { id: 'maintenance-escalation', name: 'Maintenance Escalation', trigger: 'maintenance_overdue', timeLimit: 24, escalationLevel: 1, recipients: ['supervisor'] }
    ],
    automationRules: [
      { id: 'auto-status-update', name: 'Auto Status Update', trigger: 'maintenance_completed', conditions: ['all_checks_passed'], actions: ['update_status_to_active'], isActive: true }
    ],
    notificationTemplates: [
      { id: 'maintenance-reminder', name: 'Maintenance Reminder', subject: 'Maintenance Due: {vehicle_number}', body: 'Vehicle {vehicle_number} is due for maintenance on {due_date}', variables: ['vehicle_number', 'due_date'], isActive: true }
    ]
  },
  reporting: {
    reportTemplates: [
      { id: 'fleet-summary', name: 'Fleet Summary Report', description: 'Overview of fleet status and performance', fields: ['vehicle_count', 'active_vehicles', 'maintenance_due'], filters: ['date_range', 'vehicle_type'], isActive: true }
    ],
    scheduledReports: [
      { id: 'weekly-fleet-report', name: 'Weekly Fleet Report', template: 'fleet-summary', schedule: 'weekly', recipients: ['fleet-manager'], isActive: true }
    ],
    dataExportFormats: ['csv', 'pdf', 'excel'],
    customMetrics: [
      { id: 'vehicle-utilization', name: 'Vehicle Utilization Rate', description: 'Percentage of time vehicles are operational', formula: '(active_hours / total_hours) * 100', unit: '%', isActive: true }
    ]
  }
};

// Context Interface
interface VehicleManagementSettingsContextType {
  settings: VehicleManagementSettings;
  isLoading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<VehicleManagementSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

// Create Context
const VehicleManagementSettingsContext = createContext<VehicleManagementSettingsContextType | undefined>(undefined);

// Provider Component
export const VehicleManagementSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<VehicleManagementSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from database
  const loadSettings = async () => {
    if (!user?.organization_id) {
      setSettings(defaultSettings);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('vehicle_management_settings')
        .select('settings')
        .eq('organization_id', user.organization_id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw fetchError;
      }

      if (data?.settings) {
        // Merge with defaults to ensure all fields exist
        const mergedSettings = mergeWithDefaults(data.settings);
        setSettings(mergedSettings);
      } else {
        // No settings found, use defaults
        setSettings(defaultSettings);
        // Save defaults to database
        await saveSettings(defaultSettings);
      }
    } catch (err) {
      console.error('Error loading vehicle management settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  // Save settings to database
  const saveSettings = async (newSettings: VehicleManagementSettings) => {
    if (!user?.organization_id) return;

    try {
      const { error: upsertError } = await supabase
        .from('vehicle_management_settings')
        .upsert({
          organization_id: user.organization_id,
          settings: newSettings,
          updated_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;
    } catch (err) {
      console.error('Error saving vehicle management settings:', err);
      throw err;
    }
  };

  // Update specific settings
  const updateSettings = async (updates: Partial<VehicleManagementSettings>) => {
    try {
      const newSettings = { ...settings, ...updates };
      await saveSettings(newSettings);
      setSettings(newSettings);
    } catch (err) {
      console.error('Error updating vehicle management settings:', err);
      throw err;
    }
  };

  // Reset to default settings
  const resetToDefaults = async () => {
    try {
      await saveSettings(defaultSettings);
      setSettings(defaultSettings);
    } catch (err) {
      console.error('Error resetting vehicle management settings:', err);
      throw err;
    }
  };

  // Refresh settings from database
  const refreshSettings = async () => {
    await loadSettings();
  };

  // Merge user settings with defaults to ensure all fields exist
  const mergeWithDefaults = (userSettings: Partial<VehicleManagementSettings>): VehicleManagementSettings => {
    return {
      ...defaultSettings,
      ...userSettings,
      fleet: { ...defaultSettings.fleet, ...userSettings.fleet },
      display: { ...defaultSettings.display, ...userSettings.display },
      vehicles: { ...defaultSettings.vehicles, ...userSettings.vehicles },
      vehicleStatus: { ...defaultSettings.vehicleStatus, ...userSettings.vehicleStatus },
      maintenance: { ...defaultSettings.maintenance, ...userSettings.maintenance },
      compliance: { ...defaultSettings.compliance, ...userSettings.compliance },
      inspections: { ...defaultSettings.inspections, ...userSettings.inspections },
      notifications: { ...defaultSettings.notifications, ...userSettings.notifications },
      workflows: { ...defaultSettings.workflows, ...userSettings.workflows },
      reporting: { ...defaultSettings.reporting, ...userSettings.reporting }
    };
  };

  // Load settings when user or organization changes
  useEffect(() => {
    loadSettings();
  }, [user?.organization_id]);

  const value: VehicleManagementSettingsContextType = {
    settings,
    isLoading,
    error,
    updateSettings,
    resetToDefaults,
    refreshSettings
  };

  return (
    <VehicleManagementSettingsContext.Provider value={value}>
      {children}
    </VehicleManagementSettingsContext.Provider>
  );
};

// Hook to use the context
export const useVehicleManagementSettings = (): VehicleManagementSettingsContextType => {
  const context = useContext(VehicleManagementSettingsContext);
  if (context === undefined) {
    throw new Error('useVehicleManagementSettings must be used within a VehicleManagementSettingsProvider');
  }
  return context;
};

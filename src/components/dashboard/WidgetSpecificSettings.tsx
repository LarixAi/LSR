import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Palette, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  CheckCircle,
  X
} from 'lucide-react';
import { useDashboardSettings } from '@/contexts/DashboardSettingsContext';
import type { WidgetPreferences } from '@/contexts/DashboardSettingsContext';

// ============================================================================
// COMPONENT INTERFACE
// ============================================================================

interface WidgetSpecificSettingsProps {
  widgetId: string;
  widgetType: string;
  onClose: () => void;
}

// ============================================================================
// WIDGET TYPE CONFIGURATIONS
// ============================================================================

const WIDGET_TYPE_CONFIGS = {
  vor_vehicles: {
    title: 'VOR Vehicles',
    description: 'Configure how VOR (Vehicle Off Road) information is displayed',
    availableFields: [
      { key: 'totalVOR', label: 'Total VOR Count', description: 'Show total number of vehicles off road' },
      { key: 'reasons', label: 'VOR Reasons', description: 'Display reasons for vehicles being off road' },
      { key: 'offRoadDate', label: 'Off Road Date', description: 'Show when vehicles went off road' },
      { key: 'estimatedReturn', label: 'Estimated Return', description: 'Display estimated return dates' },
      { key: 'vehicleTypes', label: 'Vehicle Types', description: 'Show types of vehicles affected' }
    ],
    alertThresholds: {
      warning: { label: 'Warning Threshold', description: 'Alert when VOR count exceeds this number' },
      critical: { label: 'Critical Threshold', description: 'Critical alert threshold for VOR count' }
    },
    colorCoding: [
      { value: 'status', label: 'By Status' },
      { value: 'priority', label: 'By Priority' },
      { value: 'duration', label: 'By Duration' }
    ]
  },
  fuel_reports: {
    title: 'Fuel Reports',
    description: 'Configure fuel consumption and cost display options',
    availableFields: [
      { key: 'totalReports', label: 'Total Reports', description: 'Show total number of fuel reports' },
      { key: 'pendingReview', label: 'Pending Review', description: 'Display reports awaiting review' },
      { key: 'totalCost', label: 'Total Cost', description: 'Show total fuel costs' },
      { key: 'averageConsumption', label: 'Average Consumption', description: 'Display average fuel consumption' },
      { key: 'lastUpdated', label: 'Last Updated', description: 'Show when data was last refreshed' }
    ],
    alertThresholds: {
      cost: { label: 'Cost Threshold', description: 'Alert when fuel costs exceed this amount' },
      consumption: { label: 'Consumption Threshold', description: 'Alert for unusual consumption patterns' }
    },
    units: [
      { value: 'L/100km', label: 'Liters per 100km' },
      { value: 'mpg', label: 'Miles per gallon' },
      { value: 'km/L', label: 'Kilometers per liter' }
    ]
  },
  maintenance_due: {
    title: 'Maintenance Due',
    description: 'Configure maintenance reminder and alert settings',
    availableFields: [
      { key: 'dueCount', label: 'Due Count', description: 'Show number of maintenance items due' },
      { key: 'priority', label: 'Priority Level', description: 'Display priority levels' },
      { key: 'dueDate', label: 'Due Date', description: 'Show when maintenance is due' },
      { key: 'vehicleInfo', label: 'Vehicle Info', description: 'Display vehicle details' },
      { key: 'maintenanceType', label: 'Maintenance Type', description: 'Show type of maintenance required' }
    ],
    alertThresholds: {
      warning: { label: 'Warning Days', description: 'Days before due date to show warning' },
      critical: { label: 'Critical Days', description: 'Days before due date for critical alert' }
    },
    priorityColors: [
      { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800' },
      { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'high', label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
      { value: 'critical', label: 'Critical Priority', color: 'bg-red-100 text-red-800' }
    ]
  },
  driver_compliance: {
    title: 'Driver Compliance',
    description: 'Configure driver compliance monitoring and alert settings',
    availableFields: [
      { key: 'complianceScore', label: 'Compliance Score', description: 'Show overall compliance percentage' },
      { key: 'riskLevel', label: 'Risk Level', description: 'Display risk assessment levels' },
      { key: 'violations', label: 'Violations', description: 'Show number of violations' },
      { key: 'trainingStatus', label: 'Training Status', description: 'Display training completion status' },
      { key: 'lastReview', label: 'Last Review', description: 'Show when compliance was last reviewed' }
    ],
    alertThresholds: {
      warning: { label: 'Warning Score', description: 'Compliance score threshold for warnings' },
      critical: { label: 'Critical Score', description: 'Compliance score threshold for critical alerts' }
    },
    riskLevels: [
      { value: 'low', label: 'Low Risk', color: 'bg-green-100 text-green-800' },
      { value: 'medium', label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'high', label: 'High Risk', color: 'bg-orange-100 text-orange-800' },
      { value: 'critical', label: 'Critical Risk', color: 'bg-red-100 text-red-800' }
    ]
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function WidgetSpecificSettings({ widgetId, widgetType, onClose }: WidgetSpecificSettingsProps) {
  const { 
    getWidgetPreferences, 
    updateWidgetPreferences 
  } = useDashboardSettings();

  const [preferences, setPreferences] = useState<WidgetPreferences>(
    getWidgetPreferences(widgetId)
  );

  const widgetConfig = WIDGET_TYPE_CONFIGS[widgetType as keyof typeof WIDGET_TYPE_CONFIGS];

  if (!widgetConfig) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Widget type not supported</div>
        <div className="text-sm text-gray-400">{widgetType}</div>
      </div>
    );
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFieldToggle = (fieldKey: string) => {
    const newDisplayFields = preferences.displayFields.includes(fieldKey)
      ? preferences.displayFields.filter(f => f !== fieldKey)
      : [...preferences.displayFields, fieldKey];
    
    setPreferences(prev => ({
      ...prev,
      displayFields: newDisplayFields
    }));
  };

  const handleRefreshIntervalChange = (interval: string) => {
    setPreferences(prev => ({
      ...prev,
      refreshInterval: parseInt(interval)
    }));
  };

  const handleAlertThresholdChange = (type: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      alertThresholds: {
        ...prev.alertThresholds,
        [type]: parseFloat(value)
      }
    }));
  };

  const handleVisualPreferenceChange = (key: keyof typeof preferences.visualPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      visualPreferences: {
        ...prev.visualPreferences,
        [key]: value
      }
    }));
  };

  const handleDataPreferenceChange = (key: keyof typeof preferences.dataPreferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      dataPreferences: {
        ...prev.dataPreferences,
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    updateWidgetPreferences(widgetId, preferences);
    onClose();
  };

  const handleReset = () => {
    setPreferences(getWidgetPreferences(widgetId));
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderDisplayFields = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Display Fields</h4>
        <p className="text-xs text-gray-600 mb-3">Select which information to display in this widget</p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {widgetConfig.availableFields.map((field) => {
          const isSelected = preferences.displayFields.includes(field.key);
          return (
            <div
              key={field.key}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleFieldToggle(field.key)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {field.label}
                  </div>
                  <div className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                    {field.description}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderRefreshSettings = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Refresh Settings</h4>
        <p className="text-xs text-gray-600">Configure how often this widget updates its data</p>
      </div>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="refreshInterval">Refresh Interval</Label>
          <Select 
            value={preferences.refreshInterval.toString()} 
            onValueChange={handleRefreshIntervalChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
              <SelectItem value="300">5 minutes</SelectItem>
              <SelectItem value="600">10 minutes</SelectItem>
              <SelectItem value="900">15 minutes</SelectItem>
              <SelectItem value="1800">30 minutes</SelectItem>
              <SelectItem value="3600">1 hour</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="offlineMode"
            checked={preferences.dataPreferences.offlineMode}
            onCheckedChange={(checked) => handleDataPreferenceChange('offlineMode', checked.toString())}
          />
          <Label htmlFor="offlineMode">Enable offline mode</Label>
        </div>
      </div>
    </div>
  );

  const renderAlertThresholds = () => {
    if (!widgetConfig.alertThresholds) return null;

    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Alert Thresholds</h4>
          <p className="text-xs text-gray-600">Set thresholds for automated alerts</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="alertsEnabled"
              checked={preferences.alertThresholds.enabled}
              onCheckedChange={(checked) => setPreferences(prev => ({
                ...prev,
                alertThresholds: { ...prev.alertThresholds, enabled: checked }
              }))}
            />
            <Label htmlFor="alertsEnabled">Enable alerts</Label>
          </div>

          {preferences.alertThresholds.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(widgetConfig.alertThresholds).map(([key, config]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`threshold-${key}`}>{config.label}</Label>
                  <Input
                    id={`threshold-${key}`}
                    type="number"
                    value={preferences.alertThresholds[key as keyof typeof preferences.alertThresholds] || 0}
                    onChange={(e) => handleAlertThresholdChange(key, e.target.value)}
                    placeholder="Enter threshold value"
                  />
                  <p className="text-xs text-gray-500">{config.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVisualPreferences = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Visual Preferences</h4>
        <p className="text-xs text-gray-600">Customize how information is displayed</p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="showIcons"
            checked={preferences.visualPreferences.showIcons}
            onCheckedChange={(checked) => handleVisualPreferenceChange('showIcons', checked)}
          />
          <Label htmlFor="showIcons">Show icons</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="showTrends"
            checked={preferences.visualPreferences.showTrends}
            onCheckedChange={(checked) => handleVisualPreferenceChange('showTrends', checked)}
          />
          <Label htmlFor="showTrends">Show trend indicators</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="colorCoding"
            checked={preferences.visualPreferences.colorCoding}
            onCheckedChange={(checked) => handleVisualPreferenceChange('colorCoding', checked)}
          />
          <Label htmlFor="colorCoding">Enable color coding</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="compactMode"
            checked={preferences.visualPreferences.compactMode}
            onCheckedChange={(checked) => handleVisualPreferenceChange('compactMode', checked)}
          />
          <Label htmlFor="compactMode">Compact mode</Label>
        </div>
      </div>
    </div>
  );

  const renderDataPreferences = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Data Preferences</h4>
        <p className="text-xs text-gray-600">Configure data display and refresh strategies</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="historicalRange">Historical Range</Label>
          <Select 
            value={preferences.dataPreferences.historicalRange} 
            onValueChange={(value) => handleDataPreferenceChange('historicalRange', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="refreshStrategy">Refresh Strategy</Label>
          <Select 
            value={preferences.dataPreferences.refreshStrategy} 
            onValueChange={(value) => handleDataPreferenceChange('refreshStrategy', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="interval">Interval-based</SelectItem>
              <SelectItem value="manual">Manual refresh</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{widgetConfig.title}</h3>
          <p className="text-sm text-gray-600">{widgetConfig.description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Separator />

      {/* Settings Sections */}
      <div className="space-y-6">
        {renderDisplayFields()}
        {renderRefreshSettings()}
        {renderAlertThresholds()}
        {renderVisualPreferences()}
        {renderDataPreferences()}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {preferences.displayFields.length} fields selected
          </Badge>
          <Badge variant="outline" className="text-xs">
            Refresh: {preferences.refreshInterval}s
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

import { useVehicleManagementSettings } from '@/contexts/VehicleManagementSettingsContext';
import {
  Car,
  Wrench,
  Shield,
  Eye,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  FileText,
  Bell,
  Workflow,
  BarChart3,
  Palette,
  Database,
  ArrowLeft
} from 'lucide-react';

const VehicleManagementSettings = () => {
  const { settings, updateSettings, resetToDefaults, isLoading } = useVehicleManagementSettings();
  const [activeTab, setActiveTab] = useState('fleet');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(settings);
      toast.success('Vehicle Management settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetToDefaults();
      toast.success('Settings reset to defaults');
    } catch (error) {
      toast.error('Failed to reset settings');
      console.error('Error resetting settings:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Vehicle Management settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()} 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Car className="w-6 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Vehicle Management Settings</h2>
              <p className="text-muted-foreground">
                Configure fleet management, maintenance, compliance, and inspection settings
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8 bg-white shadow-sm">
          <TabsTrigger value="fleet" className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            Fleet
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Display
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="inspections" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Inspections
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            Workflows
          </TabsTrigger>
        </TabsList>

        {/* Fleet Settings Tab */}
        <TabsContent value="fleet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Fleet Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxVehicles">Maximum Vehicles</Label>
                  <Input
                    id="maxVehicles"
                    type="number"
                    value={settings.fleet.maxVehicles}
                    onChange={(e) => updateSettings({
                      fleet: { ...settings.fleet, maxVehicles: parseInt(e.target.value) || 0 }
                    })}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDrivers">Maximum Drivers</Label>
                  <Input
                    id="maxDrivers"
                    type="number"
                    value={settings.fleet.maxDrivers}
                    onChange={(e) => updateSettings({
                      fleet: { ...settings.fleet, maxDrivers: parseInt(e.target.value) || 0 }
                    })}
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Vehicle Types</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.fleet.vehicleTypes.map((type, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {type}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => {
                          const newTypes = settings.fleet.vehicleTypes.filter((_, i) => i !== index);
                          updateSettings({ fleet: { ...settings.fleet, vehicleTypes: newTypes } });
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newType = prompt('Enter new vehicle type:');
                      if (newType) {
                        updateSettings({
                          fleet: { ...settings.fleet, vehicleTypes: [...settings.fleet.vehicleTypes, newType] }
                        });
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Type
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Body Types</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.fleet.bodyTypes.map((type, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {type}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => {
                          const newTypes = settings.fleet.bodyTypes.filter((_, i) => i !== index);
                          updateSettings({ fleet: { ...settings.fleet, bodyTypes: newTypes } });
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newType = prompt('Enter new body type:');
                      if (newType) {
                        updateSettings({
                          fleet: { ...settings.fleet, bodyTypes: [...settings.fleet.bodyTypes, newType] }
                        });
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Type
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Settings Tab */}
        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Display Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultPageSize">Default Page Size</Label>
                  <Select
                    value={settings.display.defaultPageSize.toString()}
                    onValueChange={(value) => updateSettings({
                      display: { ...settings.display, defaultPageSize: parseInt(value) }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="showAdvancedFields">Show Advanced Fields</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showAdvancedFields"
                      checked={settings.display.showAdvancedFields}
                      onCheckedChange={(checked) => updateSettings({
                        display: { ...settings.display, showAdvancedFields: checked }
                      })}
                    />
                    <Label htmlFor="showAdvancedFields">
                      {settings.display.showAdvancedFields ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="showTechnicalSpecs">Show Technical Specifications</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showTechnicalSpecs"
                      checked={settings.display.showTechnicalSpecs}
                      onCheckedChange={(checked) => updateSettings({
                        display: { ...settings.display, showTechnicalSpecs: checked }
                      })}
                    />
                    <Label htmlFor="showTechnicalSpecs">
                      {settings.display.showTechnicalSpecs ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="showComplianceHistory">Show Compliance History</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showComplianceHistory"
                      checked={settings.display.showComplianceHistory}
                      onCheckedChange={(checked) => updateSettings({
                        display: { ...settings.display, showComplianceHistory: checked }
                      })}
                    />
                    <Label htmlFor="showComplianceHistory">
                      {settings.display.showComplianceHistory ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicle Settings Tab */}
        <TabsContent value="vehicles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Vehicle Field Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Required Fields</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['vehicle_number', 'make', 'model', 'license_plate', 'status', 'year', 'vehicle_type'].map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={field}
                        checked={settings.vehicles.requiredFields.includes(field)}
                        onChange={(e) => {
                          const newRequiredFields = e.target.checked
                            ? [...settings.vehicles.requiredFields, field]
                            : settings.vehicles.requiredFields.filter(f => f !== field);
                          updateSettings({
                            vehicles: { ...settings.vehicles, requiredFields: newRequiredFields }
                          });
                        }}
                      />
                      <Label htmlFor={field} className="text-sm capitalize">
                        {field.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Vehicle Status Configuration</Label>
                <div className="space-y-4">
                  {settings.vehicleStatus.statuses.map((status) => (
                    <div key={status.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="font-medium">{status.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={status.isActive}
                          onCheckedChange={(checked) => {
                            const newStatuses = settings.vehicleStatus.statuses.map(s =>
                              s.id === status.id ? { ...s, isActive: checked } : s
                            );
                            updateSettings({
                              vehicleStatus: { ...settings.vehicleStatus, statuses: newStatuses }
                            });
                          }}
                        />
                        <Label className="text-sm">
                          {status.isActive ? 'Active' : 'Inactive'}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Settings Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Maintenance Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Service Intervals</Label>
                <div className="space-y-4">
                  {settings.maintenance.serviceIntervals.map((interval) => (
                    <div key={interval.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{interval.name}</h4>
                        <Switch
                          checked={interval.isActive}
                          onCheckedChange={(checked) => {
                            const newIntervals = settings.maintenance.serviceIntervals.map(i =>
                              i.id === interval.id ? { ...i, isActive: checked } : i
                            );
                            updateSettings({
                              maintenance: { ...settings.maintenance, serviceIntervals: newIntervals }
                            });
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Mileage:</span> {interval.mileage.toLocaleString()}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Months:</span> {interval.months}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{interval.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Cost Thresholds</Label>
                <div className="space-y-4">
                  {settings.maintenance.costThresholds.map((threshold) => (
                    <div key={threshold.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{threshold.name}</h4>
                        <Badge variant={threshold.requiresApproval ? 'destructive' : 'secondary'}>
                          {threshold.requiresApproval ? 'Approval Required' : 'No Approval'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Amount:</span> £{threshold.amount.toLocaleString()}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Currency:</span> {threshold.currency}
                        </div>
                      </div>
                      {threshold.requiresApproval && (
                        <div className="mt-2">
                          <span className="text-sm text-muted-foreground">Approval Roles: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {threshold.approvalRole.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Settings Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Compliance Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Violation Categories</Label>
                <div className="space-y-4">
                  {settings.compliance.violationCategories.map((category) => (
                    <div key={category.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{category.name}</h4>
                        <Badge
                          variant={
                            category.severity === 'critical' ? 'destructive' :
                            category.severity === 'high' ? 'destructive' :
                            category.severity === 'medium' ? 'default' : 'secondary'
                          }
                        >
                          {category.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Points:</span> {category.points}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fine Range:</span> £{category.fineRange[0].toLocaleString()} - £{category.fineRange[1].toLocaleString()}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{category.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Inspection Requirements</Label>
                <div className="space-y-4">
                  {settings.compliance.inspectionRequirements.map((requirement) => (
                    <div key={requirement.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{requirement.name}</h4>
                        <Badge variant={requirement.isMandatory ? 'destructive' : 'secondary'}>
                          {requirement.isMandatory ? 'Mandatory' : 'Optional'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Frequency:</span> {requirement.frequency}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Grace Period:</span> {requirement.gracePeriod} hours
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">Vehicle Types: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {requirement.vehicleTypes.map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inspection Settings Tab */}
        <TabsContent value="inspections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Inspection Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Question Sets</Label>
                <div className="space-y-4">
                  {settings.inspections.questionSets.map((questionSet) => (
                    <div key={questionSet.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{questionSet.name}</h4>
                        <Switch
                          checked={questionSet.isActive}
                          onCheckedChange={(checked) => {
                            const newQuestionSets = settings.inspections.questionSets.map(qs =>
                              qs.id === questionSet.id ? { ...qs, isActive: checked } : qs
                            );
                            updateSettings({
                              inspections: { ...settings.inspections, questionSets: newQuestionSets }
                            });
                          }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{questionSet.description}</p>
                      <div className="space-y-2">
                        {questionSet.questions.map((question) => (
                          <div key={question.id} className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">{question.order}.</span>
                            <span>{question.question}</span>
                            <Badge variant="outline" className="text-xs">
                              {question.type.replace('_', ' ')}
                            </Badge>
                            {question.isRequired && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Alert Thresholds</Label>
                <div className="space-y-4">
                  {settings.notifications.alertThresholds.map((threshold) => (
                    <div key={threshold.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{threshold.name}</h4>
                        <Badge
                          variant={
                            threshold.severity === 'critical' ? 'destructive' :
                            threshold.severity === 'error' ? 'destructive' :
                            threshold.severity === 'warning' ? 'default' : 'secondary'
                          }
                        >
                          {threshold.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Metric:</span> {threshold.metric.replace('_', ' ')}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Operator:</span> {threshold.operator.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">Value: </span>
                        <Badge variant="outline">{threshold.value}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Settings Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                Workflow Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Approval Processes</Label>
                <div className="space-y-4">
                  {settings.workflows.approvalProcesses.map((process) => (
                    <div key={process.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{process.name}</h4>
                        <Switch
                          checked={process.isActive}
                          onCheckedChange={(checked) => {
                            const newProcesses = settings.workflows.approvalProcesses.map(p =>
                              p.id === process.id ? { ...p, isActive: checked } : p
                            );
                            updateSettings({
                              workflows: { ...settings.workflows, approvalProcesses: newProcesses }
                            });
                          }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{process.description}</p>
                      <div className="space-y-2">
                        {process.steps.map((step, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{step.order}</Badge>
                            <span className="font-medium">{step.role}</span>
                            <div className="flex gap-1">
                              {step.canApprove && <Badge variant="secondary" className="text-xs">Approve</Badge>}
                              {step.canReject && <Badge variant="destructive" className="text-xs">Reject</Badge>}
                              {step.canReturn && <Badge variant="outline" className="text-xs">Return</Badge>}
                            </div>
                            {step.timeLimit && (
                              <span className="text-muted-foreground">
                                ({step.timeLimit}h limit)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleManagementSettings;

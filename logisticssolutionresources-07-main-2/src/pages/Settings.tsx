import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings } from '@/hooks/useSettings';
import { Settings as SettingsIcon, Shield, Users, Route, Truck, Bell, Database, Globe, CreditCard, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeSettings from '@/components/settings/ThemeSettings';

const Settings = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading, saving, updateSetting, saveSettings } = useSettings();
  const navigate = useNavigate();

  if (authLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (profile.role !== 'admin' && profile.role !== 'council') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSaveSettings = () => {
    saveSettings(settings);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
            <p className="text-gray-600">Configure and manage your transport system</p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-1 h-auto p-1">
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="routes">Routes</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="drivers">Drivers</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>

            <TabsContent value="theme">
              <ThemeSettings />
            </TabsContent>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>General Settings</span>
                  </CardTitle>
                  <CardDescription>Basic organization and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input
                        id="orgName"
                        value={settings.organizationName}
                        onChange={(e) => updateSetting('organizationName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => updateSetting('contactEmail', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        value={settings.contactPhone}
                        onChange={(e) => updateSetting('contactPhone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={settings.address}
                        onChange={(e) => updateSetting('address', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Security Settings</span>
                  </CardTitle>
                  <CardDescription>Authentication and access control settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactor">Require Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Enforce 2FA for all users</p>
                    </div>
                    <Switch
                      id="twoFactor"
                      checked={settings.requireTwoFactor}
                      onCheckedChange={(checked) => updateSetting('requireTwoFactor', checked)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="passwordComplexity">Password Complexity</Label>
                      <Select value={settings.passwordComplexity} onValueChange={(value) => updateSetting('passwordComplexity', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notification Settings</span>
                  </CardTitle>
                  <CardDescription>Configure how users receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifs">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Send notifications via email</p>
                      </div>
                      <Switch
                        id="emailNotifs"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smsNotifs">SMS Notifications</Label>
                        <p className="text-sm text-gray-500">Send notifications via SMS</p>
                      </div>
                      <Switch
                        id="smsNotifs"
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pushNotifs">Push Notifications</Label>
                        <p className="text-sm text-gray-500">Send browser push notifications</p>
                      </div>
                      <Switch
                        id="pushNotifs"
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notifFreq">Notification Frequency</Label>
                    <Select value={settings.notificationFrequency} onValueChange={(value) => updateSetting('notificationFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly Digest</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="routes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Route className="w-5 h-5" />
                    <span>Route Management Settings</span>
                  </CardTitle>
                  <CardDescription>Configure route creation and management rules</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxCapacity">Maximum Route Capacity</Label>
                      <Input
                        id="maxCapacity"
                        type="number"
                        value={settings.maxRouteCapacity}
                        onChange={(e) => updateSetting('maxRouteCapacity', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="defaultDuration">Default Route Duration (minutes)</Label>
                      <Input
                        id="defaultDuration"
                        type="number"
                        value={settings.defaultRouteDuration}
                        onChange={(e) => updateSetting('defaultRouteDuration', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="routeOverlap">Allow Route Time Overlap</Label>
                        <p className="text-sm text-gray-500">Allow routes to have overlapping schedules</p>
                      </div>
                      <Switch
                        id="routeOverlap"
                        checked={settings.allowRouteOverlap}
                        onCheckedChange={(checked) => updateSetting('allowRouteOverlap', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="routeApproval">Require Route Approval</Label>
                        <p className="text-sm text-gray-500">New routes must be approved by admin</p>
                      </div>
                      <Switch
                        id="routeApproval"
                        checked={settings.requireRouteApproval}
                        onCheckedChange={(checked) => updateSetting('requireRouteApproval', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vehicles">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="w-5 h-5" />
                    <span>Vehicle Management Settings</span>
                  </CardTitle>
                  <CardDescription>Configure vehicle maintenance and monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxAge">Maximum Vehicle Age (years)</Label>
                      <Input
                        id="maxAge"
                        type="number"
                        value={settings.maxVehicleAge}
                        onChange={(e) => updateSetting('maxVehicleAge', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maintenanceReminder">Maintenance Reminder (days)</Label>
                      <Input
                        id="maintenanceReminder"
                        type="number"
                        value={settings.maintenanceReminder}
                        onChange={(e) => updateSetting('maintenanceReminder', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fuelThreshold">Low Fuel Alert Threshold (%)</Label>
                      <Input
                        id="fuelThreshold"
                        type="number"
                        value={settings.fuelThreshold}
                        onChange={(e) => updateSetting('fuelThreshold', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="dailyChecks">Require Daily Vehicle Checks</Label>
                        <p className="text-sm text-gray-500">Mandatory daily vehicle inspections</p>
                      </div>
                      <Switch
                        id="dailyChecks"
                        checked={settings.requireDailyChecks}
                        onCheckedChange={(checked) => updateSetting('requireDailyChecks', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="drivers">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Driver Management Settings</span>
                  </CardTitle>
                  <CardDescription>Configure driver requirements and monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxHours">Maximum Driver Hours per Day</Label>
                      <Input
                        id="maxHours"
                        type="number"
                        value={settings.maxDriverHours}
                        onChange={(e) => updateSetting('maxDriverHours', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseReminder">License Expiry Reminder (days)</Label>
                      <Input
                        id="licenseReminder"
                        type="number"
                        value={settings.licenseExpiryReminder}
                        onChange={(e) => updateSetting('licenseExpiryReminder', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="backgroundCheck">Background Check Interval (months)</Label>
                      <Input
                        id="backgroundCheck"
                        type="number"
                        value={settings.backgroundCheckInterval}
                        onChange={(e) => updateSetting('backgroundCheckInterval', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="driverTraining">Require Driver Training</Label>
                        <p className="text-sm text-gray-500">Mandatory training for new drivers</p>
                      </div>
                      <Switch
                        id="driverTraining"
                        checked={settings.requireDriverTraining}
                        onCheckedChange={(checked) => updateSetting('requireDriverTraining', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5" />
                    <span>System Settings</span>
                  </CardTitle>
                  <CardDescription>Configure system behavior and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dataRetention">Data Retention Period (months)</Label>
                      <Input
                        id="dataRetention"
                        type="number"
                        value={settings.dataRetentionPeriod}
                        onChange={(e) => updateSetting('dataRetentionPeriod', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="backupFreq">Backup Frequency</Label>
                      <Select value={settings.backupFrequency} onValueChange={(value) => updateSetting('backupFrequency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="apiLimit">API Rate Limit (requests/hour)</Label>
                      <Input
                        id="apiLimit"
                        type="number"
                        value={settings.apiRateLimit}
                        onChange={(e) => updateSetting('apiRateLimit', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="debugMode">Debug Mode</Label>
                        <p className="text-sm text-gray-500">Enable detailed system logging</p>
                      </div>
                      <Switch
                        id="debugMode"
                        checked={settings.debugMode}
                        onCheckedChange={(checked) => updateSetting('debugMode', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <SettingsIcon className="w-5 h-5" />
                    <span>External Integrations</span>
                  </CardTitle>
                  <CardDescription>Configure third-party service integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="googleMaps">Google Maps API Configuration</Label>
                      <p className="text-sm text-gray-500 mb-2">Manage Google Maps integration settings</p>
                      <Button variant="outline">Configure Google Maps</Button>
                    </div>
                    <div>
                      <Label htmlFor="smsProvider">SMS Provider Configuration</Label>
                      <p className="text-sm text-gray-500 mb-2">Set up SMS notification service</p>
                      <Button variant="outline">Configure SMS Provider</Button>
                    </div>
                    <div>
                      <Label htmlFor="emailProvider">Email Provider Configuration</Label>
                      <p className="text-sm text-gray-500 mb-2">Configure email service settings</p>
                      <Button variant="outline">Configure Email Provider</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-8">
            <Button onClick={handleSaveSettings} size="lg" disabled={saving}>
              {saving ? 'Saving...' : 'Save All Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

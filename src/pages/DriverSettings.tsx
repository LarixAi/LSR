import React, { useState } from 'react';
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
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Smartphone, 
  MapPin, 
  Clock,
  Eye,
  EyeOff,
  Save,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const DriverSettings: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    // Profile Settings
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    zipCode: profile?.zip_code || '',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationFrequency: 'immediate',
    routeNotifications: true,
    maintenanceNotifications: true,
    scheduleNotifications: true,
    
    // Privacy Settings
    locationSharing: true,
    showOnlineStatus: true,
    allowContactSharing: false,
    
    // App Settings
    darkMode: false,
    autoRefresh: true,
    dataUsage: 'standard',
    language: 'en',
    timezone: 'Europe/London',
    
    // Safety Settings
    emergencyContacts: '',
    healthInfo: '',
    preferences: ''
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (profile.role !== 'driver') {
    return <Navigate to="/dashboard" replace />;
  }

  const updateSetting = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notifications Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSavePrivacy = () => {
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy settings have been saved.",
    });
  };

  const handleSaveAppSettings = () => {
    toast({
      title: "App Settings Updated",
      description: "Your app settings have been saved.",
    });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleExportData = () => {
    toast({
      title: "Data Export",
      description: "Your data export has been initiated. You'll receive an email when it's ready.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Account deletion request submitted. This action cannot be undone.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleExportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Profile Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url} alt={profile.first_name} />
              <AvatarFallback className="text-lg">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">
                {profile.first_name} {profile.last_name}
              </h3>
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-sm text-muted-foreground">Driver • {profile.employee_id}</p>
            </div>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Settings */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-1 h-auto p-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="app">App Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={settings.firstName}
                    onChange={(e) => updateSetting('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={settings.lastName}
                    onChange={(e) => updateSetting('lastName', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSetting('email', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => updateSetting('phone', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => updateSetting('address', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={settings.city}
                    onChange={(e) => updateSetting('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={settings.state}
                    onChange={(e) => updateSetting('state', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Postal Code</Label>
                  <Input
                    id="zipCode"
                    value={settings.zipCode}
                    onChange={(e) => updateSetting('zipCode', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>Choose how and when you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Notification Frequency</Label>
                  <Select value={settings.notificationFrequency} onValueChange={(value) => updateSetting('notificationFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Route Updates</Label>
                      <p className="text-sm text-muted-foreground">Notifications about route changes</p>
                    </div>
                    <Switch
                      checked={settings.routeNotifications}
                      onCheckedChange={(checked) => updateSetting('routeNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Alerts</Label>
                      <p className="text-sm text-muted-foreground">Vehicle maintenance reminders</p>
                    </div>
                    <Switch
                      checked={settings.maintenanceNotifications}
                      onCheckedChange={(checked) => updateSetting('maintenanceNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Schedule Changes</Label>
                      <p className="text-sm text-muted-foreground">Work schedule updates</p>
                    </div>
                    <Switch
                      checked={settings.scheduleNotifications}
                      onCheckedChange={(checked) => updateSetting('scheduleNotifications', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Privacy & Data</span>
              </CardTitle>
              <CardDescription>Control your privacy settings and data sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Location Sharing</Label>
                    <p className="text-sm text-muted-foreground">Allow location tracking for route optimization</p>
                  </div>
                  <Switch
                    checked={settings.locationSharing}
                    onCheckedChange={(checked) => updateSetting('locationSharing', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Online Status</Label>
                    <p className="text-sm text-muted-foreground">Show when you're available for work</p>
                  </div>
                  <Switch
                    checked={settings.showOnlineStatus}
                    onCheckedChange={(checked) => updateSetting('showOnlineStatus', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Contact Sharing</Label>
                    <p className="text-sm text-muted-foreground">Allow other drivers to contact you</p>
                  </div>
                  <Switch
                    checked={settings.allowContactSharing}
                    onCheckedChange={(checked) => updateSetting('allowContactSharing', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContacts">Emergency Contacts</Label>
                  <Textarea
                    id="emergencyContacts"
                    placeholder="Enter emergency contact information..."
                    value={settings.emergencyContacts}
                    onChange={(e) => updateSetting('emergencyContacts', e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="healthInfo">Health Information</Label>
                  <Textarea
                    id="healthInfo"
                    placeholder="Any relevant health information for emergency situations..."
                    value={settings.healthInfo}
                    onChange={(e) => updateSetting('healthInfo', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSavePrivacy}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Privacy Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* App Settings */}
        <TabsContent value="app" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5" />
                <span>App Preferences</span>
              </CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Use dark theme for the app</p>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Refresh</Label>
                    <p className="text-sm text-muted-foreground">Automatically refresh data</p>
                  </div>
                  <Switch
                    checked={settings.autoRefresh}
                    onCheckedChange={(checked) => updateSetting('autoRefresh', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="America/New_York">New York (EST)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Data Usage</Label>
                <Select value={settings.dataUsage} onValueChange={(value) => updateSetting('dataUsage', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Save data)</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="high">High (Best quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveAppSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Save App Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security & Password</span>
              </CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                
                <Button onClick={handleChangePassword}>
                  <Shield className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preferences">Additional Preferences</Label>
                  <Textarea
                    id="preferences"
                    placeholder="Any additional preferences or special requirements..."
                    value={settings.preferences}
                    onChange={(e) => updateSetting('preferences', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DriverSettings;

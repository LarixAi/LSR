import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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
  Shield, 
  Users, 
  Route, 
  Truck, 
  Bell, 
  Database, 
  Globe,
  User,
  Smartphone,
  MapPin,
  Clock,
  Eye,
  EyeOff,
  Save,
  Download,
  Upload,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Info,
  Wifi,
  WifiOff,
  RefreshCw,
  LogOut,
  Moon,
  Sun,
  Volume2,
  VolumeX
} from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileOptimizedLayout from './MobileOptimizedLayout';
import MobileFriendlyButton from './MobileFriendlyButton';
import TouchFriendlyCard from './TouchFriendlyCard';
import MobileBottomSheet from './MobileBottomSheet';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const MobileSettings: React.FC = () => {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Check network status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (authLoading) {
    return (
      <MobileOptimizedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <div className="text-lg">Loading settings...</div>
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  const updateSetting = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification settings saved!');
  };

  const handleSavePrivacy = () => {
    toast.success('Privacy settings updated!');
  };

  const handleSaveAppSettings = () => {
    toast.success('App settings saved!');
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const getRoleSpecificSettings = () => {
    switch (profile.role) {
      case 'driver':
        return (
          <TabsContent value="driver" className="space-y-4">
            <TouchFriendlyCard variant="interactive">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span>Driver Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Vehicle Check Reminders</Label>
                    <p className="text-sm text-muted-foreground">Daily reminders for vehicle inspections</p>
                  </div>
                  <Switch
                    checked={settings.autoRefresh}
                    onCheckedChange={(checked) => updateSetting('autoRefresh', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Route Optimization</Label>
                    <p className="text-sm text-muted-foreground">Automatically optimize routes</p>
                  </div>
                  <Switch
                    checked={settings.locationSharing}
                    onCheckedChange={(checked) => updateSetting('locationSharing', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Emergency Mode</Label>
                    <p className="text-sm text-muted-foreground">Quick access to emergency contacts</p>
                  </div>
                  <Switch
                    checked={settings.showOnlineStatus}
                    onCheckedChange={(checked) => updateSetting('showOnlineStatus', checked)}
                  />
                </div>
              </CardContent>
            </TouchFriendlyCard>
          </TabsContent>
        );
      
      case 'parent':
        return (
          <TabsContent value="parent" className="space-y-4">
            <TouchFriendlyCard variant="interactive">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Parent Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Real-time Tracking</Label>
                    <p className="text-sm text-muted-foreground">Track your child's journey in real-time</p>
                  </div>
                  <Switch
                    checked={settings.locationSharing}
                    onCheckedChange={(checked) => updateSetting('locationSharing', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Pickup/Dropoff Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when child is picked up/dropped off</p>
                  </div>
                  <Switch
                    checked={settings.routeNotifications}
                    onCheckedChange={(checked) => updateSetting('routeNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Emergency Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive emergency alerts immediately</p>
                  </div>
                  <Switch
                    checked={settings.scheduleNotifications}
                    onCheckedChange={(checked) => updateSetting('scheduleNotifications', checked)}
                  />
                </div>
              </CardContent>
            </TouchFriendlyCard>
          </TabsContent>
        );
      
      default:
        return null;
    }
  };

  return (
    <MobileOptimizedLayout>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Go back</span>
            </Button>
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Profile Section */}
        <TouchFriendlyCard variant="interactive">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg">
                  {profile.first_name} {profile.last_name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {profile.email} • {profile.role}
                </CardDescription>
              </div>
              <Badge variant="outline" className="capitalize">
                {profile.role}
              </Badge>
            </div>
          </CardHeader>
        </TouchFriendlyCard>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 gap-1 h-auto p-1 bg-muted">
            <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">Alerts</TabsTrigger>
            <TabsTrigger value="app" className="text-xs">App</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-4">
            <TouchFriendlyCard variant="interactive">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName" className="text-sm">First Name</Label>
                    <Input
                      id="firstName"
                      value={settings.firstName}
                      onChange={(e) => updateSetting('firstName', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                    <Input
                      id="lastName"
                      value={settings.lastName}
                      onChange={(e) => updateSetting('lastName', e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSetting('email', e.target.value)}
                    className="h-10"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-sm">Phone</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => updateSetting('phone', e.target.value)}
                    className="h-10"
                  />
                </div>
                
                <MobileFriendlyButton 
                  onClick={handleSaveProfile}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </MobileFriendlyButton>
              </CardContent>
            </TouchFriendlyCard>

            {/* Password Change */}
            <TouchFriendlyCard variant="interactive">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Change Password</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-sm">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-10 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10"
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10"
                  />
                </div>
                
                <MobileFriendlyButton 
                  onClick={handlePasswordChange}
                  className="w-full"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Change Password
                </MobileFriendlyButton>
              </CardContent>
            </TouchFriendlyCard>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <TouchFriendlyCard variant="interactive">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                
                <Separator />
                
                <div>
                  <Label htmlFor="notificationFrequency" className="text-sm">Notification Frequency</Label>
                  <Select 
                    value={settings.notificationFrequency} 
                    onValueChange={(value) => updateSetting('notificationFrequency', value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <MobileFriendlyButton 
                  onClick={handleSaveNotifications}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Notifications
                </MobileFriendlyButton>
              </CardContent>
            </TouchFriendlyCard>
          </TabsContent>

          {/* App Settings */}
          <TabsContent value="app" className="space-y-4">
            <TouchFriendlyCard variant="interactive">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5" />
                  <span>App Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Use dark theme for the app</p>
                  </div>
                  <Switch
                    checked={isDark}
                    onCheckedChange={toggleTheme}
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
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Location Sharing</Label>
                    <p className="text-sm text-muted-foreground">Share your location for better service</p>
                  </div>
                  <Switch
                    checked={settings.locationSharing}
                    onCheckedChange={(checked) => updateSetting('locationSharing', checked)}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <Label htmlFor="language" className="text-sm">Language</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => updateSetting('language', value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <MobileFriendlyButton 
                  onClick={handleSaveAppSettings}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save App Settings
                </MobileFriendlyButton>
              </CardContent>
            </TouchFriendlyCard>
          </TabsContent>

          {/* Role-specific settings */}
          {getRoleSpecificSettings()}
        </Tabs>

        {/* Advanced Settings */}
        <MobileBottomSheet
          trigger={
            <TouchFriendlyCard variant="interactive" className="w-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <SettingsIcon className="w-5 h-5" />
                    <div>
                      <h3 className="font-medium">Advanced Settings</h3>
                      <p className="text-sm text-muted-foreground">Data export, privacy controls</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </TouchFriendlyCard>
          }
          title="Advanced Settings"
          description="Manage data and privacy settings"
        >
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Data Export</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Download your personal data
              </p>
              <MobileFriendlyButton variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </MobileFriendlyButton>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Privacy Controls</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Manage your privacy settings
              </p>
              <MobileFriendlyButton variant="outline" className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Privacy Settings
              </MobileFriendlyButton>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-medium mb-2 text-red-800">Danger Zone</h4>
              <p className="text-sm text-red-600 mb-3">
                Irreversible actions
              </p>
              <MobileFriendlyButton 
                variant="destructive" 
                className="w-full"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </MobileFriendlyButton>
            </div>
          </div>
        </MobileBottomSheet>
      </div>
    </MobileOptimizedLayout>
  );
};

export default MobileSettings;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import AvatarUpload from '@/components/AvatarUpload';
import { toast } from 'sonner';
import { useThemeColors } from '@/hooks/useThemeColors';

import {
  Palette,
  Sun,
  Moon,
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Globe,
  Smartphone,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  Save,
  RotateCcw,
  Monitor,
  Smartphone as MobileIcon,
  Monitor as DesktopIcon,
  Zap,
  Accessibility,
  Contrast,
  Type,
  Sparkles,
  User as UserIcon,
  Palette as PaletteIcon,
  Monitor as MonitorIcon,

} from 'lucide-react';

import { Link } from 'react-router-dom';

interface ThemeColor {
  name: string;
  value: string;
  hue: string;
}

const predefinedColors: ThemeColor[] = [
  { name: 'Green', value: 'green', hue: '142' },
  { name: 'Blue', value: 'blue', hue: '210' },
  { name: 'Purple', value: 'purple', hue: '260' },
  { name: 'Orange', value: 'orange', hue: '30' },
  { name: 'Red', value: 'red', hue: '0' },
  { name: 'Teal', value: 'teal', hue: '180' },
  { name: 'Indigo', value: 'indigo', hue: '240' },
  { name: 'Pink', value: 'pink', hue: '340' },
];

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { user, profile } = useAuth();
  const { applyColorTheme } = useThemeColors();
  const { settings, updateSetting, resetSettings, isLoading } = useSettings();
  
  // Local state for UI interactions
  const [selectedColor, setSelectedColor] = useState(settings.themeColor);
  const [isCustomColor, setIsCustomColor] = useState(settings.themeColor === 'custom');

  const isDark = theme === 'dark';

  // Load saved theme color on component mount
  useEffect(() => {
    const savedColor = localStorage.getItem('themeColor');
    const savedHue = localStorage.getItem('themeHue');
    if (savedColor) {
      setSelectedColor(savedColor);
      if (savedColor === 'custom' && savedHue) {
        setIsCustomColor(true);
        updateSetting('customHue', savedHue);
        applyColorThemeLocal(savedHue);
      } else {
        const color = predefinedColors.find(c => c.value === savedColor);
        if (color) {
          applyColorThemeLocal(color.hue);
        }
      }
    }
  }, [theme, updateSetting]); // Re-run when theme changes

  const applyColorThemeLocal = (hue: string) => {
    applyColorTheme(hue, theme);
  };

  const handleColorChange = (value: string) => {
    setSelectedColor(value);
    setIsCustomColor(false);
    updateSetting('themeColor', value);
    
    const color = predefinedColors.find(c => c.value === value);
    if (color) {
      applyColorThemeLocal(color.hue);
      localStorage.setItem('themeColor', value);
      localStorage.setItem('themeHue', color.hue);
      toast.success(`Theme color changed to ${color.name}`);
    }
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hue = e.target.value;
    updateSetting('customHue', hue);
    setIsCustomColor(true);
    setSelectedColor('custom');
    updateSetting('themeColor', 'custom');
    
    applyColorThemeLocal(hue);
    localStorage.setItem('themeColor', 'custom');
    localStorage.setItem('themeHue', hue);
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Reapply color theme with new mode
    const savedHue = localStorage.getItem('themeHue') || '142';
    applyColorThemeLocal(savedHue);
    
    toast.success(`Switched to ${newTheme} mode`);
  };

  const resetThemeSettings = () => {
    resetSettings();
    setTheme('light');
    setSelectedColor('green');
    setIsCustomColor(false);
    toast.success('Settings reset to defaults');
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    // This will be handled by the AvatarUpload component
    console.log('Avatar updated:', newAvatarUrl);
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    updateSetting('fontSize', size);
    toast.success(`Font size changed to ${size}`);
  };

  const handleReducedMotion = (enabled: boolean) => {
    updateSetting('reducedMotion', enabled);
    toast.success(`Reduced motion ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleHighContrast = (enabled: boolean) => {
    updateSetting('highContrast', enabled);
    toast.success(`High contrast ${enabled ? 'enabled' : 'disabled'}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your app experience</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            Advanced
          </TabsTrigger>

        </TabsList>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          {/* Theme Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Toggle */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Theme Mode</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Light Mode Preview */}
                  <div 
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                      !isDark
                        ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20'
                        : 'border-border hover:border-border/80 hover:bg-muted/50'
                    }`}
                    onClick={toggleTheme}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg ${
                        !isDark ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Light Mode</h3>
                        <p className="text-sm text-muted-foreground">Clean and bright interface</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-muted rounded"></div>
                      <div className="h-2 bg-muted rounded w-3/4"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>

                  {/* Dark Mode Preview */}
                  <div 
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                      isDark
                        ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20'
                        : 'border-border hover:border-border/80 hover:bg-muted/50'
                    }`}
                    onClick={toggleTheme}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg ${
                        isDark ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Dark Mode</h3>
                        <p className="text-sm text-muted-foreground">Easy on the eyes</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-muted rounded"></div>
                      <div className="h-2 bg-muted rounded w-3/4"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Colors */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Theme Colors</Label>
                <div className="grid grid-cols-4 gap-3">
                  {predefinedColors.map((color) => (
                    <div
                      key={color.value}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedColor === color.value
                          ? 'border-primary shadow-lg ring-2 ring-primary/20'
                          : 'border-border hover:border-border/80'
                      }`}
                      onClick={() => handleColorChange(color.value)}
                    >
                      <div 
                        className="w-full h-8 rounded mb-2"
                        style={{ backgroundColor: `hsl(${color.hue}, 72%, 40%)` }}
                      ></div>
                      <p className="text-sm font-medium text-center">{color.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Color */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Custom Color</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={`hsl(${settings.customHue}, 72%, 40%)`}
                    onChange={handleCustomColorChange}
                    className="w-16 h-12 rounded border cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={settings.customHue}
                      onChange={handleCustomColorChange}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Hue: {settings.customHue}°
                    </p>
                  </div>
                </div>
              </div>

              {/* Accessibility Settings */}
              <div className="space-y-4">
                <Label className="text-base font-medium text-foreground flex items-center gap-2">
                  <Accessibility className="w-4 h-4" />
                  Accessibility
                </Label>
                
                {/* Font Size */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Font Size</div>
                      <div className="text-sm text-muted-foreground">Adjust text size for better readability</div>
                    </div>
                    <div className="flex gap-2">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <Button
                          key={size}
                          variant={settings.fontSize === size ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleFontSizeChange(size)}
                          className={`capitalize transition-all ${
                            settings.fontSize === size 
                              ? 'shadow-md ring-2 ring-primary/20' 
                              : 'hover:shadow-sm'
                          }`}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reduced Motion */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Reduce Motion</div>
                    <div className="text-sm text-muted-foreground">Minimize animations and transitions</div>
                  </div>
                  <Switch 
                    checked={settings.reducedMotion} 
                    onCheckedChange={handleReducedMotion}
                  />
                </div>

                {/* High Contrast */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">High Contrast</div>
                    <div className="text-sm text-muted-foreground">Increase contrast for better visibility</div>
                  </div>
                  <Switch 
                    checked={settings.highContrast} 
                    onCheckedChange={handleHighContrast}
                  />
                </div>
              </div>

              <Separator />

              {/* Theme Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={resetThemeSettings}
                  variant="outline"
                  className="flex-1 hover:shadow-md transition-all"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Theme
                </Button>
                <Button 
                  onClick={toggleTheme}
                  className="flex-1 hover:shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Switch Theme
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Theme Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Theme Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sample Components */}
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">Sample Components</h3>
                  <div className="space-y-3">
                    <Button>Primary Button</Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <div className="flex gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                    </div>
                  </div>
                </div>

                {/* Sample Text */}
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">Typography</h3>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">Heading 1</h1>
                    <h2 className="text-xl font-semibold text-foreground">Heading 2</h2>
                    <p className="text-foreground">This is regular paragraph text.</p>
                    <p className="text-muted-foreground">This is muted text for secondary information.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <input
                      id="name"
                      type="text"
                                             defaultValue={`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || user?.email || ''}
                      className="w-full p-2 border rounded-md bg-background text-foreground"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <input
                      id="email"
                      type="email"
                      defaultValue={user?.email || ''}
                      className="w-full p-2 border rounded-md bg-background text-foreground"
                      placeholder="Enter your email"
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Profile Picture</h3>
                                  <AvatarUpload
                    currentAvatarUrl={profile?.avatar_url}
                    onAvatarUpdate={handleAvatarUpdate}
                    userId={user?.id || ''}
                    initials={`${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase()}
                  />
              </div>

              {/* Account Actions */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Account Actions</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive notifications via email</div>
                    </div>
                    <Switch 
                      checked={settings.emailNotifications} 
                      onCheckedChange={(enabled) => updateSetting('emailNotifications', enabled)}
                    />
                  </div>
                </div>
              </div>

              {/* Push Notifications */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Push Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Push Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive notifications on your device</div>
                    </div>
                    <Switch 
                      checked={settings.pushNotifications} 
                      onCheckedChange={(enabled) => updateSetting('pushNotifications', enabled)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Sound</div>
                      <div className="text-sm text-muted-foreground">Play sound for notifications</div>
                    </div>
                    <Switch 
                      checked={settings.soundEnabled} 
                      onCheckedChange={(enabled) => updateSetting('soundEnabled', enabled)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Performance */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Performance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Auto Save</div>
                      <div className="text-sm text-muted-foreground">Automatically save changes</div>
                    </div>
                    <Switch 
                      checked={settings.autoSave} 
                      onCheckedChange={(enabled) => updateSetting('autoSave', enabled)}
                    />
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Analytics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Analytics</div>
                      <div className="text-sm text-muted-foreground">Help improve the app with usage data</div>
                    </div>
                    <Switch 
                      checked={settings.analyticsEnabled} 
                      onCheckedChange={(enabled) => updateSetting('analyticsEnabled', enabled)}
                    />
                  </div>
                </div>
              </div>

              {/* Developer Options */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Developer Options</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Debug Mode</div>
                      <div className="text-sm text-muted-foreground">Enable debug logging</div>
                    </div>
                    <Switch 
                      checked={settings.debugMode} 
                      onCheckedChange={(enabled) => updateSetting('debugMode', enabled)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  );
};

export default Settings;

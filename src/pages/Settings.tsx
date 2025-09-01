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
import { useDashboardSettings } from '@/contexts/DashboardSettingsContext';
import AvatarUpload from '@/components/AvatarUpload';
import { DashboardSettingsModal } from '@/components/dashboard/DashboardSettingsModal';
import VehicleManagementSettings from '@/components/settings/VehicleManagementSettings';
import { toast } from 'sonner';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Slider } from '@/components/ui/slider';
import { syncWithServer } from '@/utils/localStorage';

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
  BarChart3,
  Layout,
  Square,
  Cog,
  ArrowLeft,
  Car,
} from 'lucide-react';

import { Link, useSearchParams, useNavigate } from 'react-router-dom';

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
  const { settings: dashboardSettings, resetToDefaults: resetDashboardSettings } = useDashboardSettings();
  const navigate = useNavigate();
  
  // Local state for UI interactions
  const [selectedColor, setSelectedColor] = useState(settings.themeColor);
  const [isCustomColor, setIsCustomColor] = useState(settings.themeColor === 'custom');
  const [showDashboardSettingsModal, setShowDashboardSettingsModal] = useState(false);
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'appearance';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const isDark = theme === 'dark';
  const [isSaving, setIsSaving] = useState(false);

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

  // Update activeTab when URL changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

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
    // Apply preset and clear custom override so preset takes effect
    updateSetting('fontSize', size);
    updateSetting('customFontSize', 16);
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
        <div className="flex items-center gap-4">
          {defaultTab === 'dashboard' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Customize your app experience</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isSaving}
            onClick={async () => {
              try {
                setIsSaving(true);
                updateSetting('lastSaved', Date.now());
                await syncWithServer();
                toast.success('Settings saved');
              } catch (e) {
                toast.error('Failed to save settings');
              } finally {
                setIsSaving(false);
              }
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="vehicle-management" className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            Vehicle Management
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

                {/* Custom Font Size Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Custom Font Size</div>
                      <div className="text-sm text-muted-foreground">Fine-tune the font size (px)</div>
                    </div>
                    <div className="text-sm text-muted-foreground min-w-[60px] text-right">
                      {settings.customFontSize}px
                    </div>
                  </div>
                  <div className="px-1">
                    <Slider
                      min={12}
                      max={22}
                      step={1}
                      value={[settings.customFontSize]}
                      onValueChange={(val) => updateSetting('customFontSize', Number(val[0]))}
                      className="w-full"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Tip: Setting a custom value overrides the preset until reset.
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

          {/* Theme preview removed as requested */}
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

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Dashboard Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Customize your admin dashboard layout, widgets, and display preferences
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Settings */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Quick Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">Auto Layout</div>
                        <div className="text-sm text-muted-foreground">Automatically arrange widgets</div>
                      </div>
                      <Switch 
                        checked={dashboardSettings.defaultLayout.autoLayout} 
                        onCheckedChange={(enabled) => {
                          // This would be handled by the dashboard settings context
                          console.log('Auto layout:', enabled);
                        }}
                        disabled
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">Show Animations</div>
                        <div className="text-sm text-muted-foreground">Enable smooth transitions</div>
                      </div>
                      <Switch 
                        checked={dashboardSettings.animations} 
                        onCheckedChange={(enabled) => {
                          console.log('Animations:', enabled);
                        }}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">Lazy Loading</div>
                        <div className="text-sm text-muted-foreground">Load widgets on demand</div>
                      </div>
                      <Switch 
                        checked={dashboardSettings.lazyLoading} 
                        onCheckedChange={(enabled) => {
                          console.log('Lazy loading:', enabled);
                        }}
                        disabled
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">Cache Data</div>
                        <div className="text-sm text-muted-foreground">Store data locally for faster access</div>
                      </div>
                      <Switch 
                        checked={dashboardSettings.cacheSettings.enabled} 
                        onCheckedChange={(enabled) => {
                          console.log('Cache:', enabled);
                        }}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Grid Configuration */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Grid Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gridColumns">Grid Columns</Label>
                    <select 
                      id="gridColumns"
                      className="w-full p-2 border rounded-md"
                      value={dashboardSettings.gridConfig.columns}
                      onChange={(e) => {
                        console.log('Grid columns:', e.target.value);
                      }}
                      disabled
                    >
                      <option value="12">12 Columns</option>
                      <option value="16">16 Columns</option>
                      <option value="24">24 Columns</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gridSpacing">Grid Spacing</Label>
                    <select 
                      id="gridSpacing"
                      className="w-full p-2 border rounded-md"
                      value={dashboardSettings.defaultLayout.spacing}
                      onChange={(e) => {
                        console.log('Grid spacing:', e.target.value);
                      }}
                      disabled
                    >
                      <option value="compact">Compact</option>
                      <option value="normal">Normal</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refreshInterval">Refresh Interval</Label>
                    <select 
                      id="refreshInterval"
                      className="w-full p-2 border rounded-md"
                      value="300"
                      onChange={(e) => {
                        console.log('Refresh interval:', e.target.value);
                      }}
                      disabled
                    >
                      <option value="30">30 seconds</option>
                      <option value="60">1 minute</option>
                      <option value="300">5 minutes</option>
                      <option value="900">15 minutes</option>
                    </select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Advanced Dashboard Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Advanced Dashboard Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Access comprehensive dashboard configuration options
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowDashboardSettingsModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Cog className="w-4 h-4" />
                    Open Dashboard Settings
                  </Button>
                </div>
              </div>

              {/* Dashboard Templates */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Dashboard Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Layout className="w-4 h-4" />
                      <span className="font-medium">Fleet Manager</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Optimized for fleet operations</p>
                  </div>
                  <div className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4" />
                      <span className="font-medium">Operations Manager</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Focused on operational metrics</p>
                  </div>
                  <div className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Square className="w-4 h-4" />
                      <span className="font-medium">Financial Manager</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Emphasizes financial data</p>
                  </div>
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

        {/* Vehicle Management Tab */}
        <TabsContent value="vehicle-management" className="space-y-6">
          {activeTab === 'vehicle-management' && <VehicleManagementSettings />}
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

      {/* Dashboard Settings Modal */}
      {showDashboardSettingsModal && (
        <DashboardSettingsModal
          isOpen={showDashboardSettingsModal}
          onClose={() => setShowDashboardSettingsModal(false)}
        />
      )}
    </div>
  );
};

export default Settings;

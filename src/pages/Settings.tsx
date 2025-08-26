import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';
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
  Sparkles
} from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  
  // Debug information
  console.log('🔍 Theme Debug Info:', {
    theme,
    isDark,
    hasDarkClass: document.documentElement.classList.contains('dark'),
    localStorage: {
      theme: localStorage.getItem('theme')
    }
  });

  const getThemeIcon = () => {
    return isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />;
  };

  const getThemeLabel = () => {
    return isDark ? 'Dark Mode' : 'Light Mode';
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    // Apply font size to document
    const root = document.documentElement;
    root.style.fontSize = size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
  };

  const handleReducedMotion = (enabled: boolean) => {
    setReducedMotion(enabled);
    if (enabled) {
      document.documentElement.style.setProperty('--reduced-motion', 'reduce');
    } else {
      document.documentElement.style.removeProperty('--reduced-motion');
    }
  };

  const handleHighContrast = (enabled: boolean) => {
    setHighContrast(enabled);
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const resetThemeSettings = () => {
    localStorage.removeItem('theme');
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your app experience</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={toggleTheme}
            variant="outline"
            className="text-xs"
          >
            {getThemeIcon()} {getThemeLabel()}
          </Button>
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
                        <div className="font-medium text-foreground">Light Mode</div>
                        <div className="text-sm text-muted-foreground">Bright and clean interface</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-background border border-border rounded"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
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
                        <div className="font-medium text-foreground">Dark Mode</div>
                        <div className="text-sm text-muted-foreground">Easy on the eyes</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-background border border-border rounded"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Current Theme Info */}
              <div className="space-y-4">
                <Label className="text-base font-medium text-foreground">Current Theme</Label>
                <div className="p-4 bg-muted/50 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">
                        {isDark ? 'Dark Theme' : 'Light Theme'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Theme: {theme} | Dark Class: {document.documentElement.classList.contains('dark') ? 'Applied' : 'Not Applied'}
                      </div>
                    </div>
                    <Badge variant={isDark ? 'default' : 'secondary'} className="font-medium">
                      {isDark ? 'Dark' : 'Light'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

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
                      {['small', 'medium', 'large'].map((size) => (
                        <Button
                          key={size}
                          variant={fontSize === size ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleFontSizeChange(size)}
                          className={`capitalize transition-all ${
                            fontSize === size 
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
                    checked={reducedMotion} 
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
                    checked={highContrast} 
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
            <CardContent>
              <p className="text-muted-foreground">Account settings will be implemented here.</p>
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
            <CardContent>
              <p className="text-muted-foreground">Notification settings will be implemented here.</p>
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
            <CardContent>
              <p className="text-muted-foreground">Advanced settings will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

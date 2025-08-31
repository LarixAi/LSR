import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  Grid3X3, 
  Palette, 
  Gauge, 
  Globe, 
  Monitor, 
  RefreshCw, 
  Save,
  RotateCcw,
  X,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useDashboardSettings } from '@/contexts/DashboardSettingsContext';
import type { 
  WidgetLayout, 
  NumberFormat, 
  CacheConfig, 
  ColorScheme, 
  WidgetStyles, 
  GridConfiguration 
} from '@/contexts/DashboardSettingsContext';

// ============================================================================
// COMPONENT INTERFACE
// ============================================================================

interface DashboardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const SettingSection: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ 
  title, 
  description, 
  children 
}) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
    </div>
    {children}
  </div>
);

const SettingItem: React.FC<{ label: string; description?: string; children: React.ReactNode }> = ({ 
  label, 
  description, 
  children 
}) => (
  <div className="flex items-center justify-between">
    <div className="space-y-0.5">
      <Label className="text-sm font-medium">{label}</Label>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
    {children}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DashboardSettingsModal({ isOpen, onClose }: DashboardSettingsModalProps) {
  const { 
    settings, 
    updateDefaultLayout, 
    updateRefreshIntervals, 
    updateDateFormat, 
    updateNumberFormat, 
    updateTimezone, 
    updateLanguage, 
    updateCacheSettings, 
    toggleLazyLoading, 
    toggleAnimations, 
    updateColorScheme, 
    updateWidgetStyles, 
    updateGridConfig, 
    resetToDefaults 
  } = useDashboardSettings();

  const [activeTab, setActiveTab] = useState('widgets');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleLayoutChange = (layout: Partial<WidgetLayout>) => {
    updateDefaultLayout(layout);
    setHasUnsavedChanges(true);
  };

  const handleRefreshIntervalChange = (widgetType: string, interval: number) => {
    updateRefreshIntervals({ [widgetType]: interval });
    setHasUnsavedChanges(true);
  };

  const handleDateFormatChange = (format: string) => {
    updateDateFormat(format);
    setHasUnsavedChanges(true);
  };

  const handleNumberFormatChange = (format: Partial<NumberFormat>) => {
    updateNumberFormat(format);
    setHasUnsavedChanges(true);
  };

  const handleTimezoneChange = (timezone: string) => {
    updateTimezone(timezone);
    setHasUnsavedChanges(true);
  };

  const handleLanguageChange = (language: string) => {
    updateLanguage(language);
    setHasUnsavedChanges(true);
  };

  const handleCacheSettingsChange = (cacheSettings: Partial<CacheConfig>) => {
    updateCacheSettings(cacheSettings);
    setHasUnsavedChanges(true);
  };

  const handleLazyLoadingToggle = (enabled: boolean) => {
    toggleLazyLoading(enabled);
    setHasUnsavedChanges(true);
  };

  const handleAnimationsToggle = (enabled: boolean) => {
    toggleAnimations(enabled);
    setHasUnsavedChanges(true);
  };

  const handleColorSchemeChange = (scheme: Partial<ColorScheme>) => {
    updateColorScheme(scheme);
    setHasUnsavedChanges(true);
  };

  const handleWidgetStylesChange = (styles: Partial<WidgetStyles>) => {
    updateWidgetStyles(styles);
    setHasUnsavedChanges(true);
  };

  const handleGridConfigChange = (config: Partial<GridConfiguration>) => {
    updateGridConfig(config);
    setHasUnsavedChanges(true);
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
    setHasUnsavedChanges(false);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      // In a real app, you might want to show a confirmation dialog
      console.log('Unsaved changes detected');
    }
    onClose();
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderWidgetManagementTab = () => (
    <div className="space-y-6">
      <SettingSection 
        title="Default Layout" 
        description="Configure how widgets are arranged by default"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gridSize">Grid Size</Label>
            <Select 
              value={settings.defaultLayout.gridSize.toString()} 
              onValueChange={(value) => handleLayoutChange({ gridSize: parseInt(value) as 12 | 16 | 24 })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 Columns</SelectItem>
                <SelectItem value="16">16 Columns</SelectItem>
                <SelectItem value="24">24 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spacing">Spacing</Label>
            <Select 
              value={settings.defaultLayout.spacing} 
              onValueChange={(value) => handleLayoutChange({ spacing: value as 'compact' | 'normal' | 'spacious' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <SettingItem label="Auto Layout">
              <Switch 
                checked={settings.defaultLayout.autoLayout} 
                onCheckedChange={(checked) => handleLayoutChange({ autoLayout: checked })}
              />
            </SettingItem>
          </div>
        </div>
      </SettingSection>

      <SettingSection 
        title="Refresh Intervals" 
        description="Set how often each widget type refreshes its data"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(settings.refreshIntervals).map(([widgetType, interval]) => (
            <div key={widgetType} className="space-y-2">
              <Label htmlFor={`refresh-${widgetType}`}>
                {widgetType === 'default' ? 'Default' : widgetType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Label>
              <Select 
                value={interval.toString()} 
                onValueChange={(value) => handleRefreshIntervalChange(widgetType, parseInt(value))}
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
          ))}
        </div>
      </SettingSection>
    </div>
  );

  const renderDisplayTab = () => (
    <div className="space-y-6">
      <SettingSection 
        title="Date & Time" 
        description="Configure how dates and times are displayed"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select 
              value={settings.dateFormat} 
              onValueChange={handleDateFormatChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MMM dd, yyyy">Jan 01, 2024</SelectItem>
                <SelectItem value="dd/MM/yyyy">01/01/2024</SelectItem>
                <SelectItem value="MM/dd/yyyy">01/01/2024</SelectItem>
                <SelectItem value="yyyy-MM-dd">2024-01-01</SelectItem>
                <SelectItem value="dd MMM yyyy">01 Jan 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select 
              value={settings.timezone} 
              onValueChange={handleTimezoneChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingSection>

      <SettingSection 
        title="Number Formatting" 
        description="Configure how numbers and currency are displayed"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="decimals">Decimal Places</Label>
            <Select 
              value={settings.numberFormat.decimals.toString()} 
              onValueChange={(value) => handleNumberFormatChange({ decimals: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select 
              value={settings.numberFormat.currency} 
              onValueChange={(value) => handleNumberFormatChange({ currency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="CAD">CAD (C$)</SelectItem>
                <SelectItem value="AUD">AUD (A$)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thousandsSeparator">Thousands Separator</Label>
            <Select 
              value={settings.numberFormat.thousandsSeparator} 
              onValueChange={(value) => handleNumberFormatChange({ thousandsSeparator: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=",">Comma (,)</SelectItem>
                <SelectItem value=".">Period (.)</SelectItem>
                <SelectItem value=" ">Space ( )</SelectItem>
                <SelectItem value="_">Underscore (_)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="decimalSeparator">Decimal Separator</Label>
            <Select 
              value={settings.numberFormat.decimalSeparator} 
              onValueChange={(value) => handleNumberFormatChange({ decimalSeparator: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=".">Period (.)</SelectItem>
                <SelectItem value=",">Comma (,)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingSection>

      <SettingSection 
        title="Language" 
        description="Choose your preferred language for the dashboard"
      >
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select 
            value={settings.language} 
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="it">Italiano</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
              <SelectItem value="ru">Русский</SelectItem>
              <SelectItem value="zh">中文</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="ko">한국어</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingSection>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      <SettingSection 
        title="Cache Settings" 
        description="Configure data caching for better performance"
      >
        <div className="space-y-4">
          <SettingItem label="Enable Caching">
            <Switch 
              checked={settings.cacheSettings.enabled} 
              onCheckedChange={(checked) => handleCacheSettingsChange({ enabled: checked })}
            />
          </SettingItem>

          {settings.cacheSettings.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cacheTTL">Cache TTL (seconds)</Label>
                <Select 
                  value={settings.cacheSettings.ttl.toString()} 
                  onValueChange={(value) => handleCacheSettingsChange({ ttl: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300">5 minutes</SelectItem>
                    <SelectItem value="600">10 minutes</SelectItem>
                    <SelectItem value="1800">30 minutes</SelectItem>
                    <SelectItem value="3600">1 hour</SelectItem>
                    <SelectItem value="7200">2 hours</SelectItem>
                    <SelectItem value="14400">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cacheMaxSize">Max Cache Size (MB)</Label>
                <Select 
                  value={settings.cacheSettings.maxSize.toString()} 
                  onValueChange={(value) => handleCacheSettingsChange({ maxSize: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50 MB</SelectItem>
                    <SelectItem value="100">100 MB</SelectItem>
                    <SelectItem value="200">200 MB</SelectItem>
                    <SelectItem value="500">500 MB</SelectItem>
                    <SelectItem value="1000">1 GB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </SettingSection>

      <SettingSection 
        title="Performance Options" 
        description="Configure performance-related settings"
      >
        <div className="space-y-4">
          <SettingItem 
            label="Lazy Loading" 
            description="Load widgets only when they become visible"
          >
            <Switch 
              checked={settings.lazyLoading} 
              onCheckedChange={handleLazyLoadingToggle}
            />
          </SettingItem>

          <SettingItem 
            label="Animations" 
            description="Enable smooth transitions and animations"
          >
            <Switch 
              checked={settings.animations} 
              onCheckedChange={handleAnimationsToggle}
            />
          </SettingItem>
        </div>
      </SettingSection>
    </div>
  );

  const renderThemeTab = () => (
    <div className="space-y-6">
      <SettingSection 
        title="Color Scheme" 
        description="Customize the dashboard color palette"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(settings.colorScheme).map(([colorKey, colorValue]) => (
            <div key={colorKey} className="space-y-2">
              <Label htmlFor={`color-${colorKey}`}>
                {colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id={`color-${colorKey}`}
                  type="color"
                  value={colorValue}
                  onChange={(e) => handleColorSchemeChange({ [colorKey]: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={colorValue}
                  onChange={(e) => handleColorSchemeChange({ [colorKey]: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          ))}
        </div>
      </SettingSection>

      <SettingSection 
        title="Widget Styles" 
        description="Configure the appearance of dashboard widgets"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="borderStyle">Border Style</Label>
            <Select 
              value={settings.widgetStyles.borderStyle} 
              onValueChange={(value) => handleWidgetStylesChange({ borderStyle: value as 'solid' | 'dashed' | 'none' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="borderWidth">Border Width</Label>
            <Select 
              value={settings.widgetStyles.borderWidth.toString()} 
              onValueChange={(value) => handleWidgetStylesChange({ borderWidth: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0px</SelectItem>
                <SelectItem value="1">1px</SelectItem>
                <SelectItem value="2">2px</SelectItem>
                <SelectItem value="3">3px</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="borderRadius">Border Radius</Label>
            <Select 
              value={settings.widgetStyles.borderRadius.toString()} 
              onValueChange={(value) => handleWidgetStylesChange({ borderRadius: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0px</SelectItem>
                <SelectItem value="4">4px</SelectItem>
                <SelectItem value="8">8px</SelectItem>
                <SelectItem value="12">12px</SelectItem>
                <SelectItem value="16">16px</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shadow">Shadow</Label>
            <Select 
              value={settings.widgetStyles.shadow} 
              onValueChange={(value) => handleWidgetStylesChange({ shadow: value as 'none' | 'sm' | 'md' | 'lg' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingSection>

      <SettingSection 
        title="Grid Configuration" 
        description="Configure the dashboard grid layout"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="columns">Columns</Label>
            <Input
              id="columns"
              type="number"
              min="8"
              max="32"
              value={settings.gridConfig.columns}
              onChange={(e) => handleGridConfigChange({ columns: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rows">Rows</Label>
            <Input
              id="rows"
              type="number"
              min="4"
              max="20"
              value={settings.gridConfig.rows}
              onChange={(e) => handleGridConfigChange({ rows: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gap">Gap (px)</Label>
            <Input
              id="gap"
              type="number"
              min="8"
              max="32"
              value={settings.gridConfig.gap}
              onChange={(e) => handleGridConfigChange({ gap: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="padding">Padding (px)</Label>
            <Input
              id="padding"
              type="number"
              min="16"
              max="48"
              value={settings.gridConfig.padding}
              onChange={(e) => handleGridConfigChange({ padding: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </SettingSection>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Dashboard Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="widgets" className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                Widgets
              </TabsTrigger>
              <TabsTrigger value="display" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Display
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="theme" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Theme
              </TabsTrigger>
            </TabsList>

            <TabsContent value="widgets" className="mt-6">
              {renderWidgetManagementTab()}
            </TabsContent>

            <TabsContent value="display" className="mt-6">
              {renderDisplayTab()}
            </TabsContent>

            <TabsContent value="performance" className="mt-6">
              {renderPerformanceTab()}
            </TabsContent>

            <TabsContent value="theme" className="mt-6">
              {renderThemeTab()}
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Unsaved Changes
                </Badge>
              )}
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                Last modified: {new Date(settings.lastModified).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleResetToDefaults}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </Button>
              <Button
                onClick={handleClose}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

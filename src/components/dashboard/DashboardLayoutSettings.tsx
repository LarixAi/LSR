import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Grid3X3, 
  Palette, 
  Layout, 
  Eye, 
  EyeOff, 
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
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
  ColorScheme, 
  WidgetStyles, 
  GridConfiguration 
} from '@/contexts/DashboardSettingsContext';

// ============================================================================
// COMPONENT INTERFACE
// ============================================================================

interface DashboardLayoutSettingsProps {
  onClose: () => void;
}

// ============================================================================
// PRESET TEMPLATES
// ============================================================================

const DASHBOARD_TEMPLATES = {
  fleetManager: {
    name: 'Fleet Manager',
    description: 'Optimized for fleet operations and vehicle management',
    layout: {
      gridSize: 16,
      spacing: 'normal',
      autoLayout: true
    },
    gridConfig: {
      columns: 16,
      rows: 10,
      gap: 16,
      padding: 24
    },
    colorScheme: {
      primary: '#0ea5e9', // Sky blue
      secondary: '#64748b', // Slate
      accent: '#f59e0b', // Amber
      background: '#ffffff',
      surface: '#f8fafc'
    }
  },
  operationsManager: {
    name: 'Operations Manager',
    description: 'Focused on daily operations and task management',
    layout: {
      gridSize: 12,
      spacing: 'compact',
      autoLayout: false
    },
    gridConfig: {
      columns: 12,
      rows: 8,
      gap: 12,
      padding: 20
    },
    colorScheme: {
      primary: '#10b981', // Emerald
      secondary: '#6b7280', // Gray
      accent: '#f97316', // Orange
      background: '#ffffff',
      surface: '#f9fafb'
    }
  },
  financialManager: {
    name: 'Financial Manager',
    description: 'Emphasizes financial metrics and cost analysis',
    layout: {
      gridSize: 24,
      spacing: 'spacious',
      autoLayout: true
    },
    gridConfig: {
      columns: 24,
      rows: 12,
      gap: 20,
      padding: 32
    },
    colorScheme: {
      primary: '#8b5cf6', // Violet
      secondary: '#475569', // Slate
      accent: '#06b6d4', // Cyan
      background: '#ffffff',
      surface: '#f1f5f9'
    }
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DashboardLayoutSettings({ onClose }: DashboardLayoutSettingsProps) {
  const { 
    settings, 
    updateDefaultLayout, 
    updateColorScheme, 
    updateWidgetStyles, 
    updateGridConfig,
    resetToDefaults 
  } = useDashboardSettings();

  const [activeTab, setActiveTab] = useState('layout');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleLayoutChange = (layout: Partial<WidgetLayout>) => {
    updateDefaultLayout(layout);
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

  const handleTemplateApply = (template: keyof typeof DASHBOARD_TEMPLATES) => {
    const selectedTemplate = DASHBOARD_TEMPLATES[template];
    updateDefaultLayout(selectedTemplate.layout);
    updateGridConfig(selectedTemplate.gridConfig);
    updateColorScheme(selectedTemplate.colorScheme);
    setHasUnsavedChanges(true);
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
    setHasUnsavedChanges(false);
  };

  const handleSave = () => {
    // Settings are automatically saved via context
    setHasUnsavedChanges(false);
    onClose();
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderLayoutTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Grid Layout Configuration</h4>
        <p className="text-xs text-gray-600">Configure how widgets are arranged on the dashboard</p>
      </div>

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
          <p className="text-xs text-gray-500">Number of columns in the grid</p>
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
          <p className="text-xs text-gray-500">Space between widgets</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="autoLayout">Auto Layout</Label>
          <div className="pt-2">
            <Switch 
              checked={settings.defaultLayout.autoLayout} 
              onCheckedChange={(checked) => handleLayoutChange({ autoLayout: checked })}
            />
          </div>
          <p className="text-xs text-gray-500">Automatically arrange widgets</p>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Grid Configuration</h4>
        <p className="text-xs text-gray-600">Fine-tune the grid layout parameters</p>
      </div>

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
          <p className="text-xs text-gray-500">Number of grid columns</p>
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
          <p className="text-xs text-gray-500">Number of grid rows</p>
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
          <p className="text-xs text-gray-500">Space between grid items</p>
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
          <p className="text-xs text-gray-500">Padding around the grid</p>
        </div>
      </div>
    </div>
  );

  const renderThemeTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Color Scheme</h4>
        <p className="text-xs text-gray-600">Customize the dashboard color palette</p>
      </div>

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

      <Separator />

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Widget Styles</h4>
        <p className="text-xs text-gray-600">Configure the appearance of dashboard widgets</p>
      </div>

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
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Dashboard Templates</h4>
        <p className="text-xs text-gray-600">Choose from pre-configured dashboard layouts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(DASHBOARD_TEMPLATES).map(([key, template]) => (
          <Card key={key} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{template.name}</CardTitle>
              <p className="text-xs text-gray-600">{template.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-xs text-gray-500">
                <div>Grid: {template.layout.gridSize} columns</div>
                <div>Spacing: {template.layout.spacing}</div>
                <div>Auto-layout: {template.layout.autoLayout ? 'Yes' : 'No'}</div>
              </div>
              <Button 
                size="sm" 
                className="w-full mt-3"
                onClick={() => handleTemplateApply(key as keyof typeof DASHBOARD_TEMPLATES)}
              >
                Apply Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Custom Template</h4>
        <p className="text-xs text-gray-600">Create and save your own dashboard template</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              placeholder="Enter template name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="templateDescription">Description</Label>
            <Input
              id="templateDescription"
              placeholder="Enter template description"
            />
          </div>
        </div>
        <Button variant="outline" className="w-full">
          Save Current Layout as Template
        </Button>
      </div>
    </div>
  );

  const renderResponsiveTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Responsive Breakpoints</h4>
        <p className="text-xs text-gray-600">Configure how the dashboard adapts to different screen sizes</p>
      </div>

      <div className="space-y-6">
        {/* Mobile */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Mobile (< 768px)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobileColumns">Columns</Label>
                <Select value="4" disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 Columns</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Fixed for mobile</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileSpacing">Spacing</Label>
                <Select value="compact" disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Optimized for small screens</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tablet */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tablet className="w-4 h-4" />
              Tablet (768px - 1024px)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tabletColumns">Columns</Label>
                <Select value="8" disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8 Columns</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Fixed for tablet</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tabletSpacing">Spacing</Label>
                <Select value="normal" disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Balanced spacing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desktop */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Desktop className="w-4 h-4" />
              Desktop (> 1024px)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="desktopColumns">Columns</Label>
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
                <p className="text-xs text-gray-500">Configurable for desktop</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desktopSpacing">Spacing</Label>
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
                <p className="text-xs text-gray-500">Configurable for desktop</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <h3 className="text-lg font-medium text-gray-900">Dashboard Layout Settings</h3>
          <p className="text-sm text-gray-600">Configure grid layout, themes, and responsive behavior</p>
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

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'layout', label: 'Layout', icon: Grid3X3 },
            { id: 'theme', label: 'Theme', icon: Palette },
            { id: 'templates', label: 'Templates', icon: Layout },
            { id: 'responsive', label: 'Responsive', icon: Monitor }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'layout' && renderLayoutTab()}
        {activeTab === 'theme' && renderThemeTab()}
        {activeTab === 'templates' && renderTemplatesTab()}
        {activeTab === 'responsive' && renderResponsiveTab()}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Unsaved Changes
            </Badge>
          )}
          <span className="text-xs text-gray-500">
            Last modified: {new Date(settings.lastModified).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResetToDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

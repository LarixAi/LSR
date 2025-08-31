import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Database, 
  RefreshCw, 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Globe,
  Shield,
  Zap,
  Save,
  RotateCcw,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Wifi,
  WifiOff,
  Cloud,
  HardDrive
} from 'lucide-react';
import { useDashboardSettings } from '@/contexts/DashboardSettingsContext';

// ============================================================================
// COMPONENT INTERFACE
// ============================================================================

interface DataIntegrationSettingsProps {
  onClose: () => void;
}

// ============================================================================
// DATA SOURCE CONFIGURATIONS
// ============================================================================

const DATA_SOURCES = {
  supabase: {
    name: 'Supabase',
    description: 'Primary PostgreSQL database with real-time subscriptions',
    icon: Database,
    features: ['Real-time updates', 'Row-level security', 'Auto-scaling'],
    status: 'active'
  },
  external_api: {
    name: 'External APIs',
    description: 'Third-party services for additional data',
    icon: Globe,
    features: ['Weather data', 'Traffic information', 'Fuel prices'],
    status: 'active'
  },
  local_cache: {
    name: 'Local Cache',
    description: 'Browser-based data storage for offline access',
    icon: HardDrive,
    features: ['Offline support', 'Fast access', 'Reduced API calls'],
    status: 'active'
  }
};

const NOTIFICATION_CHANNELS = {
  email: {
    name: 'Email',
    description: 'Send notifications via email',
    icon: Mail,
    enabled: true,
    settings: {
      frequency: 'immediate',
      quietHours: { start: '22:00', end: '07:00' },
      recipients: ['admin@company.com']
    }
  },
  sms: {
    name: 'SMS',
    description: 'Send notifications via text message',
    icon: MessageSquare,
    enabled: false,
    settings: {
      frequency: 'urgent_only',
      quietHours: { start: '22:00', end: '07:00' },
      recipients: ['+1234567890']
    }
  },
  push: {
    name: 'Push Notifications',
    description: 'In-app push notifications',
    icon: Bell,
    enabled: true,
    settings: {
      frequency: 'immediate',
      quietHours: { start: '22:00', end: '07:00' },
      sound: true,
      vibration: true
    }
  },
  in_app: {
    name: 'In-App Alerts',
    description: 'Dashboard notification center',
    icon: MessageSquare,
    enabled: true,
    settings: {
      frequency: 'immediate',
      position: 'top-right',
      autoHide: 5000
    }
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DataIntegrationSettings({ onClose }: DataIntegrationSettingsProps) {
  const { 
    settings, 
    updateCacheSettings, 
    toggleLazyLoading, 
    toggleAnimations,
    resetToDefaults 
  } = useDashboardSettings();

  const [activeTab, setActiveTab] = useState('data');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCacheSettingsChange = (cacheSettings: Partial<typeof settings.cacheSettings>) => {
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

  const renderDataSourcesTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Data Sources</h4>
        <p className="text-xs text-gray-600">Configure where your dashboard data comes from</p>
      </div>

      <div className="space-y-4">
        {Object.entries(DATA_SOURCES).map(([key, source]) => {
          const Icon = source.icon;
          return (
            <Card key={key} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{source.name}</CardTitle>
                      <p className="text-xs text-gray-600">{source.description}</p>
                    </div>
                  </div>
                  <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
                    {source.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Features</h5>
                    <div className="flex flex-wrap gap-2">
                      {source.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`source-${key}`}
                      checked={source.status === 'active'}
                      disabled
                    />
                    <Label htmlFor={`source-${key}`} className="text-xs">
                      {source.status === 'active' ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Data Refresh Strategy</h4>
        <p className="text-xs text-gray-600">Configure how often data is updated from different sources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supabaseRefresh">Supabase Refresh</Label>
          <Select value="realtime" disabled>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">Real-time subscriptions enabled</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="externalRefresh">External APIs Refresh</Label>
          <Select value="300">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="60">1 minute</SelectItem>
              <SelectItem value="300">5 minutes</SelectItem>
              <SelectItem value="900">15 minutes</SelectItem>
              <SelectItem value="3600">1 hour</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">How often to fetch external data</p>
        </div>
      </div>
    </div>
  );

  const renderCacheTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Cache Configuration</h4>
        <p className="text-xs text-gray-600">Optimize data caching for better performance</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="cacheEnabled"
            checked={settings.cacheSettings.enabled}
            onCheckedChange={(checked) => handleCacheSettingsChange({ enabled: checked })}
          />
          <Label htmlFor="cacheEnabled">Enable data caching</Label>
        </div>

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
              <p className="text-xs text-gray-500">How long data stays in cache</p>
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
              <p className="text-xs text-gray-500">Maximum memory usage for cache</p>
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Options</h4>
        <p className="text-xs text-gray-600">Configure performance-related settings</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="lazyLoading"
            checked={settings.lazyLoading}
            onCheckedChange={handleLazyLoadingToggle}
          />
          <Label htmlFor="lazyLoading">Enable lazy loading</Label>
          <p className="text-xs text-gray-500 ml-2">Load widgets only when visible</p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="animations"
            checked={settings.animations}
            onCheckedChange={handleAnimationsToggle}
          />
          <Label htmlFor="animations">Enable animations</Label>
          <p className="text-xs text-gray-500 ml-2">Smooth transitions and effects</p>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Offline Support</h4>
        <p className="text-xs text-gray-600">Configure how the dashboard behaves when offline</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="offlineMode" defaultChecked />
          <Label htmlFor="offlineMode">Enable offline mode</Label>
          <p className="text-xs text-gray-500 ml-2">Show cached data when offline</p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="syncWhenOnline" defaultChecked />
          <Label htmlFor="syncWhenOnline">Sync when back online</Label>
          <p className="text-xs text-gray-500 ml-2">Automatically sync data when connection restored</p>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Notification Channels</h4>
        <p className="text-xs text-gray-600">Configure how and when you receive notifications</p>
      </div>

      <div className="space-y-4">
        {Object.entries(NOTIFICATION_CHANNELS).map(([key, channel]) => {
          const Icon = channel.icon;
          return (
            <Card key={key} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{channel.name}</CardTitle>
                      <p className="text-xs text-gray-600">{channel.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={`channel-${key}`}
                    checked={channel.enabled}
                  />
                </div>
              </CardHeader>
              {channel.enabled && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`frequency-${key}`}>Notification Frequency</Label>
                        <Select value={channel.settings.frequency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="batch">Batched (every 5 min)</SelectItem>
                            <SelectItem value="urgent_only">Urgent only</SelectItem>
                            <SelectItem value="daily">Daily summary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`quietHours-${key}`}>Quiet Hours</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={channel.settings.quietHours.start}
                            className="w-20"
                          />
                          <span className="text-xs text-gray-500">to</span>
                          <Input
                            type="time"
                            value={channel.settings.quietHours.end}
                            className="w-20"
                          />
                        </div>
                      </div>
                    </div>

                    {key === 'email' && (
                      <div className="space-y-2">
                        <Label htmlFor={`recipients-${key}`}>Email Recipients</Label>
                        <Textarea
                          id={`recipients-${key}`}
                          placeholder="Enter email addresses (one per line)"
                          value={channel.settings.recipients.join('\n')}
                          className="min-h-[80px]"
                        />
                      </div>
                    )}

                    {key === 'sms' && (
                      <div className="space-y-2">
                        <Label htmlFor={`recipients-${key}`}>Phone Numbers</Label>
                        <Textarea
                          id={`recipients-${key}`}
                          placeholder="Enter phone numbers (one per line)"
                          value={channel.settings.recipients.join('\n')}
                          className="min-h-[80px]"
                        />
                      </div>
                    )}

                    {key === 'push' && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch id={`sound-${key}`} checked={channel.settings.sound} />
                          <Label htmlFor={`sound-${key}`}>Play sound</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id={`vibration-${key}`} checked={channel.settings.vibration} />
                          <Label htmlFor={`vibration-${key}`}>Vibrate device</Label>
                        </div>
                      </div>
                    )}

                    {key === 'in_app' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`position-${key}`}>Position</Label>
                          <Select value={channel.settings.position}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="top-right">Top Right</SelectItem>
                              <SelectItem value="top-left">Top Left</SelectItem>
                              <SelectItem value="bottom-right">Bottom Right</SelectItem>
                              <SelectItem value="bottom-left">Bottom Left</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`autoHide-${key}`}>Auto-hide (ms)</Label>
                          <Input
                            type="number"
                            value={channel.settings.autoHide}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Alert Rules</h4>
        <p className="text-xs text-gray-600">Configure when and how alerts are triggered</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="criticalAlerts">Critical Alerts</Label>
            <Select value="immediate">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="within_5min">Within 5 minutes</SelectItem>
                <SelectItem value="within_15min">Within 15 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="warningAlerts">Warning Alerts</Label>
            <Select value="within_15min">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="within_5min">Within 5 minutes</SelectItem>
                <SelectItem value="within_15min">Within 15 minutes</SelectItem>
                <SelectItem value="within_1hour">Within 1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="infoAlerts">Info Alerts</Label>
            <Select value="batch">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="batch">Batched</SelectItem>
                <SelectItem value="daily">Daily summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Data Security</h4>
        <p className="text-xs text-gray-600">Configure security and privacy settings</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Data Encryption
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch id="encryptCache" defaultChecked />
                <Label htmlFor="encryptCache">Encrypt cached data</Label>
                <p className="text-xs text-gray-500 ml-2">Protect sensitive information in cache</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="secureStorage" defaultChecked />
                <Label htmlFor="secureStorage">Use secure storage</Label>
                <p className="text-xs text-gray-500 ml-2">Store settings in secure browser storage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4" />
              API Security
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch id="rateLimiting" defaultChecked />
                <Label htmlFor="rateLimiting">Enable rate limiting</Label>
                <p className="text-xs text-gray-500 ml-2">Prevent API abuse</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="requestValidation" defaultChecked />
                <Label htmlFor="requestValidation">Validate requests</Label>
                <p className="text-xs text-gray-500 ml-2">Ensure data integrity</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Performance & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch id="httpsOnly" defaultChecked />
                <Label htmlFor="httpsOnly">HTTPS only</Label>
                <p className="text-xs text-gray-500 ml-2">Require secure connections</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="contentSecurity" defaultChecked />
                <Label htmlFor="contentSecurity">Content Security Policy</Label>
                <p className="text-xs text-gray-500 ml-2">Prevent XSS attacks</p>
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
          <h3 className="text-lg font-medium text-gray-900">Data & Integration Settings</h3>
          <p className="text-sm text-gray-600">Configure data sources, caching, and notifications</p>
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
            { id: 'data', label: 'Data Sources', icon: Database },
            { id: 'cache', label: 'Cache & Performance', icon: Zap },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield }
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
      <div className="min-h-[500px]">
        {activeTab === 'data' && renderDataSourcesTab()}
        {activeTab === 'cache' && renderCacheTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
        {activeTab === 'security' && renderSecurityTab()}
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

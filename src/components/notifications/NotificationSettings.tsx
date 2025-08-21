import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare,
  Clock,
  Globe,
  Shield,
  Settings,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Moon,
  Sun,
  Calendar,
  MapPin,
  Wrench,
  Truck,
  Users,
  Building2,
  Activity,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSettings {
  id: string;
  user_id: string;
  organization_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  categories: Record<string, Record<string, boolean>>;
  created_at: string;
  updated_at: string;
}

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  default_enabled: boolean;
  channels: ('email' | 'push' | 'sms' | 'in_app')[];
}

const NotificationSettings: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Notification categories with icons and descriptions
  const notificationCategories: NotificationCategory[] = [
    {
      id: 'general',
      name: 'General Notifications',
      description: 'General system notifications and updates',
      icon: <Bell className="w-4 h-4" />,
      default_enabled: true,
      channels: ['email', 'push', 'in_app']
    },
    {
      id: 'safety',
      name: 'Safety Alerts',
      description: 'Critical safety notifications and alerts',
      icon: <Shield className="w-4 h-4" />,
      default_enabled: true,
      channels: ['email', 'push', 'sms', 'in_app']
    },
    {
      id: 'schedule',
      name: 'Schedule Updates',
      description: 'Changes to routes, schedules, and assignments',
      icon: <Calendar className="w-4 h-4" />,
      default_enabled: true,
      channels: ['email', 'push', 'in_app']
    },
    {
      id: 'maintenance',
      name: 'Maintenance Reminders',
      description: 'Vehicle maintenance and service notifications',
      icon: <Wrench className="w-4 h-4" />,
      default_enabled: true,
      channels: ['email', 'push', 'in_app']
    },
    {
      id: 'emergency',
      name: 'Emergency Notifications',
      description: 'Emergency alerts and urgent communications',
      icon: <AlertTriangle className="w-4 h-4" />,
      default_enabled: true,
      channels: ['email', 'push', 'sms', 'in_app']
    },
    {
      id: 'vehicle',
      name: 'Vehicle Updates',
      description: 'Vehicle status, inspections, and compliance',
      icon: <Truck className="w-4 h-4" />,
      default_enabled: true,
      channels: ['email', 'push', 'in_app']
    },
    {
      id: 'compliance',
      name: 'Compliance Alerts',
      description: 'Regulatory compliance and training reminders',
      icon: <CheckCircle className="w-4 h-4" />,
      default_enabled: true,
      channels: ['email', 'push', 'in_app']
    },
    {
      id: 'analytics',
      name: 'Analytics Reports',
      description: 'Performance reports and analytics summaries',
      icon: <BarChart3 className="w-4 h-4" />,
      default_enabled: false,
      channels: ['email', 'in_app']
    }
  ];

  // Fetch current notification settings
  const { data: currentSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['notification-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!user?.id
  });

  // Create or update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<NotificationSettings>) => {
      if (!user?.id || !profile?.organization_id) {
        throw new Error('User not authenticated or organization not found');
      }

      const settingsData = {
        user_id: user.id,
        organization_id: profile.organization_id,
        ...newSettings
      };

      const { data, error } = await supabase
        .from('notification_settings')
        .upsert([settingsData], { onConflict: 'user_id,organization_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      setSettings(data as NotificationSettings);
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to save settings: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Initialize settings when data is loaded
  useEffect(() => {
    if (currentSettings) {
      // Type assertion to handle the JSON field from database
      setSettings(currentSettings as NotificationSettings);
    } else if (!settingsLoading && user?.id && profile?.organization_id) {
      // Create default settings if none exist
      const defaultSettings: NotificationSettings = {
        id: '',
        user_id: user.id,
        organization_id: profile.organization_id,
        email_enabled: true,
        push_enabled: true,
        sms_enabled: false,
        in_app_enabled: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '07:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        categories: {
          general: { email: true, push: true, sms: false, in_app: true },
          safety: { email: true, push: true, sms: true, in_app: true },
          schedule: { email: true, push: true, sms: false, in_app: true },
          maintenance: { email: true, push: true, sms: false, in_app: true },
          emergency: { email: true, push: true, sms: true, in_app: true },
          vehicle: { email: true, push: true, sms: false, in_app: true },
          compliance: { email: true, push: true, sms: false, in_app: true },
          analytics: { email: false, push: false, sms: false, in_app: true }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSettings(defaultSettings);
    }
  }, [currentSettings, settingsLoading, user?.id, profile?.organization_id]);

  const handleSaveSettings = () => {
    if (!settings) return;
    
    setIsLoading(true);
    updateSettingsMutation.mutate(settings, {
      onSettled: () => setIsLoading(false)
    });
  };

  const updateGlobalSetting = (setting: keyof NotificationSettings, value: any) => {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, [setting]: value } : null);
  };

  const updateCategorySetting = (categoryId: string, channel: string, enabled: boolean) => {
    if (!settings) return;
    
    setSettings(prev => {
      if (!prev) return null;
      
      const updatedCategories = {
        ...prev.categories,
        [categoryId]: {
          ...prev.categories[categoryId],
          [channel]: enabled
        }
      };
      
      return {
        ...prev,
        categories: updatedCategories
      };
    });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'push': return <Smartphone className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'in_app': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email': return 'text-blue-600';
      case 'push': return 'text-green-600';
      case 'sms': return 'text-purple-600';
      case 'in_app': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading notification settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notification Settings</h1>
          <p className="text-gray-600">Manage how and when you receive notifications</p>
        </div>
        <Button 
          onClick={handleSaveSettings} 
          disabled={isLoading || updateSettingsMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading || updateSettingsMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Global Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Channel Toggles */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Notification Channels</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Email Notifications</span>
                    </div>
                    <Switch
                      checked={settings?.email_enabled || false}
                      onCheckedChange={(checked) => updateGlobalSetting('email_enabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-green-600" />
                      <span>Push Notifications</span>
                    </div>
                    <Switch
                      checked={settings?.push_enabled || false}
                      onCheckedChange={(checked) => updateGlobalSetting('push_enabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                      <span>SMS Notifications</span>
                    </div>
                    <Switch
                      checked={settings?.sms_enabled || false}
                      onCheckedChange={(checked) => updateGlobalSetting('sms_enabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-600" />
                      <span>In-App Notifications</span>
                    </div>
                    <Switch
                      checked={settings?.in_app_enabled || false}
                      onCheckedChange={(checked) => updateGlobalSetting('in_app_enabled', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quiet Hours */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quiet Hours</Label>
                <p className="text-xs text-gray-500">Notifications will be delayed during these hours</p>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start Time</Label>
                    <Input
                      type="time"
                      value={settings?.quiet_hours_start || '22:00'}
                      onChange={(e) => updateGlobalSetting('quiet_hours_start', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Time</Label>
                    <Input
                      type="time"
                      value={settings?.quiet_hours_end || '07:00'}
                      onChange={(e) => updateGlobalSetting('quiet_hours_end', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Timezone */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Timezone</Label>
                <Select
                  value={settings?.timezone || 'UTC'}
                  onValueChange={(value) => updateGlobalSetting('timezone', value)}
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
            </CardContent>
          </Card>

          {/* Notification Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Notification Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">This Week</span>
                <Badge variant="outline">24 received</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Read Rate</span>
                <Badge variant="outline">87%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Response Time</span>
                <Badge variant="outline">2.3h avg</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Settings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Categories
              </CardTitle>
              <p className="text-sm text-gray-600">
                Choose which types of notifications you want to receive and how
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {notificationCategories.map((category) => (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Object.values(settings?.categories[category.id] || {}).filter(Boolean).length} active
                      </Badge>
                    </div>
                    
                    <div className="ml-11 space-y-2">
                      {category.channels.map((channel) => (
                        <div key={channel} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={getChannelColor(channel)}>
                              {getChannelIcon(channel)}
                            </div>
                            <span className="text-sm capitalize">{channel.replace('_', ' ')}</span>
                          </div>
                          <Switch
                            checked={settings?.categories[category.id]?.[channel] || false}
                            onCheckedChange={(checked) => updateCategorySetting(category.id, channel, checked)}
                            disabled={!settings?.[`${channel}_enabled` as keyof NotificationSettings]}
                          />
                        </div>
                      ))}
                    </div>
                    
                    {category.id !== notificationCategories[notificationCategories.length - 1].id && (
                      <Separator />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                // Enable all notifications
                const updatedCategories = Object.keys(notificationCategories).reduce((acc, categoryId) => {
                  acc[categoryId] = {
                    email: settings?.email_enabled || false,
                    push: settings?.push_enabled || false,
                    sms: settings?.sms_enabled || false,
                    in_app: settings?.in_app_enabled || false
                  };
                  return acc;
                }, {} as Record<string, Record<string, boolean>>);
                
                setSettings(prev => prev ? { ...prev, categories: updatedCategories } : null);
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Enable All
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                // Disable all notifications
                const updatedCategories = Object.keys(notificationCategories).reduce((acc, categoryId) => {
                  acc[categoryId] = {
                    email: false,
                    push: false,
                    sms: false,
                    in_app: false
                  };
                  return acc;
                }, {} as Record<string, Record<string, boolean>>);
                
                setSettings(prev => prev ? { ...prev, categories: updatedCategories } : null);
              }}
            >
              <Moon className="w-4 h-4 mr-2" />
              Disable All
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                // Reset to defaults
                const defaultCategories = notificationCategories.reduce((acc, category) => {
                  acc[category.id] = category.channels.reduce((channelAcc, channel) => {
                    channelAcc[channel] = category.default_enabled;
                    return channelAcc;
                  }, {} as Record<string, boolean>);
                  return acc;
                }, {} as Record<string, Record<string, boolean>>);
                
                setSettings(prev => prev ? { ...prev, categories: defaultCategories } : null);
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;

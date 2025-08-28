
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AppSettings {
  // General Settings
  organizationName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  
  // Security Settings
  requireTwoFactor: boolean;
  sessionTimeout: string;
  passwordComplexity: string;
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notificationFrequency: string;
  
  // Route Settings
  maxRouteCapacity: string;
  defaultRouteDuration: string;
  allowRouteOverlap: boolean;
  requireRouteApproval: boolean;
  
  // Vehicle Settings
  maxVehicleAge: string;
  requireDailyChecks: boolean;
  maintenanceReminder: string;
  fuelThreshold: string;
  
  // Driver Settings
  maxDriverHours: string;
  requireDriverTraining: boolean;
  licenseExpiryReminder: string;
  backgroundCheckInterval: string;
  
  // System Settings
  dataRetentionPeriod: string;
  backupFrequency: string;
  apiRateLimit: string;
  debugMode: boolean;
}

const defaultSettings: AppSettings = {
  // General Settings
  organizationName: 'Logistics Solution Resources',
  contactEmail: 'admin@logisticsresources.com',
  contactPhone: '+27 11 123 4567',
  address: '123 Transport Street, Johannesburg',
  
  // Security Settings
  requireTwoFactor: false,
  sessionTimeout: '30',
  passwordComplexity: 'medium',
  
  // Notification Settings
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  notificationFrequency: 'immediate',
  
  // Route Settings
  maxRouteCapacity: '50',
  defaultRouteDuration: '60',
  allowRouteOverlap: false,
  requireRouteApproval: true,
  
  // Vehicle Settings
  maxVehicleAge: '10',
  requireDailyChecks: true,
  maintenanceReminder: '30',
  fuelThreshold: '25',
  
  // Driver Settings
  maxDriverHours: '8',
  requireDriverTraining: true,
  licenseExpiryReminder: '30',
  backgroundCheckInterval: '12',
  
  // System Settings
  dataRetentionPeriod: '24',
  backupFrequency: 'daily',
  apiRateLimit: '1000',
  debugMode: false
};

export const useSettings = () => {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && profile) {
      fetchSettings();
    }
  }, [user, profile]);

  const fetchSettings = async () => {
    try {
      // Use type assertion since the types haven't been regenerated yet
      const { data, error } = await (supabase as any)
        .from('app_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
        return;
      }

      if (data && data.settings) {
        setSettings({ ...defaultSettings, ...data.settings });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    if (!user || !profile) {
      toast.error('You must be logged in to save settings');
      return;
    }

    if (profile.role !== 'admin' && profile.role !== 'council') {
      toast.error('You do not have permission to modify settings');
      return;
    }

    setSaving(true);
    try {
      // Use type assertion since the types haven't been regenerated yet
      const { error } = await (supabase as any)
        .from('app_settings')
        .upsert({
          id: 'global',
          settings: newSettings,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      setSettings(newSettings);
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof AppSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return {
    settings,
    loading,
    saving,
    updateSetting,
    saveSettings,
    fetchSettings
  };
};

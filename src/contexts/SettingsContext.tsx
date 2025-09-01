import React, { createContext, useContext, useEffect, useState } from 'react';
import { storageManager, AppStorageData } from '@/utils/localStorage';

interface Settings {
  // Appearance
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  customFontSize: number; // Custom font size in pixels
  themeColor: string;
  customHue: string;
  
  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  
  // Advanced
  autoSave: boolean;
  debugMode: boolean;
  analyticsEnabled: boolean;
  lastSaved: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetSettings: () => void;
  isLoading: boolean;
  storageInfo: { used: number; available: number; total: number };
  exportSettings: () => string;
  importSettings: (backupData: string) => boolean;
  clearAllData: () => void;
}

const defaultSettings: Settings = {
  // Appearance
  theme: 'system',
  fontSize: 'medium',
  customFontSize: 16, // Default to 16px (medium)
  themeColor: 'teal',
  customHue: '180',
  
  // Accessibility
  reducedMotion: false,
  highContrast: false,
  
  // Notifications
  emailNotifications: true,
  pushNotifications: true,
  soundEnabled: true,
  
  // Advanced
  autoSave: true,
  debugMode: false,
  analyticsEnabled: true,
  lastSaved: Date.now(),
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0, total: 0 });

  // Load settings from storage manager on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        
        // Get app settings from storage manager
        const appSettings = storageManager.getAppSettings();
        
        // Get theme settings from storage manager
        const themeSettings = storageManager.getThemeSettings();
        
        // Merge settings with defaults
        const mergedSettings: Settings = {
          ...defaultSettings,
          theme: appSettings.theme,
          fontSize: appSettings.fontSize,
          customFontSize: appSettings.customFontSize,
          themeColor: themeSettings.themeColor,
          customHue: themeSettings.customHue,
          reducedMotion: appSettings.reducedMotion,
          highContrast: appSettings.highContrast,
          emailNotifications: appSettings.emailNotifications,
          pushNotifications: appSettings.pushNotifications,
          soundEnabled: appSettings.soundEnabled,
          autoSave: appSettings.autoSave,
          debugMode: appSettings.debugMode,
          analyticsEnabled: appSettings.analyticsEnabled,
          lastSaved: appSettings.lastSaved || Date.now(),
        };
        
        setSettings(mergedSettings);
        
        // Get storage usage information
        const info = storageManager.getStorageInfo();
        setStorageInfo(info);
        
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fall back to default settings
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to storage manager whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        // Update app settings
        storageManager.setAppSettings({
          theme: settings.theme,
          fontSize: settings.fontSize,
          customFontSize: settings.customFontSize,
          reducedMotion: settings.reducedMotion,
          highContrast: settings.highContrast,
          emailNotifications: settings.emailNotifications,
          pushNotifications: settings.pushNotifications,
          soundEnabled: settings.soundEnabled,
          autoSave: settings.autoSave,
          debugMode: settings.debugMode,
          analyticsEnabled: settings.analyticsEnabled,
          lastSaved: settings.lastSaved,
        });
        
        // Update theme settings
        storageManager.setThemeSettings({
          themeColor: settings.themeColor,
          customHue: settings.customHue,
        });
        
        // Update storage info
        const info = storageManager.getStorageInfo();
        setStorageInfo(info);
        
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    }
  }, [settings, isLoading]);

  // Apply settings to the document
  useEffect(() => {
    if (isLoading) return;

    const root = document.documentElement;

    // Apply font size using CSS variables or custom size
    const fontSizeMap = {
      small: 'var(--font-size-small)',
      medium: 'var(--font-size-medium)',
      large: 'var(--font-size-large)',
    };
    
    // If custom font size is set, use it; otherwise use preset
    if (settings.customFontSize && settings.customFontSize !== 16) {
      root.style.fontSize = `${settings.customFontSize}px`;
    } else {
      root.style.fontSize = fontSizeMap[settings.fontSize];
    }
    
    // Add smooth transition for font size changes
    root.style.transition = 'font-size 0.2s ease-out';

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--reduced-motion', 'reduce');
    } else {
      root.style.removeProperty('--reduced-motion');
    }

    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply theme color
    if (settings.themeColor === 'custom') {
      root.style.setProperty('--primary', `${settings.customHue} 72% 40%`);
      root.style.setProperty('--accent', `${settings.customHue} 60% 95%`);
      root.style.setProperty('--accent-foreground', `${settings.customHue} 72% 35%`);
    } else if (settings.themeColor === 'teal') {
      // Apply teal color by default
      root.style.setProperty('--primary', '180 72% 40%');
      root.style.setProperty('--accent', '180 60% 95%');
      root.style.setProperty('--accent-foreground', '180 72% 35%');
    } else {
      // Reset to default teal if not custom
      root.style.removeProperty('--primary');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-foreground');
    }
  }, [settings, isLoading]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value, lastSaved: Date.now() }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    
    // Reset storage manager settings
    storageManager.setAppSettings({
      theme: defaultSettings.theme,
      fontSize: defaultSettings.fontSize,
      customFontSize: defaultSettings.customFontSize,
      reducedMotion: defaultSettings.reducedMotion,
      highContrast: defaultSettings.highContrast,
      emailNotifications: defaultSettings.emailNotifications,
      pushNotifications: defaultSettings.pushNotifications,
      soundEnabled: defaultSettings.soundEnabled,
      autoSave: defaultSettings.autoSave,
      debugMode: defaultSettings.debugMode,
      analyticsEnabled: defaultSettings.analyticsEnabled,
      lastSaved: defaultSettings.lastSaved,
    });
    
    storageManager.setThemeSettings({
      themeColor: defaultSettings.themeColor,
      customHue: defaultSettings.customHue,
    });
  };

  const exportSettings = (): string => {
    return storageManager.exportSettings();
  };

  const importSettings = (backupData: string): boolean => {
    const success = storageManager.importSettings(backupData);
    if (success) {
      // Reload settings after import
      window.location.reload();
    }
    return success;
  };

  const clearAllData = (): void => {
    storageManager.clearAll();
    setSettings(defaultSettings);
    setStorageInfo({ used: 0, available: 0, total: 0 });
  };

  const value: SettingsContextType = {
    settings,
    updateSetting,
    resetSettings,
    isLoading,
    storageInfo,
    exportSettings,
    importSettings,
    clearAllData,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

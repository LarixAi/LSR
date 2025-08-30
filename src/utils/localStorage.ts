/**
 * Comprehensive Local Storage Manager for LSR Transport Management System
 * Handles all app settings, user preferences, and data persistence
 */

export interface StorageItem<T = any> {
  value: T;
  timestamp: number;
  version: string;
  checksum?: string;
  ttl?: number; // Time to live in milliseconds
}

export interface AppStorageData {
  // User Preferences
  theme: 'light' | 'dark' | 'system';
  themeColor: string;
  customHue: string;
  fontSize: 'small' | 'medium' | 'large';
  customFontSize: number; // Custom font size in pixels
  
  // App Settings
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  
  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  largeText: boolean;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  soundEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  
  // Privacy & Security
  locationSharing: boolean;
  analyticsEnabled: boolean;
  crashReporting: boolean;
  autoSave: boolean;
  
  // Display & UI
  sidebarCollapsed: boolean;
  compactMode: boolean;
  showTutorials: boolean;
  showTooltips: boolean;
  
  // Data & Performance
  cacheEnabled: boolean;
  offlineMode: boolean;
  dataUsage: 'low' | 'standard' | 'high';
  autoRefresh: boolean;
  
  // Advanced Settings
  debugMode: boolean;
  organizationId?: string;
  role?: string;
  
  // Custom Settings
  customSettings: Record<string, any>;
  
  // Last Updated
  lastUpdated: number;
  lastSaved: number;
}

export interface UserPreferences {
  userId: string;
  organizationId: string;
  role: string;
  preferences: AppStorageData;
  lastSync: number;
}

export interface CacheData {
  key: string;
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class LocalStorageManager {
  private readonly APP_PREFIX = 'lsr_';
  private readonly VERSION = '1.0.0';
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cached items
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  // Storage keys
  private readonly KEYS = {
    USER_PREFERENCES: 'user_preferences',
    APP_SETTINGS: 'app_settings',
    THEME_SETTINGS: 'theme_settings',
    CACHE_DATA: 'cache_data',
    USER_SESSION: 'user_session',
    NOTIFICATION_SETTINGS: 'notification_settings',
    UI_STATE: 'ui_state',
    FORM_DATA: 'form_data',
    SEARCH_HISTORY: 'search_history',
    RECENT_ITEMS: 'recent_items',
    FAVORITES: 'favorites',
    CUSTOM_WIDGETS: 'custom_widgets',
    DASHBOARD_LAYOUT: 'dashboard_layout',
    TABLE_COLUMNS: 'table_columns',
    FILTER_PREFERENCES: 'filter_preferences',
    SORT_PREFERENCES: 'sort_preferences',
    EXPORT_SETTINGS: 'export_settings',
    PRINT_SETTINGS: 'print_settings',
    MOBILE_SETTINGS: 'mobile_settings',
    OFFLINE_DATA: 'offline_data',
    SYNC_QUEUE: 'sync_queue',
    ERROR_LOGS: 'error_logs',
    PERFORMANCE_METRICS: 'performance_metrics',
    USER_ONBOARDING: 'user_onboarding',
    FEATURE_FLAGS: 'feature_flags',
    API_CACHE: 'api_cache',
    IMAGE_CACHE: 'image_cache',
    DOCUMENT_CACHE: 'document_cache',
    TEMP_DATA: 'temp_data'
  };

  constructor() {
    this.initializeStorage();
  }

  /**
   * Initialize storage and migrate old data if needed
   */
  private initializeStorage(): void {
    try {
      // Check if storage is available
      if (!this.isStorageAvailable()) {
        console.warn('Local storage not available, falling back to session storage');
        return;
      }

      // Migrate old data if needed
      this.migrateOldData();
      
      // Initialize default settings if none exist
      this.initializeDefaultSettings();
      
      // Clean up expired cache items
      this.cleanupExpiredCache();
      
    } catch (error) {
      console.error('Error initializing local storage:', error);
    }
  }

  /**
   * Check if storage is available
   */
  private isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Migrate old data format to new format
   */
  private migrateOldData(): void {
    try {
      // Migrate old theme settings
      const oldThemeColor = localStorage.getItem('themeColor');
      const oldThemeHue = localStorage.getItem('themeHue');
      
      if (oldThemeColor && oldThemeHue) {
        this.setThemeSettings({
          themeColor: oldThemeColor,
          customHue: oldThemeHue
        });
        
        // Clean up old keys
        localStorage.removeItem('themeColor');
        localStorage.removeItem('themeHue');
      }

      // Migrate old app settings
      const oldAppSettings = localStorage.getItem('appSettings');
      if (oldAppSettings) {
        try {
          const parsed = JSON.parse(oldAppSettings);
          this.setAppSettings(parsed);
          localStorage.removeItem('appSettings');
        } catch (error) {
          console.warn('Failed to migrate old app settings:', error);
        }
      }

      // Migrate old cookie consent
      const oldCookieConsent = localStorage.getItem('cookie_consent');
      if (oldCookieConsent) {
        try {
          const parsed = JSON.parse(oldCookieConsent);
          this.setItem('privacy_settings', parsed);
          localStorage.removeItem('cookie_consent');
        } catch (error) {
          console.warn('Failed to migrate old cookie consent:', error);
        }
      }

    } catch (error) {
      console.error('Error migrating old data:', error);
    }
  }

  /**
   * Initialize default settings if none exist
   */
  private initializeDefaultSettings(): void {
    try {
      if (!this.getItem(this.KEYS.APP_SETTINGS)) {
        const defaultSettings: AppStorageData = {
          theme: 'system',
          themeColor: 'teal',
          customHue: '180',
          fontSize: 'medium',
          customFontSize: 16,
          language: navigator.language || 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '24h',
          reducedMotion: false,
          highContrast: false,
          screenReader: false,
          largeText: false,
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          soundEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
          locationSharing: true,
          analyticsEnabled: true,
          crashReporting: true,
          autoSave: true,
          sidebarCollapsed: false,
          compactMode: false,
          showTutorials: true,
          showTooltips: true,
          cacheEnabled: true,
          offlineMode: false,
          dataUsage: 'standard',
          autoRefresh: true,
          debugMode: false,
          customSettings: {},
          lastUpdated: Date.now(),
          lastSaved: Date.now()
        };
        
        this.setAppSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error initializing default settings:', error);
    }
  }

  /**
   * Set a storage item with metadata
   */
  setItem<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const fullKey = this.APP_PREFIX + key;
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        version: this.VERSION,
        checksum: this.generateChecksum(value)
      };

      if (ttl) {
        item.ttl = ttl;
      }

      const serialized = JSON.stringify(item);
      localStorage.setItem(fullKey, serialized);
      
      return true;
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      return false;
    }
  }

  /**
   * Get a storage item with validation
   */
  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const fullKey = this.APP_PREFIX + key;
      const item = localStorage.getItem(fullKey);
      
      if (!item) {
        return defaultValue || null;
      }

      const parsed: StorageItem<T> = JSON.parse(item);
      
      // Check if item has expired
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(fullKey);
        return defaultValue || null;
      }

      // Validate checksum if present
      if (parsed.checksum && parsed.checksum !== this.generateChecksum(parsed.value)) {
        console.warn(`Checksum mismatch for item ${key}, removing corrupted data`);
        localStorage.removeItem(fullKey);
        return defaultValue || null;
      }

      return parsed.value;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return defaultValue || null;
    }
  }

  /**
   * Remove a storage item
   */
  removeItem(key: string): boolean {
    try {
      const fullKey = this.APP_PREFIX + key;
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all app-related storage
   */
  clearAll(): boolean {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.APP_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Get all storage keys
   */
  getAllKeys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.APP_PREFIX))
        .map(key => key.replace(this.APP_PREFIX, ''));
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return [];
    }
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): { used: number; available: number; total: number } {
    try {
      let used = 0;
      const keys = this.getAllKeys();
      
      keys.forEach(key => {
        const fullKey = this.APP_PREFIX + key;
        const item = localStorage.getItem(fullKey);
        if (item) {
          used += item.length * 2; // Approximate size in bytes
        }
      });

      // Estimate available storage (localStorage typically has 5-10MB limit)
      const total = 5 * 1024 * 1024; // 5MB estimate
      const available = total - used;

      return { used, available, total };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, available: 0, total: 0 };
    }
  }

  /**
   * App Settings Management
   */
  setAppSettings(settings: Partial<AppStorageData>): boolean {
    const current = this.getAppSettings();
    const updated = { ...current, ...settings, lastUpdated: Date.now() };
    return this.setItem(this.KEYS.APP_SETTINGS, updated);
  }

  getAppSettings(): AppStorageData {
    return this.getItem(this.KEYS.APP_SETTINGS, {
      theme: 'system',
      themeColor: 'teal',
      customHue: '180',
      fontSize: 'medium',
      customFontSize: 16,
      language: 'en',
      timezone: 'UTC',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '24h',
      reducedMotion: false,
      highContrast: false,
      screenReader: false,
      largeText: false,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      soundEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      locationSharing: true,
      analyticsEnabled: true,
      crashReporting: true,
      autoSave: true,
      sidebarCollapsed: false,
      compactMode: false,
      showTutorials: true,
      showTooltips: true,
      cacheEnabled: true,
      offlineMode: false,
      dataUsage: 'standard',
      autoRefresh: true,
      debugMode: false,
                customSettings: {},
          lastUpdated: Date.now(),
          lastSaved: Date.now()
        });
  }

  /**
   * Theme Settings Management
   */
  setThemeSettings(settings: { themeColor: string; customHue: string }): boolean {
    return this.setItem(this.KEYS.THEME_SETTINGS, settings);
  }

  getThemeSettings(): { themeColor: string; customHue: string } {
    return this.getItem(this.KEYS.THEME_SETTINGS, {
      themeColor: 'teal',
      customHue: '180'
    });
  }

  /**
   * User Preferences Management
   */
  setUserPreferences(userId: string, preferences: Partial<AppStorageData>): boolean {
    const userPrefs: UserPreferences = {
      userId,
      organizationId: preferences.organizationId || '',
      role: preferences.role || '',
      preferences: this.getAppSettings(),
      lastSync: Date.now()
    };
    
    // Merge with existing preferences
    const existing = this.getItem<UserPreferences>(`user_${userId}_preferences`);
    if (existing) {
      userPrefs.preferences = { ...existing.preferences, ...preferences };
    }
    
    return this.setItem(`user_${userId}_preferences`, userPrefs);
  }

  getUserPreferences(userId: string): UserPreferences | null {
    return this.getItem<UserPreferences>(`user_${userId}_preferences`);
  }

  /**
   * Cache Management
   */
  setCacheData(key: string, data: any, ttl: number = this.DEFAULT_TTL): boolean {
    const cacheItem: CacheData = {
      key,
      data,
      timestamp: Date.now(),
      ttl
    };
    
    return this.setItem(`${this.KEYS.CACHE_DATA}_${key}`, cacheItem, ttl);
  }

  getCacheData(key: string): any {
    const cacheItem = this.getItem<CacheData>(`${this.KEYS.CACHE_DATA}_${key}`);
    if (!cacheItem) return null;
    
    // Check if expired
    if (Date.now() - cacheItem.timestamp > cacheItem.ttl) {
      this.removeItem(`${this.KEYS.CACHE_DATA}_${key}`);
      return null;
    }
    
    return cacheItem.data;
  }

  clearCache(): boolean {
    try {
      const keys = this.getAllKeys();
      keys.forEach(key => {
        if (key.startsWith(this.KEYS.CACHE_DATA)) {
          this.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Clean up expired cache items
   */
  private cleanupExpiredCache(): void {
    try {
      const keys = this.getAllKeys();
      keys.forEach(key => {
        if (key.startsWith(this.KEYS.CACHE_DATA)) {
          const item = this.getItem<CacheData>(key);
          if (item && Date.now() - item.timestamp > item.ttl) {
            this.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up expired cache:', error);
    }
  }

  /**
   * Generate simple checksum for data validation
   */
  private generateChecksum(data: any): string {
    try {
      const str = JSON.stringify(data);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash.toString(36);
    } catch (error) {
      return '';
    }
  }

  /**
   * Export all settings for backup
   */
  exportSettings(): string {
    try {
      const allData: Record<string, any> = {};
      const keys = this.getAllKeys();
      
      keys.forEach(key => {
        allData[key] = this.getItem(key);
      });
      
      return JSON.stringify(allData, null, 2);
    } catch (error) {
      console.error('Error exporting settings:', error);
      return '';
    }
  }

  /**
   * Import settings from backup
   */
  importSettings(backupData: string): boolean {
    try {
      const data = JSON.parse(backupData);
      const keys = Object.keys(data);
      
      keys.forEach(key => {
        this.setItem(key, data[key]);
      });
      
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }

  /**
   * Sync settings with server (placeholder for future implementation)
   */
  async syncWithServer(): Promise<boolean> {
    try {
      // TODO: Implement server sync
      console.log('Server sync not yet implemented');
      return true;
    } catch (error) {
      console.error('Error syncing with server:', error);
      return false;
    }
  }
}

// Create singleton instance
export const storageManager = new LocalStorageManager();

// Export convenience functions
export const {
  setItem,
  getItem,
  removeItem,
  clearAll,
  getAllKeys,
  getStorageInfo,
  setAppSettings,
  getAppSettings,
  setThemeSettings,
  getThemeSettings,
  setUserPreferences,
  getUserPreferences,
  setCacheData,
  getCacheData,
  clearCache,
  exportSettings,
  importSettings,
  syncWithServer
} = storageManager;

export default storageManager;

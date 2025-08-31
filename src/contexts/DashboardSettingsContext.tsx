import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface WidgetLayout {
  gridSize: 12 | 16 | 24;
  spacing: 'compact' | 'normal' | 'spacious';
  autoLayout: boolean;
}

export interface NumberFormat {
  decimals: number;
  currency: string;
  thousandsSeparator: string;
  decimalSeparator: string;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum cache size in MB
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
}

export interface WidgetStyles {
  borderStyle: 'solid' | 'dashed' | 'none';
  borderWidth: number;
  borderRadius: number;
  shadow: 'none' | 'sm' | 'md' | 'lg';
}

export interface GridConfiguration {
  columns: number;
  rows: number;
  gap: number;
  padding: number;
}

export interface AlertThresholds {
  warning: number;
  critical: number;
  enabled: boolean;
}

export interface VisualPreferences {
  showIcons: boolean;
  showTrends: boolean;
  colorCoding: boolean;
  compactMode: boolean;
}

export interface DataPreferences {
  historicalRange: '7d' | '30d' | '90d' | '1y';
  refreshStrategy: 'realtime' | 'interval' | 'manual';
  offlineMode: boolean;
}

export interface WidgetPreferences {
  displayFields: string[];
  refreshInterval: number;
  alertThresholds: AlertThresholds;
  visualPreferences: VisualPreferences;
  dataPreferences: DataPreferences;
}

export interface DashboardSettings {
  // Widget Management
  defaultLayout: WidgetLayout;
  widgetPreferences: Record<string, WidgetPreferences>;
  refreshIntervals: Record<string, number>;
  
  // Display Preferences
  dateFormat: string;
  numberFormat: NumberFormat;
  timezone: string;
  language: string;
  
  // Performance
  cacheSettings: CacheConfig;
  lazyLoading: boolean;
  animations: boolean;
  
  // Theme
  colorScheme: ColorScheme;
  widgetStyles: WidgetStyles;
  gridConfig: GridConfiguration;
  
  // User Preferences
  lastModified: number;
  version: string;
}

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

const defaultSettings: DashboardSettings = {
  // Widget Management
  defaultLayout: {
    gridSize: 12,
    spacing: 'normal',
    autoLayout: true,
  },
  widgetPreferences: {},
  refreshIntervals: {
    default: 300, // 5 minutes
    vor_vehicles: 60, // 1 minute
    fuel_reports: 300, // 5 minutes
    maintenance_due: 600, // 10 minutes
    driver_compliance: 900, // 15 minutes
  },
  
  // Display Preferences
  dateFormat: 'MMM dd, yyyy',
  numberFormat: {
    decimals: 2,
    currency: 'USD',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  timezone: 'UTC',
  language: 'en',
  
  // Performance
  cacheSettings: {
    enabled: true,
    ttl: 3600, // 1 hour
    maxSize: 100, // 100 MB
  },
  lazyLoading: true,
  animations: true,
  
  // Theme
  colorScheme: {
    primary: '#0ea5e9', // Sky blue
    secondary: '#64748b', // Slate
    accent: '#f59e0b', // Amber
    background: '#ffffff', // White
    surface: '#f8fafc', // Slate 50
  },
  widgetStyles: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 8,
    shadow: 'md',
  },
  gridConfig: {
    columns: 12,
    rows: 8,
    gap: 16,
    padding: 24,
  },
  
  // User Preferences
  lastModified: Date.now(),
  version: '1.0.0',
};

// ============================================================================
// ACTION TYPES
// ============================================================================

export type DashboardSettingsAction =
  | { type: 'UPDATE_WIDGET_PREFERENCES'; widgetId: string; preferences: Partial<WidgetPreferences> }
  | { type: 'UPDATE_DEFAULT_LAYOUT'; layout: Partial<WidgetLayout> }
  | { type: 'UPDATE_REFRESH_INTERVALS'; intervals: Record<string, number> }
  | { type: 'UPDATE_DATE_FORMAT'; format: string }
  | { type: 'UPDATE_NUMBER_FORMAT'; format: Partial<NumberFormat> }
  | { type: 'UPDATE_TIMEZONE'; timezone: string }
  | { type: 'UPDATE_LANGUAGE'; language: string }
  | { type: 'UPDATE_CACHE_SETTINGS'; settings: Partial<CacheConfig> }
  | { type: 'TOGGLE_LAZY_LOADING'; enabled: boolean }
  | { type: 'TOGGLE_ANIMATIONS'; enabled: boolean }
  | { type: 'UPDATE_COLOR_SCHEME'; scheme: Partial<ColorScheme> }
  | { type: 'UPDATE_WIDGET_STYLES'; styles: Partial<WidgetStyles> }
  | { type: 'UPDATE_GRID_CONFIG'; config: Partial<GridConfiguration> }
  | { type: 'RESET_TO_DEFAULTS' }
  | { type: 'LOAD_SETTINGS'; settings: DashboardSettings };

// ============================================================================
// REDUCER
// ============================================================================

function dashboardSettingsReducer(
  state: DashboardSettings,
  action: DashboardSettingsAction
): DashboardSettings {
  switch (action.type) {
    case 'UPDATE_WIDGET_PREFERENCES':
      return {
        ...state,
        widgetPreferences: {
          ...state.widgetPreferences,
          [action.widgetId]: {
            ...state.widgetPreferences[action.widgetId],
            ...action.preferences,
          },
        },
        lastModified: Date.now(),
      };

    case 'UPDATE_DEFAULT_LAYOUT':
      return {
        ...state,
        defaultLayout: {
          ...state.defaultLayout,
          ...action.layout,
        },
        lastModified: Date.now(),
      };

    case 'UPDATE_REFRESH_INTERVALS':
      return {
        ...state,
        refreshIntervals: {
          ...state.refreshIntervals,
          ...action.intervals,
        },
        lastModified: Date.now(),
      };

    case 'UPDATE_DATE_FORMAT':
      return {
        ...state,
        dateFormat: action.format,
        lastModified: Date.now(),
      };

    case 'UPDATE_NUMBER_FORMAT':
      return {
        ...state,
        numberFormat: {
          ...state.numberFormat,
          ...action.format,
        },
        lastModified: Date.now(),
      };

    case 'UPDATE_TIMEZONE':
      return {
        ...state,
        timezone: action.timezone,
        lastModified: Date.now(),
      };

    case 'UPDATE_LANGUAGE':
      return {
        ...state,
        language: action.language,
        lastModified: Date.now(),
      };

    case 'UPDATE_CACHE_SETTINGS':
      return {
        ...state,
        cacheSettings: {
          ...state.cacheSettings,
          ...action.settings,
        },
        lastModified: Date.now(),
      };

    case 'TOGGLE_LAZY_LOADING':
      return {
        ...state,
        lazyLoading: action.enabled,
        lastModified: Date.now(),
      };

    case 'TOGGLE_ANIMATIONS':
      return {
        ...state,
        animations: action.enabled,
        lastModified: Date.now(),
      };

    case 'UPDATE_COLOR_SCHEME':
      return {
        ...state,
        colorScheme: {
          ...state.colorScheme,
          ...action.scheme,
        },
        lastModified: Date.now(),
      };

    case 'UPDATE_WIDGET_STYLES':
      return {
        ...state,
        widgetStyles: {
          ...state.widgetStyles,
          ...action.styles,
        },
        lastModified: Date.now(),
      };

    case 'UPDATE_GRID_CONFIG':
      return {
        ...state,
        gridConfig: {
          ...state.gridConfig,
          ...action.config,
        },
        lastModified: Date.now(),
      };

    case 'RESET_TO_DEFAULTS':
      return {
        ...defaultSettings,
        lastModified: Date.now(),
      };

    case 'LOAD_SETTINGS':
      return {
        ...action.settings,
        lastModified: Date.now(),
      };

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface DashboardSettingsContextType {
  settings: DashboardSettings;
  dispatch: React.Dispatch<DashboardSettingsAction>;
  updateWidgetPreferences: (widgetId: string, preferences: Partial<WidgetPreferences>) => void;
  updateDefaultLayout: (layout: Partial<WidgetLayout>) => void;
  updateRefreshIntervals: (intervals: Record<string, number>) => void;
  updateDateFormat: (format: string) => void;
  updateNumberFormat: (format: Partial<NumberFormat>) => void;
  updateTimezone: (timezone: string) => void;
  updateLanguage: (language: string) => void;
  updateCacheSettings: (settings: Partial<CacheConfig>) => void;
  toggleLazyLoading: (enabled: boolean) => void;
  toggleAnimations: (enabled: boolean) => void;
  updateColorScheme: (scheme: Partial<ColorScheme>) => void;
  updateWidgetStyles: (styles: Partial<WidgetStyles>) => void;
  updateGridConfig: (config: Partial<GridConfiguration>) => void;
  resetToDefaults: () => void;
  getWidgetPreferences: (widgetId: string) => WidgetPreferences;
  getRefreshInterval: (widgetType: string) => number;
}

const DashboardSettingsContext = createContext<DashboardSettingsContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface DashboardSettingsProviderProps {
  children: ReactNode;
}

export function DashboardSettingsProvider({ children }: DashboardSettingsProviderProps) {
  const [settings, dispatch] = useReducer(dashboardSettingsReducer, defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('dashboard-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        dispatch({ type: 'LOAD_SETTINGS', settings: parsed });
      } catch (error) {
        console.warn('Failed to load dashboard settings from localStorage:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dashboard-settings', JSON.stringify(settings));
  }, [settings]);

  // Helper functions
  const updateWidgetPreferences = (widgetId: string, preferences: Partial<WidgetPreferences>) => {
    dispatch({ type: 'UPDATE_WIDGET_PREFERENCES', widgetId, preferences });
  };

  const updateDefaultLayout = (layout: Partial<WidgetLayout>) => {
    dispatch({ type: 'UPDATE_DEFAULT_LAYOUT', layout });
  };

  const updateRefreshIntervals = (intervals: Record<string, number>) => {
    dispatch({ type: 'UPDATE_REFRESH_INTERVALS', intervals });
  };

  const updateDateFormat = (format: string) => {
    dispatch({ type: 'UPDATE_DATE_FORMAT', format });
  };

  const updateNumberFormat = (format: Partial<NumberFormat>) => {
    dispatch({ type: 'UPDATE_NUMBER_FORMAT', format });
  };

  const updateTimezone = (timezone: string) => {
    dispatch({ type: 'UPDATE_TIMEZONE', timezone });
  };

  const updateLanguage = (language: string) => {
    dispatch({ type: 'UPDATE_LANGUAGE', language });
  };

  const updateCacheSettings = (settings: Partial<CacheConfig>) => {
    dispatch({ type: 'UPDATE_CACHE_SETTINGS', settings });
  };

  const toggleLazyLoading = (enabled: boolean) => {
    dispatch({ type: 'TOGGLE_LAZY_LOADING', enabled });
  };

  const toggleAnimations = (enabled: boolean) => {
    dispatch({ type: 'TOGGLE_ANIMATIONS', enabled });
  };

  const updateColorScheme = (scheme: Partial<ColorScheme>) => {
    dispatch({ type: 'UPDATE_COLOR_SCHEME', scheme });
  };

  const updateWidgetStyles = (styles: Partial<WidgetStyles>) => {
    dispatch({ type: 'UPDATE_WIDGET_STYLES', styles });
  };

  const updateGridConfig = (config: Partial<GridConfiguration>) => {
    dispatch({ type: 'UPDATE_GRID_CONFIG', config });
  };

  const resetToDefaults = () => {
    dispatch({ type: 'RESET_TO_DEFAULTS' });
  };

  const getWidgetPreferences = (widgetId: string): WidgetPreferences => {
    return settings.widgetPreferences[widgetId] || {
      displayFields: [],
      refreshInterval: settings.refreshIntervals.default,
      alertThresholds: {
        warning: 0.7,
        critical: 0.9,
        enabled: true,
      },
      visualPreferences: {
        showIcons: true,
        showTrends: true,
        colorCoding: true,
        compactMode: false,
      },
      dataPreferences: {
        historicalRange: '30d',
        refreshStrategy: 'interval',
        offlineMode: false,
      },
    };
  };

  const getRefreshInterval = (widgetType: string): number => {
    return settings.refreshIntervals[widgetType] || settings.refreshIntervals.default;
  };

  const value: DashboardSettingsContextType = {
    settings,
    dispatch,
    updateWidgetPreferences,
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
    resetToDefaults,
    getWidgetPreferences,
    getRefreshInterval,
  };

  return (
    <DashboardSettingsContext.Provider value={value}>
      {children}
    </DashboardSettingsContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useDashboardSettings(): DashboardSettingsContextType {
  const context = useContext(DashboardSettingsContext);
  if (context === undefined) {
    throw new Error('useDashboardSettings must be used within a DashboardSettingsProvider');
  }
  return context;
}

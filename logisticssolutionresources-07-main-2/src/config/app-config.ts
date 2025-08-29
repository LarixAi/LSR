import { getAppType } from '@/utils/platform';

export interface AppConfig {
  appType: 'web' | 'driver' | 'parent' | 'mobile';
  features: {
    adminPanel: boolean;
    driverFeatures: boolean;
    parentFeatures: boolean;
    nativeCamera: boolean;
    backgroundLocation: boolean;
    pushNotifications: boolean;
    bluetooth: boolean;
  };
  routes: {
    defaultHome: string;
    allowedRoutes: string[];
  };
}

const configs: Record<string, AppConfig> = {
  web: {
    appType: 'web',
    features: {
      adminPanel: true,
      driverFeatures: true,
      parentFeatures: true,
      nativeCamera: false,
      backgroundLocation: false,
      pushNotifications: false,
      bluetooth: false,
    },
    routes: {
      defaultHome: '/dashboard',
      allowedRoutes: ['*'], // All routes allowed on web
    },
  },
  driver: {
    appType: 'driver',
    features: {
      adminPanel: false,
      driverFeatures: true,
      parentFeatures: false,
      nativeCamera: true,
      backgroundLocation: true,
      pushNotifications: true,
      bluetooth: true,
    },
    routes: {
      defaultHome: '/driver-dashboard',
      allowedRoutes: [
        '/driver-dashboard',
        '/driver-jobs',
        '/driver-schedule',
        '/driver-documents',
        '/driver-compliance',
        '/vehicle-check',
        '/auth',
        '/profile',
      ],
    },
  },
  parent: {
    appType: 'parent',
    features: {
      adminPanel: false,
      driverFeatures: false,
      parentFeatures: true,
      nativeCamera: true,
      backgroundLocation: false,
      pushNotifications: true,
      bluetooth: false,
    },
    routes: {
      defaultHome: '/parent-dashboard',
      allowedRoutes: [
        '/parent-dashboard',
        '/child-management',
        '/live-tracking',
        '/parent-notifications',
        '/parent-schedule',
        '/auth',
        '/profile',
      ],
    },
  },
  mobile: {
    appType: 'mobile',
    features: {
      adminPanel: false,
      driverFeatures: true,
      parentFeatures: true,
      nativeCamera: true,
      backgroundLocation: true,
      pushNotifications: true,
      bluetooth: true,
    },
    routes: {
      defaultHome: '/dashboard',
      allowedRoutes: [
        '/driver-dashboard',
        '/driver-jobs',
        '/driver-schedule',
        '/driver-documents',
        '/driver-compliance',
        '/vehicle-check',
        '/parent-dashboard',
        '/child-management',
        '/live-tracking',
        '/parent-notifications',
        '/parent-schedule',
        '/auth',
        '/profile',
      ],
    },
  },
};

export const getAppConfig = (): AppConfig => {
  const appType = getAppType();
  return configs[appType] || configs.web;
};

export const isRouteAllowed = (route: string): boolean => {
  const config = getAppConfig();
  if (config.routes.allowedRoutes.includes('*')) return true;
  
  return config.routes.allowedRoutes.some(allowedRoute => {
    if (allowedRoute === route) return true;
    if (allowedRoute.endsWith('*')) {
      const prefix = allowedRoute.slice(0, -1);
      return route.startsWith(prefix);
    }
    return false;
  });
};
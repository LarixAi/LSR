import { Capacitor } from '@capacitor/core';

export const isPlatform = {
  web: () => Capacitor.getPlatform() === 'web',
  ios: () => Capacitor.getPlatform() === 'ios',
  android: () => Capacitor.getPlatform() === 'android',
  mobile: () => Capacitor.isNativePlatform(),
  desktop: () => !Capacitor.isNativePlatform()
};

export const getAppType = () => {
  // Check environment variables set by mobile builds
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.VITE_APP_TYPE === 'driver') return 'driver';
    if (process.env.VITE_APP_TYPE === 'parent') return 'parent';
    if (process.env.VITE_PLATFORM === 'mobile') return 'mobile';
  }

  // Check window/global variables for mobile apps
  if (typeof window !== 'undefined') {
    // @ts-ignore - Check for Capacitor or mobile indicators
    if (window.Capacitor || window.cordova) return 'mobile';
    
    // Check user agent for mobile app indicators
    const userAgent = navigator.userAgent;
    if (userAgent.includes('TransEntrixDriver')) return 'driver';
    if (userAgent.includes('TransEntrixParent')) return 'parent';
    if (userAgent.includes('TransEntrix')) return 'mobile';
  }

  if (isPlatform.mobile()) {
    return 'mobile'; // fallback for mobile devices
  }
  
  return 'web';
};

export const shouldShowAdminFeatures = () => {
  return isPlatform.web() || isPlatform.desktop();
};

export const shouldShowMobileFeatures = () => {
  return isPlatform.mobile();
};
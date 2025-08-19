import { Capacitor } from '@capacitor/core';

export const isPlatform = {
  web: () => Capacitor.getPlatform() === 'web',
  ios: () => Capacitor.getPlatform() === 'ios',
  android: () => Capacitor.getPlatform() === 'android',
  mobile: () => Capacitor.isNativePlatform(),
  desktop: () => !Capacitor.isNativePlatform()
};

export const getAppType = () => {
  if (isPlatform.mobile()) {
    // Determine if this is driver or parent app based on app metadata
    const userAgent = navigator.userAgent;
    if (userAgent.includes('LogisticsDriver')) return 'driver';
    if (userAgent.includes('LogisticsParent')) return 'parent';
    return 'mobile'; // fallback
  }
  return 'web';
};

export const shouldShowAdminFeatures = () => {
  return isPlatform.web() || isPlatform.desktop();
};

export const shouldShowMobileFeatures = () => {
  return isPlatform.mobile();
};
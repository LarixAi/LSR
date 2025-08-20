import { Capacitor } from '@capacitor/core';

/**
 * Check if the app is running on a mobile device
 */
export const isMobile = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch (error) {
    // Fallback to user agent detection
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }
};

/**
 * Check if the app is running on iOS
 */
export const isIOS = (): boolean => {
  try {
    return Capacitor.getPlatform() === 'ios';
  } catch (error) {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }
};

/**
 * Check if the app is running on Android
 */
export const isAndroid = (): boolean => {
  try {
    return Capacitor.getPlatform() === 'android';
  } catch (error) {
    return /Android/.test(navigator.userAgent);
  }
};

/**
 * Check if the app is running on web
 */
export const isWeb = (): boolean => {
  return !isMobile();
};

/**
 * Get the current platform
 */
export const getPlatform = (): 'ios' | 'android' | 'web' => {
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  return 'web';
};

/**
 * Check if biometric authentication is available
 */
export const isBiometricAvailable = async (): Promise<boolean> => {
  if (!isMobile()) return false;
  
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    const result = await NativeBiometric.isAvailable();
    return result.isAvailable;
  } catch (error) {
    console.log('Biometric not available:', error);
    return false;
  }
};

/**
 * Get device information
 */
export const getDeviceInfo = () => {
  return {
    platform: getPlatform(),
    isMobile: isMobile(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isWeb: isWeb(),
    userAgent: navigator.userAgent,
  };
};

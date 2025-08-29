import React from 'react';
import { getAppConfig } from '@/config/app-config';
import { isPlatform } from '@/utils/platform';

interface MobileFeatureWrapperProps {
  children: React.ReactNode;
  feature: 'adminPanel' | 'driverFeatures' | 'parentFeatures' | 'nativeCamera' | 'backgroundLocation' | 'pushNotifications' | 'bluetooth';
  fallback?: React.ReactNode;
}

const MobileFeatureWrapper: React.FC<MobileFeatureWrapperProps> = ({ 
  children, 
  feature, 
  fallback = null 
}) => {
  const config = getAppConfig();
  
  // Check if the feature is enabled for this platform
  if (!config.features[feature]) {
    return <>{fallback}</>;
  }

  // Additional platform-specific checks
  if (feature === 'nativeCamera' && !isPlatform.mobile()) {
    return <>{fallback}</>;
  }

  if (feature === 'adminPanel' && isPlatform.mobile()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default MobileFeatureWrapper;
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lsr.parent',
  appName: 'LSRMobileApp',
  webDir: 'dist-parent',
  server: {
    androidScheme: 'https'
  },
  bundledWebRuntime: false,
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    Geolocation: {
      permissions: ['location']
    }
  },
  ios: {
    scheme: 'TransEntrix Parent'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
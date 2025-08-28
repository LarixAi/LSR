import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.transentrix.parent',
  appName: 'TransEntrix Parent',
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
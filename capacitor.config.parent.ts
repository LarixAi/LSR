import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lsr.parent',
  appName: 'LSR Parent App',
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
    scheme: 'LSR Parent'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
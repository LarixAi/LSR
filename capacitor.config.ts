import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lsr.driver',
  appName: 'LSR Driver App',
  webDir: 'dist-driver',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {},
    Geolocation: {},
    BluetoothLe: {}
  },
  ios: {
    scheme: 'App'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
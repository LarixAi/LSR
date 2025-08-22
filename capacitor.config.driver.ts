import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lsr.driver',
  appName: 'LSR Driver App',
  webDir: 'dist-driver',
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
    },
    BluetoothLe: {
      permissions: ['bluetooth', 'bluetoothAdmin', 'accessCoarseLocation']
    }
  },
  ios: {
    scheme: 'LSR Driver'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
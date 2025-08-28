import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.transentrix.driver',
  appName: 'TransEntrix Driver',
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
    scheme: 'TransEntrix Driver'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
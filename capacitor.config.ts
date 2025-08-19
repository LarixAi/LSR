import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.transentrix.driver',
  appName: 'TransEntrix Driver',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    url: 'http://192.168.73.189:3000',
    cleartext: true
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
    scheme: 'App'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
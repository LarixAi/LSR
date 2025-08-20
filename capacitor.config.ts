import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lsr.driver',
  appName: 'LSRMobileApp',
  webDir: 'dist-driver',
  server: {
    androidScheme: 'https',
    cleartext: false,
    allowNavigation: [
      'https://dznbihypzmvcmradijqn.supabase.co',
      'https://*.supabase.co',
      'https://dznbihypzmvcmradijqn.supabase.co/*',
      'https://supabase.co/*'
    ]
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    Geolocation: {
      permissions: ['location']
    }
  },
  ios: {
    scheme: 'App',
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
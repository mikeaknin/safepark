import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.safepark.mobile',
  appName: 'SafePark',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#0F172A',
  server: {
    androidScheme: 'https',
    iosScheme: 'safepark',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0F172A',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#2C73D2',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1E293B',
      overlaysWebView: false,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_safepark',
      iconColor: '#2C73D2',
      sound: 'beep.wav',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  ios: {
    contentInset: 'always',
    scheme: 'SafePark',
    preferredContentMode: 'mobile',
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0F172A',
  },
};

export default config;

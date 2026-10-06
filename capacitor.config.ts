import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.christalineshop.admin',
  appName: 'Christaline Admin',
  webDir: 'public',
  server: {
    url: 'https://christaline-shop.vercel.app/admin?app=mobile',
    cleartext: true,
    allowNavigation: [
      'christaline-shop.vercel.app',
      'api.feexpay.me',
      'api.telegram.org',
      'localhost'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#9d174d',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      backgroundColor: '#9d174d',
      style: 'DARK'
    }
  }
};

export default config;

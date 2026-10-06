import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.christalineshop.app',
  appName: 'Christaline Shop',
  webDir: 'public',
  server: {
    url: 'https://christaline-shop.vercel.app',
    cleartext: false,
    allowNavigation: [
      'christaline-shop.vercel.app',
      'api.feexpay.me',
      'wa.me',
      'api.whatsapp.com'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
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

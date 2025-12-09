import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.textisur.app',
    appName: 'TextiSur',
    webDir: '.next',
    bundledWebRuntime: false,
    server: {
        androidScheme: 'http',
        hostname: 'localhost',
        url: 'http://localhost:3000',
        cleartext: true
    },
    android: {
        buildOptions: {
            keystorePath: undefined,
            keystoreAlias: undefined,
        },
        allowMixedContent: true,
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#6366f1',
            showSpinner: false,
            androidSpinnerStyle: 'small',
            spinnerColor: '#ffffff',
            splashFullScreen: true,
            splashImmersive: true,
        },
        PushNotifications: {
            presentationOptions: ['badge', 'sound', 'alert'],
        },
    },
};

export default config;

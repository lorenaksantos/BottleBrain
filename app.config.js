export default {
  expo: {
    name: 'BottleBrain',
    slug: 'BottleBrain',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.jpg',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.jpg',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    extra: {
      eas: {
        projectId: 'bed8d769-27e1-46cc-84ba-0b93a141cfda',
      },
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.lorena.bottlebrain',
    },

    android: {
      package: 'com.lorena.bottlebrain',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.jpg',
        backgroundImage: './assets/android-icon-background.jpg',
        monochromeImage: './assets/android-icon-monochrome.jpg',
      },
      predictiveBackGestureEnabled: false,
    },

    web: {
      favicon: './assets/favicon.png',
    },

    // ⚠️  react-native-google-mobile-ads plugin removed —
    // AdMob is currently stubbed out and doesn't need native linking.
    // Add it back here when you're ready to activate real ads:
    //
     plugins: [
       [
         'react-native-google-mobile-ads',
         {
           androidAppId: 'ca-app-pub-2302538161039810~9589779703',
    //       iosAppId: 'YOUR_REAL_IOS_APP_ID',
         },
       ],
     ],
  },
};

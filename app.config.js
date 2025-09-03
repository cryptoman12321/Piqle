module.exports = {
  expo: {
    name: 'Piqle 2.0',
    slug: 'piqle-2-0',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF'
      }
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'webpack',
      output: 'static',
      build: {
        babel: {
          include: ['@expo/vector-icons']
        }
      }
    }
  }
};

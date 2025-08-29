const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for React Native Web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add web extensions
config.resolver.sourceExts.push('web.js', 'web.jsx', 'web.ts', 'web.tsx');

// Resolve React Native Web
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native$': 'react-native-web',
};



module.exports = config;

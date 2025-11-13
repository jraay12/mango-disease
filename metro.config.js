// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for TensorFlow.js model files
if (config.resolver && config.resolver.assetExts) {
  config.resolver.assetExts = [...config.resolver.assetExts, 'bin', 'json'];
}

module.exports = config;

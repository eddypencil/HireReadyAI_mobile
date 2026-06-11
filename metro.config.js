const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ignore .opencode folder to prevent permission errors
config.watchFolders = config.watchFolders || [];
config.resolver.blockList = [
  /\.opencode\/.*/,
];

module.exports = config;
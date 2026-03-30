const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
// Work around packages that publish ESM branches using `import.meta` which
// can leak into non-module web bundles in Metro.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;

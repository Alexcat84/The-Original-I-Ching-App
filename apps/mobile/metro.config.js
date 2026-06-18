const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getSentryExpoConfig(projectRoot);

config.watchFolders = [...(config.watchFolders ?? []), workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Force singleton resolution for packages that must have exactly one instance
// across the entire monorepo bundle. Without this, hoisted packages (e.g.
// expo-router in root/node_modules) resolve React 18 from the monorepo root
// while the app uses React 19 from apps/mobile/node_modules — two React
// instances in the same bundle → ReactSharedInternals.S crash at launch.
// Force React singleton: only 'react' has two copies (18 in root, 19 in mobile).
// react-native and react-dom live only in root/node_modules so they need no redirect.
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, "node_modules/react"),
};

module.exports = config;

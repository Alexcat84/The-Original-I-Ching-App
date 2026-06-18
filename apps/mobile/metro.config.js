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

// Force singleton resolution for React across the entire monorepo bundle.
// expo-router (and other Expo packages) are hoisted to root/node_modules and
// have no nested react copy, so Node's hierarchical lookup resolves their
// `require("react")` to root/node_modules/react@18.2.0 (used by apps/web) —
// while apps/mobile's own code uses react@19.0.0 from its local node_modules.
// Two React instances in one bundle → ReactSharedInternals.S undefined crash.
//
// `extraNodeModules` is only a fallback consulted when hierarchical lookup
// FAILS — since root/node_modules/react exists, it's found first and the
// fallback never triggers. A custom `resolveRequest` is required to truly
// override resolution for every requester, regardless of where they live.
const mobileReactDir = path.resolve(projectRoot, "node_modules/react");
const mobileReactMain = path.join(
  mobileReactDir,
  require(path.join(mobileReactDir, "package.json")).main
);
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react" || moduleName.startsWith("react/")) {
    const subpath = moduleName === "react" ? "" : moduleName.slice("react/".length);
    const filePath = subpath
      ? path.join(mobileReactDir, path.extname(subpath) ? subpath : `${subpath}.js`)
      : mobileReactMain;
    return { type: "sourceFile", filePath };
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

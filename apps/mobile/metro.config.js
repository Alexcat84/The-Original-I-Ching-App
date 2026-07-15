const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const fs = require("fs");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getSentryExpoConfig(projectRoot);

config.watchFolders = [...(config.watchFolders ?? []), workspaceRoot];
config.resolver.unstable_enableTsconfigPaths = true;
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
// Same singleton problem, react-native flavor (SDK 57 migration): the branch
// lockfile keeps an orphan react-native@0.79.6 at root/node_modules (npm needs a
// root placeholder for hoisted expo's `peer react-native@"*"`, and 0.86.0 cannot
// live there because its react@^19.2 peer clashes with root react@18.2.0, which
// apps/web owns). Root-hoisted libs (react-native-purchases, edge-to-edge) and
// parts of the graph then resolve the 0.79.6 JS while the native side builds
// 0.86.0 → mixed-version bundle (verified: the exported bundle contained the
// 0.79.6 StyleSheet). Force every `react-native` request to mobile's nested
// 0.86.0, delegating subpaths to the default resolver so platform extensions
// (.android.js etc.) keep working.
const mobileRNDir = path.resolve(projectRoot, "node_modules/react-native");
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@/")) {
    const relative = moduleName.slice(2);
    const candidates = [
      path.resolve(projectRoot, relative),
      path.resolve(projectRoot, `${relative}.ts`),
      path.resolve(projectRoot, `${relative}.tsx`),
      path.resolve(projectRoot, relative, "index.ts"),
      path.resolve(projectRoot, relative, "index.tsx"),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return { type: "sourceFile", filePath: candidate };
      }
    }
  }
  if (moduleName === "react" || moduleName.startsWith("react/")) {
    const subpath = moduleName === "react" ? "" : moduleName.slice("react/".length);
    const filePath = subpath
      ? path.join(mobileReactDir, path.extname(subpath) ? subpath : `${subpath}.js`)
      : mobileReactMain;
    return { type: "sourceFile", filePath };
  }
  if (moduleName === "react-native" || moduleName.startsWith("react-native/")) {
    const rewritten =
      moduleName === "react-native"
        ? mobileRNDir
        : path.join(mobileRNDir, moduleName.slice("react-native/".length));
    return context.resolveRequest(context, rewritten, platform);
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const { FileStore } = require('metro-cache');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 0. EXPLICIT PROJECT ROOT: Force Metro to stay in this directory
config.projectRoot = projectRoot;

// 1. WATCH FOLDERS LOCKDOWN: Explicitly only watch what is needed
config.watchFolders = [
  projectRoot,
  path.resolve(workspaceRoot, 'packages/shared'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 2. CACHE ISOLATION: Unique cache for this app only (Windows Cross-App Shield)
config.cacheStores = [
  new FileStore({
    root: path.join(projectRoot, 'node_modules', '.cache', 'metro-provider'),
  }),
];

const exclusionList = require('metro-config/src/defaults/exclusionList');

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Block the consumer app folder to prevent cross-app leakage/discovery
// Using both literal patterns and absolute path resolution for 100% Windows safety
config.resolver.blockList = exclusionList([
  /.*[/\\]apps[/\\]consumer[/\\]/,
  new RegExp(path.resolve(workspaceRoot, 'apps/consumer').replace(/\\/g, '\\\\') + '.*'),
  /.*apps[/\\]consumer[/\\]\.expo.*/,
]);

// Shim better-sqlite3 and native modules for Web builds
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // 1. ABSOLUTE ISOLATION: Explicitly block any resolution into the consumer app
  // This is a surgical guard that prevents "cross-app leakage"
  if (moduleName.includes('apps/consumer/app') || moduleName.includes('apps/consumer/package.json')) {
    throw new Error(`Boundary Breach: Provider app attempted to load ${moduleName}`);
  }

  // 2. Existing shims
  if (platform === 'web' && (moduleName === 'better-sqlite3' || moduleName === 'expo-secure-store')) {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'dummy.js'),
    };
  }

  // Chain to the default resolver
  return context.resolveRequest(context, moduleName, platform);
};

config.server = {
  port: 8083,
};

module.exports = config;

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const { FileStore } = require('metro-cache');

const config = getDefaultConfig(projectRoot);

// 0. EXPLICIT PROJECT ROOT
config.projectRoot = projectRoot;

// Watch limited folders to prevent leakage
config.watchFolders = [
  projectRoot,
  path.resolve(workspaceRoot, 'packages/shared'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// CACHE ISOLATION: Unique physical folder to prevent Windows process crosstalk
config.cacheStores = [
  new FileStore({
    root: path.join(projectRoot, 'node_modules', '.cache', 'metro-consumer'),
  }),
];

// 4. SERVER ISOLATION: Unique internal port to prevent socket conflicts
config.server = {
  port: 8081,
};

// Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Block the provider app folder to prevent cross-app leakage/discovery
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // 1. ABSOLUTE ISOLATION: Explicitly block any resolution into the provider app
  if (moduleName.includes('apps/provider/p-app') || moduleName.includes('apps/provider/package.json')) {
    throw new Error(`Boundary Breach: Consumer app attempted to load ${moduleName}`);
  }

  // 2. Shim better-sqlite3 for Web builds
  if (platform === 'web' && moduleName === 'better-sqlite3') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'dummy.js'),
    };
  }
  // Chain to the default resolver
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

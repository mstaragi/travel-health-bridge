const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Shim better-sqlite3 for Web builds
config.resolver.resolveRequest = (context, moduleName, platform) => {
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

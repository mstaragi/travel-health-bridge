const path = require('path');
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const consumerPath = path.resolve(workspaceRoot, 'apps/consumer');

console.log('--- Path Diagnostics ---');
console.log('Project Root:', projectRoot);
console.log('Workspace Root:', workspaceRoot);
console.log('Consumer Path:', consumerPath);

const regexString = consumerPath.replace(/\\/g, '\\\\');
const regex = new RegExp(regexString + '.*');

const testPath = path.join(consumerPath, 'app/(tabs)/emergency.tsx');
console.log('Testing Regex against:', testPath);
console.log('Match Result:', regex.test(testPath));

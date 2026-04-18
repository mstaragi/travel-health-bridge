/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@travelhealthbridge/shared',
    'react-native-web',
    'lucide-react-native',
    '@react-native/assets-registry',
  ],
  env: {
    // Map EXPO variables to the ones Next.js expects if they aren't provided
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  webpack: (config, { dev }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct references to react-native into react-native-web
      'react-native$': 'react-native-web',
      // Stub out the assets registry which contains Flow syntax that breaks the Next.js build
      '@react-native/assets-registry': false,
      '@react-native/assets-registry/registry': false,
    };
    config.resolve.extensions = [
      '.web.js',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];

    // Define __DEV__ which is expected by many React Native / Expo related packages
    config.plugins.push(
      new (require('webpack')).DefinePlugin({
        __DEV__: JSON.stringify(dev),
      })
    );

    return config;
  },
}

module.exports = nextConfig

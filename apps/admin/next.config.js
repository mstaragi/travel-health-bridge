/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@travelhealthbridge/shared',
    'react-native-web',
    'lucide-react-native',
  ],
  env: {
    // Map EXPO variables to the ones Next.js expects if they aren't provided
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct references to react-native into react-native-web
      'react-native$': 'react-native-web',
    };
    return config;
  },
}

module.exports = nextConfig

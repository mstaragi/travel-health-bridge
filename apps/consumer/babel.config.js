module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            'db': './db',
            'lib': './lib',
            'store': './app/store',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};

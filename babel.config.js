module.exports = {
  env: {
    test: {
      presets: ['@babel/preset-env', '@babel/preset-react'],
    },
    prod: {
      presets: ['@babel/preset-typescript'],
    },
  },

  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          React: 'react',
          ReactNative: 'react-native',
          ReactTestUtils: 'react-dom/test-utils',
        },
      },
    ],
  ],
}

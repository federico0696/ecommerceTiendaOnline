module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', { moduleName: '@env', path: '.env', safe: false, allowUndefined: true }],
    // Reanimated tiene que ser el último plugin.
    'react-native-reanimated/plugin',
  ],
};

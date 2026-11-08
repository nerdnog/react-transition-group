const { defaultBrowsers } = require('babel-preset-jason');

// babel-preset-jason uses its browser list only for production builds, which
// is how lib/ is built. Current caniuse data drops IE 11 from that list, so add
// it back to keep the ES5 output 4.4.5 shipped. Tests keep jason's own targets.
const targets =
  (process.env.NODE_ENV || 'production') === 'production'
    ? { browsers: [...defaultBrowsers, 'ie 11'] }
    : undefined;

module.exports = {
  presets: [['babel-preset-jason', { runtime: false, targets }]],
  plugins: [
    ['babel-plugin-transform-react-remove-prop-types', { mode: 'wrap' }],
  ],
  env: {
    esm: {
      presets: [['babel-preset-jason', { modules: false, targets }]],
    },
  },
};

import fs from 'fs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

const input = './src/index.js';
const name = 'ReactTransitionGroup';
const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
};

// terser drops the MIT notice in src/utils/fiberHost.js along with the
// constants it sits on, so the min bundle carries it as a banner.
const reactNotice = fs
  .readFileSync('./src/utils/fiberHost.js', 'utf8')
  .match(/^\/\*\*[\s\S]*?\*\//)[0];

const babelOptions = {
  exclude: /node_modules/,
  runtimeHelpers: true,
};

const commonjsOptions = {
  include: /node_modules/,
  namedExports: {
    'prop-types': ['object', 'oneOfType', 'element', 'bool', 'func'],
  },
};

export default [
  {
    input,
    output: {
      file: './lib/dist/react-transition-group.js',
      format: 'umd',
      name,
      globals,
    },
    external: Object.keys(globals),
    plugins: [
      nodeResolve(),
      babel(babelOptions),
      commonjs(commonjsOptions),
      replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
    ],
  },

  {
    input,
    output: {
      file: './lib/dist/react-transition-group.min.js',
      format: 'umd',
      name,
      globals,
      banner: reactNotice,
    },
    external: Object.keys(globals),
    plugins: [
      nodeResolve(),
      babel(babelOptions),
      commonjs(commonjsOptions),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      terser(),
    ],
  },
];

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const WebpackExtensionManifestPlugin = require('webpack-extension-manifest-plugin');

module.exports = (options) => {
  const IS_DEV = Boolean(options.dev);
  const __dirname = path.resolve();
  const BUILD_DIR = path.resolve(__dirname, IS_DEV ? 'dev' : 'build');

  const entry = {
    popup: path.resolve(__dirname, 'src/popup/index.tsx'),
    background: path.resolve(__dirname, 'src/background/index.js'),
    contentscript: path.resolve(__dirname, 'src/contentscript/index.js'),
  };

  if (IS_DEV) {
    entry['hotReload'] = path.resolve(__dirname, 'src/background/hot-reload.js');
  }

  return {
    entry,
    output: {
      filename: (chunkData) => {
        switch (chunkData.chunk.name) {
          case 'hotReload':
            return 'background/hot-reload.js';
          case 'popup':
            return '[name]/index.js';
          default:
            return '[name]/index.js';
        }
      },
      path: BUILD_DIR,
    },
    watch: IS_DEV ? true : false,
    mode: IS_DEV ? 'development' : 'production',
    devtool: IS_DEV ? 'source-map' : undefined,
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      modules: ['src', 'node_modules'],
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.scss$/,
          use: [
            { loader: 'style-loader' },
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[local]',
                },
              },
            },
            { loader: 'sass-loader' },
          ],
        },
        {
          test: /\.css$/,
          include: /node_modules/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.svg$/,
          use: {
            loader: 'svg-url-loader',
          },
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin({
        verbose: true,
        cleanAfterEveryBuildPatterns: ['!*/**/*', '!manifest.js'],
      }),
      new ESLintPlugin({
        emitError: true,
        emitWarning: true,
        failOnError: true,
        extensions: ['js', 'jsx', 'ts', 'tsx'],
        overrideConfigFile: './.eslintrc.json',
      }),
      new WebpackExtensionManifestPlugin({
        config: {
          base: 'manifest.js',
          extend: IS_DEV && {
            name: 'Evest Web Time Tracker Dev',
            background: {
              scripts: ['background/index.js', 'background/hot-reload.js'],
            },
          },
        },
        pkgJsonProps: ['version'],
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'assets/', to: 'assets' },
          { from: '_locales/', to: '_locales' },
          { from: 'src/popup/index.html', to: 'popup' },
        ],
      }),
    ],
  };
};

const path = require('path');
const nodeExternals = require('webpack-node-externals');

const serverConfig = {
  name: 'server',
  mode: 'production',
  entry: './src/server.ts',
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
};

const clientConfig = {
  name: 'client',
  mode: 'production',
  entry: './addon/samples/script.ts',
  target: 'web',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [
      path.resolve(__dirname, 'addon'),
      path.resolve(__dirname, 'node_modules'),
    ],
    alias: {
      // Handle relative imports from script.ts which might expect to be in samples/
      '../internal': path.resolve(__dirname, 'addon/internal'),
      '../types': path.resolve(__dirname, 'addon/types'),
    }
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'static'),
    libraryTarget: 'window',
  },
};

module.exports = [serverConfig, clientConfig];

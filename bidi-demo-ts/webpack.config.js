const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require("copy-webpack-plugin");

const serverConfig = {
  mode: 'production',
  target: 'node',
  entry: './src/server.ts',
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist'),
    clean: false,
  },
  resolve: {
    extensions: ['.ts', '.js', '.mjs'],
  },
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
};

const clientConfig = {
  mode: 'production',
  target: 'web',
  entry: './src/client/script.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/public'),
    libraryTarget: 'window',
    clean: false,
  },
  resolve: {
    extensions: ['.ts', '.js', '.mjs'],
    alias: {
    },
    fallback: {
      "crypto": false,
      "fs": false,
      "path": false,
      "os": false,
      "net": false,
      "tls": false
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/client/index.html", to: "index.html" }, // copies to dist/public/index.html
      ],
    }),
  ],
};

module.exports = [serverConfig, clientConfig];

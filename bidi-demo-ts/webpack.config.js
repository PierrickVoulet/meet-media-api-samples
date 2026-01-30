const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
require("dotenv").config();

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
    new webpack.DefinePlugin({
      'process.env.GOOGLE_API_KEY': JSON.stringify(process.env.GOOGLE_API_KEY),
      'process.env.DEMO_AGENT_MODEL': JSON.stringify(process.env.DEMO_AGENT_MODEL || "gemini-2.5-flash-native-audio-preview-12-2025"),
    }),
  ],
};

module.exports = [serverConfig, clientConfig];

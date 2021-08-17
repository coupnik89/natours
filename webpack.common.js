const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './public/index.js',
  module: {
    rules: [{
        test: /\.js$/,
        exclude: '/node_modules/',
        use: ['babel-loader']
      }
    ],
  },
};

// module.exports = {
//   entry: './src/index.js',
//   module: {
//     rules: [{
//         test: /\.js$/,
//         use: ['babel-loader']
//       },
//       {
//         test: /\.s[ac]ss$/i,
//         use: [
//           // Creates `style` nodes from JS strings
//           'style-loader',
//           // Translates CSS into CommonJS
//           'css-loader',
//           // Compiles Sass to CSS
//           'sass-loader',
//         ],
//       },
//       {
//         test: /\.html$/i,
//         loader: 'html-loader'
//       },
//       {
//         test: /\.(svg|png|jpe?g|gif)$/i,
//         type: 'asset/resource',
//         generator: {
//           filename: 'imgs/[name][hash][ext]'
//         },
//       }
//     ],
//   },
// };
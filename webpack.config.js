var path = require('path');
var webpack = require('webpack');

module.exports = {
    mode: 'development',
    context: __dirname,
    devtool: '#inline-source-map',
    entry: [
        './src/index.js',
    ],
    output: {
        path: path.resolve(__dirname, '.'),
        filename: 'webpgfn.js',
    },
    target: 'node',
    plugins: [
        new webpack.IgnorePlugin(/^pg-native$/),
        new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
    ]
}
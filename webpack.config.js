var webpack = require('webpack');
var path = require('path');

module.exports = {
    // context: __dirname,

    entry: "app.js",
    // entry: {
    //     //'geometry': 'lib/geometry.js',
    //     // 'pdf.js': 'node_modules/pdfjs-dist/build/pdf.js'
    // },
    output: {
        // path: path.join(__dirname, 'build/webpack'),
        // publicPath: 'build/webpack/',
        filename: 'bundle.js'
    },
    // plugins: [
    //     new webpack.optimize.UglifyJsPlugin({
    //                                             compressor: {
    //                                                 screw_ie8: true,
    //                                                 warnings: false
    //                                             }
    //                                         })
    // ]
};
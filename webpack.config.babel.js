import path from 'path';

export default {
    entry: path.join(__dirname, 'index.js'),
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'backbone-relation.js',
        library: 'backbone-relation',
        libraryTarget: 'umd',
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader?blacklist[]=strict',
            },
        ],
    },

    externals: {
        backbone: {
            root: 'Backbone',
            commonjs: 'backbone',
            commonjs2: 'backbone',
            amd: 'backbone',
        },
        underscore: {
            root: '_',
            commonjs: 'underscore',
            commonjs2: 'underscore',
            amd: 'underscore',
        },
    },
};

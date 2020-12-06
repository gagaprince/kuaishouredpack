const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    devtool: 'cheap-source-map',
    // entry: './src/index.ts',
    entry: {
        index: './src/index.ts',
        test: './src/tests/index.ts'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['babel-loader', 'ts-loader'],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@constant': path.resolve(__dirname, './src/constant/'),
            '@utils': path.resolve(__dirname, './src/utils/'), //src文件夹路径
            '@modules': path.resolve(__dirname, './src/modules/'),
            '@faces': path.resolve(__dirname, './src/faces/'),
        },
    },
    plugins: [new CleanWebpackPlugin()],
};

const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const copyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const examplesDir = path.resolve(__dirname, '../examples')
const DEFAULT_TEMPLATE_FILE_PATH = path.resolve(__dirname, '../common/default-examples.html');
const entries = [];

const libraryModulePath = path.resolve('node_modules/@foxitsoftware/foxit-pdf-sdk-for-web-library');

fs.readdirSync(examplesDir).forEach(exampleName => {
    const entryName = 'examples/' + exampleName + '/index';
    const chunks = [
        'lib/UIExtension.full',
        entryName
    ];
    const infoPath = path.resolve(examplesDir, exampleName, 'info.json');
    let info = {};
    if(fs.existsSync(infoPath)) {
        info = JSON.parse(
            fs.readFileSync(infoPath, {
                encoding: 'utf-8'
            }).toString('utf-8')
        );
    } else {
        info = {
            name: exampleName.replace(/^\d+\-/, ''),
            description: ''
        };
    }
    info.path = "/examples/" + exampleName + '/index.html';
    info.baseName = exampleName;
    let templatePath = path.resolve(examplesDir, exampleName, 'index.html');
    if(!fs.existsSync(templatePath)) {
        templatePath = DEFAULT_TEMPLATE_FILE_PATH;
    }
    entries.push({
        dir: 'examples/' + exampleName,
        entryName,
        js: path.resolve(examplesDir, exampleName, 'index.js'),
        htmlchunks: chunks,
        template: templatePath,
        info
    });
});

const exampleInfosArray = entries.map(it => it.info);

const distPath = path.resolve(__dirname, '../dist');
const libPath = path.resolve(libraryModulePath, 'lib');

module.exports = function(env, argv) {
    const mode = argv.mode;
    return {
        mode: mode,
        entry: entries.reduce((entries, entry) => {
            entries[entry.entryName] = entry.js;
            return entries;
        }, {
            'lib/UIExtension.full': path.resolve(libraryModulePath, 'lib', 'UIExtension.full.js'),
            'lib/PDFViewCtrl.full': path.resolve(libraryModulePath, 'lib', 'PDFViewCtrl.full.js'),
            'catalog': path.resolve(__dirname, '../src/index.tsx')
        }),
        devtool: mode === 'development' ? 'inline-source-map': false,
        devServer: mode === 'development' ? require('./webpack-dev-server.config') : undefined,
        watch: mode === 'development',
        watchOptions : {
            ignored: /node_modules/
        },
        module: {
            rules: [{
                test: /\.ts(x)?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/env', {
                                useBuiltIns: "usage",
                                targets: ">0.25%,not dead",
                                corejs: '3'
                            }],
                            ['@babel/react'],
                            ['@babel/typescript', {
                                isTSX: true,
                                allExtensions: true
                            }]
                        ],
                        plugins: [
                            '@babel/plugin-transform-runtime'
                        ]
                    }
                }
            },{
                test: /\.(js|es)$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }, {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            }, {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader, 'css-loader', {
                        loader: 'less-loader',
                        options: {
                            lessOptions: {
                                javascriptEnabled: true
                            }
                        }
                    }
                ]
            }]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, '../src/index.html'),
                filename: 'index.html',
                chunks: [ 'catalog' ]
            }),
            new webpack.DefinePlugin({
                'process.env.EXAMPLES': JSON.stringify(exampleInfosArray)
            })
        ].concat(
            entries.map((entry) => {
                return new HtmlWebpackPlugin({
                    template: entry.template,
                    filename: path.resolve(distPath, entry.dir, 'index.html'),
                    chunks: entry.htmlchunks.concat([entry.entryName]),
                    info: entry.info
                });
            })
        ).concat([
            new copyWebpackPlugin({
                patterns:[{
                    from: path.resolve(__dirname, '../assets'),
                    to: path.resolve(distPath, 'assets'),
                    force: true
                }].concat(mode === 'development' ? [{
                    from: libPath,
                    to: path.resolve(distPath, 'lib'),
                    force: true
                }] : [])
            }),
            new MiniCssExtractPlugin({
                filename: '[name].css'
            })
        ]).concat(
            mode === 'development'? [
                new webpack.HotModuleReplacementPlugin()
            ] : []
        ),
        externals: ['UIExtension', 'PDFViewCtrl'],
        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
        },
        output: {
            filename: '[name].js',
            path: distPath,
            globalObject: 'window'
        }
    }
};
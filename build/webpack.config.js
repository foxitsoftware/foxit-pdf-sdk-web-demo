const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const copyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const examplesDir = path.resolve(__dirname, '../examples');
const DEFAULT_TEMPLATE_FILE_PATH = path.resolve(__dirname, '../common/default-examples.html');
const entries = [];

const libraryModulePath = path.resolve('node_modules/@foxitsoftware/foxit-pdf-sdk-for-web-library-full');

fs.readdirSync(examplesDir).forEach((exampleName) => {
    const entryName = 'examples/' + exampleName + '/index';
    const chunks = [entryName];
    const infoPath = path.resolve(examplesDir, exampleName, 'info.json');
    let info = {};
    if (fs.existsSync(infoPath)) {
        info = JSON.parse(
            fs
                .readFileSync(infoPath, {
                    encoding: 'utf-8',
                })
                .toString('utf-8')
        );
    } else {
        info = {
            name: exampleName.replace(/^\d+\-/, ''),
            description: '',
        };
    }
    info.path = '/examples/' + exampleName + '/index.html';
    info.baseName = exampleName;
    let templatePath = path.resolve(examplesDir, exampleName, 'index.html');
    if (!fs.existsSync(templatePath)) {
        templatePath = DEFAULT_TEMPLATE_FILE_PATH;
    }
    entries.push({
        dir: 'examples/' + exampleName,
        entryName,
        js: path.resolve(examplesDir, exampleName, 'index.js'),
        htmlchunks: chunks,
        template: templatePath,
        info,
    });
});

const exampleInfosArray = entries.map((it) => it.info);

const distPath = path.resolve(__dirname, '../dist');
const libPath = path.resolve(libraryModulePath, 'lib');

module.exports = function (env, argv) {
    const mode = argv.mode;
    const isDev = mode === 'development';
    return [
        createWebpackConfig(
            entries.reduce((entries, entry) => {
                entries[entry.entryName] = 
                entry.js;
                isDev ? [
                    'webpack-dev-server/client',
                    entry.js
                ] : entry.js;
                return entries;
            }, {}),
            entries.map((entry) => {
                return new HtmlWebpackPlugin({
                    template: entry.template,
                    filename: path.resolve(distPath, entry.dir, 'index.html'),
                    chunks: entry.htmlchunks,
                    info: entry.info,
                    licensePath: isDev? 'https://cdn-sdk.foxitsoftware.com/pdf-sdk/download/foxit-pdf-sdk-for-web/pcmobile/8.x/8.0/license-key.js' : 'https://cdn-sdk.foxitsoftware.com/pdf-sdk/download/foxit-pdf-sdk-for-web/license-key.js',
                    UIExtensionLib: '/lib/UIExtension.full.js',
                    PDFViewCtrlLib: '/lib/PDFViewCtrl.full.js'
                });
            }),
            {
                filename: '[name].js',
                path: distPath,
                library: '__example__',
                libraryTarget: 'window',
                globalObject: 'window',
            },
            env,
            argv
        ),
        createWebpackConfig(
            {
                catalog: 
                (isDev ? [
                    'webpack-dev-server/client',
                ] : []).concat(
                    path.resolve(__dirname, '../src/index.tsx'),
                )
            },
            [
                new HtmlWebpackPlugin({
                    template: path.resolve(__dirname, '../src/index.html'),
                    filename: 'index.html',
                    chunks: ['catalog'],
                }),
                new webpack.DefinePlugin({
                    'process.env.EXAMPLES': JSON.stringify(exampleInfosArray),
                }),
                new copyWebpackPlugin({
                    patterns: [
                        {
                            from: path.resolve(__dirname, '../assets'),
                            to: path.resolve(distPath, 'assets'),
                            force: true,
                        }
                    ].concat(
                        isDev
                            ? [
                                  {
                                      from: libPath,
                                      to: path.resolve(distPath, 'lib'),
                                      force: true,
                                  },
                              ]
                            : []
                    ),
                }),
            ],
            {
                filename: '[name].js',
                path: distPath,
                globalObject: 'window',
            },
            env,
            argv,
            mode === 'development' ? require('./webpack-dev-server.config') : undefined,
        ),
    ];
};

function createWebpackConfig(entry, morePlugins, output, env, argv, devServer) {
    const mode = argv.mode;
    return {
        mode: mode,
        entry: entry,
        devtool: mode === 'development' ? 'inline-source-map' : false,
        devServer,
        watch: mode === 'development',
        watchOptions: {
            ignored: /node_modules/,
        },
        module: {
            rules: [
                {
                    test: /\.ts(x)?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                [
                                    '@babel/env',
                                    {
                                        useBuiltIns: 'usage',
                                        targets: '>0.25%,not dead',
                                        corejs: '3',
                                    },
                                ],
                                ['@babel/react'],
                                [
                                    '@babel/typescript',
                                    {
                                        isTSX: true,
                                        allExtensions: true,
                                    },
                                ],
                            ],
                            plugins: ['@babel/plugin-transform-runtime'],
                        },
                    },
                },
                {
                    test: /\.(js|es)$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader'],
                },
                {
                    test: /\.less$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        {
                            loader: 'less-loader',
                            options: {
                                lessOptions: {
                                    javascriptEnabled: true,
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.art$/,
                    use: [
                        {
                            loader: path.join(__dirname, './helper/fix-template-loader.js'),
                        },
                        {
                            loader: 'art-template-loader',
                            options: {
                                escape: false
                            },
                        }
                    ]
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 8192
                            }
                        }
                    ],
                }
            ],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].css',
            }),
        ]
            .concat(morePlugins)
            .concat(mode === 'development' ? [new webpack.HotModuleReplacementPlugin()] : [])
            ,
        externals: ['UIExtension', 'PDFViewCtrl'],
        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
            alias: {
                'assets': path.resolve(__dirname, '../assets'),
            },
        },
        output: output,
    };
}

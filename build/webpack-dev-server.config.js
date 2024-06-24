const path = require('path');
const pkg = require('../package.json');
module.exports = {
    contentBase: path.resolve(__dirname, '../dist'),
    public: '0.0.0.0:' + pkg.serve.port || '0',
    allowedHosts: [
        '0.0.0.0'
    ],
    host:'0.0.0.0',
    port: pkg.serve.port,
    // https://github.com/webpack/webpack-dev-server/issues/2484 
    hot: false,
    injectClient: false,
    //
    inline: true,
    disableHostCheck: true,
    clientLogLevel: 'error',
    historyApiFallback: true,
    proxy: pkg.serve.proxy,
    watchOptions: {
        ignored: /node_modules/
    },
    headers: {
        'Service-Worker-Allowed': '/'
    }
}
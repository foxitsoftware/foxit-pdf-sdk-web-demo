const path = require('path');
const pkg = require('../package.json');
module.exports = {
    contentBase: path.resolve(__dirname, '../dist'),
    public: '0.0.0.0:' + pkg.serve.port || '0',
    allowedHosts: [
        '0.0.0.0'
    ],
    port: pkg.serve.port,
    hot: true,
    inline: true,
    disableHostCheck: true,
    clientLogLevel: 'error',
    historyApiFallback: true,
    proxy: pkg.serve.proxy
}
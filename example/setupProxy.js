// example setupProxy.js
// ex: http://localhost:3001/raw/readme.md

const proxy = require('http-proxy-middleware')

// for config, see https://github.com/chimurai/http-proxy-middleware
module.exports = function(app) {
    app.use(proxy('/raw/*', {
        target: 'https://raw.githubusercontent.com/kodema5/webpgfn/master/',
        changeOrigin: true,
        pathRewrite: {
            '^/raw' : '/'
        }
    }))
}
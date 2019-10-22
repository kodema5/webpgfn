// example setupProxy.js
// ex: http://localhost:3001/raw/readme.md

const proxy = require('http-proxy-middleware')
const fetch = require('node-fetch')

// for config, see https://github.com/chimurai/http-proxy-middleware
module.exports = function(app, protocols) {
    app.use(proxy('/raw/*', {
        target: 'https://raw.githubusercontent.com/kodema5/webpgfn/master/',
        changeOrigin: true,
        pathRewrite: {
            '^/raw' : '/'
        }
    }))


    protocols.use({
        'http': async ({url, opt}, ctx) => {
            return await fetch(url.href, opt).then(r => r.text())
        }
    })
}
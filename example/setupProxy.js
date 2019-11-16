// example setupProxy.js
// ex: http://localhost:3001/raw/readme.md

const proxy = require('http-proxy-middleware')
const fileUpload = require('express-fileupload')
const fetch = require('node-fetch')

// for config, see https://github.com/chimurai/http-proxy-middleware
module.exports = function({app, protocols, pgFn}) {

    app.use(proxy('/raw/*', {
        target: 'https://raw.githubusercontent.com/kodema5/webpgfn/master/',
        changeOrigin: true,
        pathRewrite: {
            '^/raw' : '/'
        }
    }))

    app.use(fileUpload({
        limits: {fileSize: 5 * 1024 * 1024},
        safeFileNames: true,
        preserveExtension: true,
        useTempFiles: true,
        tempFileDir: './tmp/'
    }))

    app.post('/upload', async (req, res) => {
       if (!req.files || Object.keys(req.files).length===0) {
            return res.status(400).send('No file')
        }

        let a = await pgFn('foo.bar', req, res)
        // console.log('-----from pg', a.data)

        let ps = Object.values(req.files).map(f => {
            return new Promise((ok, err) => {
                f.mv('./uploads/' + f.name, (e) => {
                    return e ? err(e) : ok(f.name)
                })
            })
        })

        let fs = await Promise.all(ps)
        res.json({data:fs})
    })

    protocols.use({
        'http': async ({url, opt}, arg, ctx) => {
            return await fetch(url.href, opt).then(r => r.text())
        }
    })
}
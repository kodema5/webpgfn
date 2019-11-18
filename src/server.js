const process_pg = require('./process_pg')
const Protocols = require('./protocols')

const protocols = new Protocols()

function server (Args) {
    protocols.use({
        pg:process_pg(Args)
    })

    const express = require('express')
    const app = express()
    app.use(express.json())
    app.use(express.urlencoded({extended:true}))
    app.use(express.static(Args.static || '.'))

    const fn = async (req, res) => {
        try {
            res.json(await pgFn(req.params.fn, req, res))
        } catch(e) {
            console.error(e)
            res.json({error:e.toString()})
        }
    }
    app.post(`${Args.api}/:fn`, fn)
    app.get(`${Args.api}/:fn`, fn)

    if (Args.proxy) {
        const setupProxy = resolvePath(Args.proxy)
        if (setupProxy) {
            // __non_webpack_require__(setupProxy)(app)
            require(setupProxy)({app, protocols, pgFn} )
        }
    }

    const sslKey = resolvePath(Args.sslKey)
    const sslCert = resolvePath(Args.sslCert)
    if (sslKey && sslCert && Args.sslPwd) {
        console.log(`[WEBPGFN] https on port ${Args.listen}`)

        const https = require('https')
        https.createServer({
            key: fs.readFileSync(sslKey),
            cert: fs.readFileSync(sslCert),
            passphrase: Args.sslPwd
        }, app)
        .listen(Args.listen)
    }
    else {
        app.listen(Args.listen,
            () => console.log(`[WEBPGFN] http on port ${Args.listen}`))
    }
}

const path = require('path')
const fs = require('fs')
const getPath = p => path.resolve(fs.realpathSync(process.cwd()), p)
const resolvePath = (p) => {
    const n = getPath(p)
    return fs.existsSync(n) && n
}


module.exports = server

const pgFn = async (fn, req, res) => {
    var jobs = [{ url:new URL(`pg://${fn}`) }]
    let arg = {...req.query, ...req.body, headers:req.headers}
    let ctx = {req, res}

    var out
    while (jobs.length>0) {
        try {
            out = await protocols.iter(jobs, arg, ctx)
            jobs.length = 0
        }
        catch(e) {
            let s = e.toString()
            let c = 'error: callback:'
            let f = s.indexOf(c)===0
            if (!f) throw e

            let a = s.slice(c.length).trim()
            jobs = JSON.parse(a)
        }
    }
    return out
}


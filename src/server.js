const process_pg = require('./process_pg')
const Protocols = require('./protocols')

const protocols = new Protocols()

function server (Args) {
    protocols.use({
        pg:process_pg(Args)
    })

    const process_req = async (url, ctx) => {
        var jobs = [{ url:new URL(url) }]

        let res
        while (jobs.length>0) {
            try {
                res = await protocols.iter(jobs, ctx)
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
        return res
    }

    const express = require('express')
    const app = express()
    app.use(express.json())
    app.use(express.urlencoded({extended:true}))
    app.use(express.static(Args.static || '.'))

    app.post(`${Args.api}/:fn`, async (req,res) => {
        try {
            let u = `pg://${req.params.fn}`
            let p = {...req.body, headers:req.headers}
            let a = await process_req(u, p)
            res.json(a)
        } catch(e) {
            res.json({error:e.toString()})
        }
    })
    app.get(`${Args.api}/:fn`, async (req,res) => {
        try {
            let u = `pg://${req.params.fn}`
            let p = {...req.query, headers:req.headers}
            let a = await process_req(u, p)
            res.json(a)
        } catch(e) {
            res.json({error:e.toString()})
        }
    })

    if (Args.proxy) {
        const path = require('path')
        const fs = require('fs')
        const getPath = p => path.resolve(fs.realpathSync(process.cwd()), p)
        const setupProxy = getPath(Args.proxy)
        let f = fs.existsSync(setupProxy)
        if (f) {
            // __non_webpack_require__(setupProxy)(app)
            require(setupProxy)(app, protocols)
        }
    }

    app.listen(Args.listen, () => console.log(`[WEBPGFN] listening on port ${Args.listen}`))
}

module.exports = server
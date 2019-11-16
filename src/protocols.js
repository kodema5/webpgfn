// to process a sequence of jobs over arg
// where
//   jobs = [{job}, [par_jobs], {job},...]
//   arg is passed from one job to another in sequence
//   ctx is for static context
//   job = {url:URL, ...}
//   url.protocol indicates handlers
//   par_jobs = {a:{job}, b:..., ...} executes in parallel returns {a:..,b:..,...}

class Protocols {
    constructor(args) {
        this.protocols_ = {}
        this.use(args)
    }

    use(args) {
        Object.assign(this.protocols_, args)
    }

    // process a job = {url:URL, ...} for a arg
    // ex: { url:new URL('protocol://host/pathname?search'), ...}
    // accepts "protocol" -> { url:new URL("protocols")}
    //
    async exec (job, arg=null, ctx={}) {
        job = typeof job === 'string' ? { url: job } : job
        if (!job.url) throw 'Error: job requires a url field'

        let u = job.url
        job.url = typeof u === 'string'
            ? new URL(u.indexOf(':')<0 ? u+':' : u)
            : u

        let n = job.url.protocol
        let f = this.protocols_[n] || this.protocols_[n.slice(0,-1)]
        if (!f) throw `Error: unknown protocol ${n}`

        return await f(job, arg, ctx)
    }

    // process a sequence of jobs [{job},{job},...] over arg
    // volatile arg is passed from one job to another
    //
    async iter (jobs=[], arg=null, ctx={}) {
        if (!Array.isArray(jobs)) throw 'Error: invalid jobs'

        for (let i=0, n=jobs.length; i<n; i++) {
            let job = jobs[i]

            let isPar = Array.isArray(job)
            if (isPar) {
                let a = job[0]
                if (typeof a !== 'object') throw 'Error: invalid job'
                arg = await this.par(a, arg, ctx)
                continue
            }

            arg = await this.exec(job, arg, ctx)
        }

        return arg
    }

    // process jobs {id:{job},...} in parallel passing arg to each
    // returns an object {id:job-result, ....}
    //
    async par (jobs={}, arg=null, ctx={}) {
        let ks = Object.keys(jobs)
        let ps = ks.map( (k) => {
            let job = jobs[k]
            return this.exec(job, arg, ctx)
        })

        let rs = await Promise.all(ps)
        return rs.reduce( (x,r,i) => {
            let k = ks[i]
            x[k] = r
            return x
        }, {})
    }

}

module.exports = Protocols

// // example:
// const fetch = require('node-fetch')
// const protocols = new Protocols({
//     'http': async function({url, opt}, arg) {
//         return await fetch(url.href, opt).then(r => r.text())
//     },
//     'log': (_, arg) => console.log('-----', arg) || arg,
//     'lcase': (_, arg) => arg.toLowerCase().slice(0,200)
// })

// var req = [
//     'http://www.google.com',
//     'log',
//     [{
//         aaa: 'lcase'
//     }]
// ]

// // then
// {(async () => {
//     let a = await protocols.iter(req)
//     console.log('---->>', a)
// })()}

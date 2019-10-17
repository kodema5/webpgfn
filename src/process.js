// to process a sequence of jobs over ctx
// where
//   jobs = [{job}, [par_jobs], {job},...]
//   ctx are passed from one job to another in sequence
//   job = {url:URL, ...}
//   url.protocol indicates handlers
//   par_jobs = {a:{job}, b:..., ...} executes in parallel returns {a:..,b:..,...}

// supposed
// const fetch = require('node-fetch')
// const protocols = {
//     'http': async function({url, opt}, ctx) {
//         return await fetch(url.href, opt).then(r => r.text())
//     },
//     'log': (_, ctx) => console.log('-----', ctx) || ctx,
//     'lcase': (_, ctx) => ctx.toLowerCase()
// }

// var req = [
//     'http://www.google.com',
//     'log',
//     [{
//         aaa: 'lcase'
//     }]
// ]

// then
// {(async () => {
//     let a = await process_seq(req)
//     console.log('---->>', a)
// })()}


// collections of protocols
// each entry is an async function (job, ctx)
//
const protocols = {}

const process_set = (args) => {
    // future: audit
    Object.assign(protocols, args)
}


// process a job = {url:URL, } for a ctx
// ex: { url:new URL('protocol://host/pathname?search'), ...}
// accepts "protocol" -> { url:new URL("protocols")}
//
const process_job = async (job, ctx=null) => {
    job = typeof job === 'string' ? { url: job } : job
    if (!job.url) throw 'Error: job requires a url field'

    let u = job.url
    job.url = typeof u === 'string'
        ? new URL(u.indexOf(':')<0 ? u+':' : u)
        : u

    let n = job.url.protocol
    let f = protocols[n] || protocols[n.slice(0,-1)]
    if (!f) throw `Error: unknown handlers ${n}`

    return await f(job, ctx)
}

// process a sequence of jobs [{job},{job},...] over ctx
// ctx are passed from one job to another
//
const process_seq = async (jobs=[], ctx=null) => {
    if (!Array.isArray(jobs)) throw 'Error: invalid jobs'

    for (let i=0, n=jobs.length; i<n; i++) {
        let job = jobs[i]

        let isPar = Array.isArray(job)
        if (isPar) {
            let a = job[0]
            if (typeof a !== 'object') throw 'Error: invalid job'
            ctx = await process_par(a, ctx)
            continue
        }

        ctx = await process_job(job, ctx)
    }

    return ctx
}

// process jobs {id:{job},...} in parallel passing ctx to each
// returns an object {id:job-result, ....}
//
const process_par = async (jobs={}, ctx=null) => {
    let ks = Object.keys(jobs)
    let ps = ks.map( (k) => {
        let job = jobs[k]
        return process_job(job, ctx)
    })

    let rs = await Promise.all(ps)
    return rs.reduce( (x,r,i) => {
        let k = ks[i]
        x[k] = r
        return x
    }, {})
}

module.exports = { protocols, process_set, process_job, process_seq, process_par }
import Args from './args'
import process_pg from './process_pg'
import {process_set, process_seq} from './process'

process_set({
    pg:process_pg(Args)
})

const process = async (url, ctx) => {
    var jobs = [{ url:new URL(url) }]

    let res
    while (jobs.length>0) {
        try {
            res = await process_seq(jobs, ctx)
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
app.use(express.static('.'))

app.post('/:fn', async (req,res) => {
    try {
        let u = `pg://${req.params.fn}`
        let a = await process(u, req.body)
        res.json(a)
    } catch(e) {
        res.json({error:e.toString()})
    }
})
app.get('/:fn', async (req,res) => {
    try {
        let u = `pg://${req.params.fn}`
        let a = await process(u, req.query)
        res.json(a)
    } catch(e) {
        res.json({error:e.toString()})
    }
})
app.listen(Args.listen, () => console.log(`webpgfn listening on port ${Args.listen}`))
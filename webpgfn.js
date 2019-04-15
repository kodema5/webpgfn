#!/usr/bin/env node
const Args = require('commander')
Args
    .version('0.0.1', '-v, --version')
    .option('-h, --host [host]', 'pg host', 'localhost')
    .option('-u, --user [usr]', 'pg user', 'postgres')
    .option('-P, --password [pwd]', 'pg password', 'rei')
    .option('-d, --database [db]', 'pg database', 'postgres')
    .option('-p, --port [port]', 'pg port', 5432)
    .option('-l, --listen [port]', 'server port', 3000)
    .parse(process.argv)

const {Pool, Client} = require('pg')
const pool = new Pool({
    user: Args.user,
    host: Args.host,
    database: Args.database,
    password: Args.password,
    port: Args.port
})

const Http = require('http')
const http = Http.createServer((req, res) => {
    const { headers, method, url} = req
    const func = url.split('/').filter(Boolean)[0]
    if (!func) {
        res.statusCode = 404
        res.end('unknown command')
        return
    }

    let parm = []
    req
        .on('data', (c) => {
            parm.push(c)
        })
        .on('end', () => {
            parm = Buffer.concat(parm).toString()

            const sql = `select ${func}(${
                parm
                ? "'" + JSON.stringify(parm) + "'::jsonb"
                : ''
            }) as data;`

            pool.query(sql, (e, q) => {

                res.statusCode = 200
                res.setHeader('X-Powered-By', 'webpgfn')
                res.setHeader('Content-Type', 'application/json')

                let a = e
                    ? {error: e.toString()}
                    : (q.rows[0] || {})
                res.write(JSON.stringify(a))
                res.end()
            })

        })
})


http.listen(Args.listen, (err) => {
    console.log(err ? `error ${err}` : `listening on ${Args.listen}`)
})


/*
sql:

    > drop schema if exists foo cascade;
    > create schema foo;
    > create function foo.bar(a jsonb) returns jsonb as $$
    > begin
    >   return a;
    > end;
    > $$ language plpgsql;
    > select foo.bar('{"a":123}'::jsonb) as data;

js:
    (async() => {
        let res = await fetch('/foo.bar', {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({a: 1, b: 'Textual content'})
        })

        console.log('---', await res.json())

    })();
*/
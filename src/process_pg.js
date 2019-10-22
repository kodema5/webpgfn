const {Pool} = require('pg')

const process_pg = (Args) => {

    let uri = Args.pg || 'postgresql://postgres:rei@localhost:5432/postgres'
    let url = new URL(uri)
    let user = process.env.PGUSER || url.username || 'postgres'
    let password = process.env.PGPASSWORD || url.password || 'rei'
    let host = process.env.PGHOST || url.hostname || 'localhost'
    let database = process.env.PGDATABASE || (url.pathname && url.pathname.replace('/','')) || 'postgres'
    let port = process.env.PGPORT || url.port || '5432'

    let pool = new Pool({
        user,
        host,
        database,
        password,
        port
    })

    return async ({
        url,
        ctx={} // extra ctx
    }, req={}) => {

        let fn = url.hostname
        if (!fn) throw 'Error: function required'

        const arg = Object.assign({}, req, ctx)

        const sql = `select ${fn}(${
            arg
            ? "'" + JSON.stringify(arg) + "'::jsonb"
            : ''
        }) as data;`

        console.log('[WEBPGFN-PG]', `select ${fn}(...);`)

        let client = await pool.connect()
        client.on('notice', (msg) => {
            console.log(`[WEBPGFN-PG ${fn}]`, msg.toString(), '\n')
        })
        let rs = await client.query(sql)
        client.release()

        return rs.rows[0]
    }
}

module.exports = process_pg

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
        ctx:_ctx={} // extra ctx
    }, ctx) => {

        let fn = url.hostname
        if (!fn) throw 'Error: function required'

        const arg = Object.assign({}, ctx, _ctx)

        const sql = `select ${fn}(${
            ctx
            ? "'" + JSON.stringify(arg) + "'::jsonb"
            : ''
        }) as data;`

        let rs = await pool.query(sql)
        return rs.rows[0]
    }
}

export default process_pg

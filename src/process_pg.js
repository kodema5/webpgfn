const {Pool} = require('pg')

const process_pg = (Args) => {
    let pool = new Pool({
        user: Args.user,
        host: Args.host,
        database: Args.database,
        password: Args.password,
        port: Args.port
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
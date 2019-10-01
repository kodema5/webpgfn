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

export default Args
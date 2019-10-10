const Args = require('commander')
Args
    .version('0.0.1', '-v, --version')
    .option('-a, --api [api]', 'web-api path', '/api')
    .option('-s, --static [static]', 'static folder', './build')
    .option('-l, --listen [port]', 'server port', 3001)
    .option('-p, --pg [pg]', 'pg connection-string', 'postgresql://postgres:rei@localhost:5432/postgres')
    .option('-x, --proxy [proxy]', 'setup proxy', 'setupProxy.js')
    .parse(process.argv)

export default Args
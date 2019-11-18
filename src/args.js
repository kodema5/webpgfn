const Args = require('commander')
Args
    .version('0.0.9', '-v, --version')
    .option('-a, --api [api]', 'web-api path', '/api')
    .option('-s, --static [static]', 'static folder', './build')
    .option('-l, --listen [port]', 'server port', 3001)
    .option('-p, --pg [pg]', 'pg connection-string', 'postgresql://postgres:rei@localhost:5432/postgres')

    .option('-x, --proxy [proxy]', 'setup http proxy ex: "setupProxy.js"')
    .option('-w, --watch <nodemon>', 'watch with nodemon ex: "-e sql --exec psql -U postgres -d postgres -f index.sql"')

    .option('--ssl-key [key]', 'ssl key file.', 'key.pem')
    .option('--ssl-cert [cert]', 'ssl certificate file.', 'cert.pem')
    .option('--ssl-pwd [pwd]', 'ssl password. ex: secret')

    .parse(process.argv)

module.exports = Args
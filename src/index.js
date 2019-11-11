#!/usr/bin/env node

const Args = require('./args')
const server = require('./server')

if (Args.watch) {
    let args = Args.watch
    console.log('[NODEMON]', args)

    const nodemon = require('nodemon')
    nodemon(args)
    .on('start', () => {
        console.log('\n')
    })
    .on('restart', (files) => {
        console.log('[NODEMON] restarted.', files)
    })
}

server(Args)


const debug = require('debug')('linto:skill:v2:core:linto-model-dataset:lexical-seeding')

const linsttParser = require('./linstt/worker_threads')
const tockParser = require('./tock/worker_threads')

module.exports = {
  linstt: linsttParser,
  tock: tockParser
}

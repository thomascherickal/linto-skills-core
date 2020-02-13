const debug = require('debug')('linto:skill:v2:core:linto-model-dataset:lexical-seeding')

const linsttParser = require('./linstt')
const tockParser = require('./tock')

module.exports = {
  linstt: linsttParser,
  tock: tockParser
}

const debug = require('debug')('linto:skill:v2:core:linto-config:transcribe-config')

module.exports = function (RED) {
  function LintoConfigTranscribe(n) {
    RED.nodes.createNode(this, n)
    this.host = n.host
    this.api = n.api
    this.config = {
      host: n.host,
      service: n.service,
      api: n.api,
    }
  }
  RED.nodes.registerType("linto-config-transcribe", LintoConfigTranscribe)
}
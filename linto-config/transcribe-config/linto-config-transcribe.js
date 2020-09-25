const debug = require('debug')('linto:skill:v2:core:linto-config:transcribe-config')

module.exports = function (RED) {
  function LintoConfigTranscribe(n) {
    RED.nodes.createNode(this, n)
    this.host = n.host
    this.api = n.api
    this.config = {
      host: process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE,
      api: n.api,
      commandOffline: n.commandOffline,
      largeVocabStreaming: n.largeVocabStreaming,
      largeVocabOffline : n.largeVocabOffline
    }
  }
  RED.nodes.registerType("linto-config-transcribe", LintoConfigTranscribe)
}
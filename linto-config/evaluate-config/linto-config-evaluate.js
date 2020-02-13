const debug = require('debug')('linto:skill:v2:core:linto-config:evaluate-config')

module.exports = function (RED) {
  function LintoConfigEvaluate(n) {
    RED.nodes.createNode(this, n)
    this.host = n.host
    this.api = n.api

    this.config = {
      host: n.host,
      api: n.api,
    }

    if (n.api === 'tock') {
      this.config.applicationName = n.appname
      this.config.namespace = n.namespace
    }
  }
  RED.nodes.registerType("linto-config-evaluate", LintoConfigEvaluate)
}
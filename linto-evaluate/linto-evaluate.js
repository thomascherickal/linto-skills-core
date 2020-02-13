const debug = require('debug')('linto:skill:v2:core:linto-evaluate')
const LintoCoreNode = require('@linto-ai/linto-components').nodes.lintoCoreNode
const { request } = require('@linto-ai/linto-components').components

module.exports = function (RED) {
  function Node(config) {
    RED.nodes.createNode(this, config)
    new LintoEvaluate(RED, this, config)
  }
  RED.nodes.registerType('linto-evaluate', Node)
}

class LintoEvaluate extends LintoCoreNode {
  constructor(RED, node, config) {
    super(node, config)

    this.config = {
      ...config,
      evaluate: { ...this.getFlowConfig('configEvaluate') }
    }

    this.request = request
    this.init()
  }

  async init() {
    let evaluate = await this.loadModule(`${__dirname}/api/${this.config.evaluate.api}`)
    this.wireNode.onMessageSend(this, evaluate)
  }
}
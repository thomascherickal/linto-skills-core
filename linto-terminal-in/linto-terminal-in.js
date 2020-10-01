const debug = require('debug')('linto:skill:v2:core:linto-terminal-in')
const LintoConnectCoreNode = require('@linto-ai/linto-components').nodes.lintoConnectCoreNode
const { mqtt } = require('@linto-ai/linto-components').connect

const TOPIC_SUBSCRIBE = '#'
const TOPIC_FILTER = ['nlp', 'lvcsrstreaming', 'action']

module.exports = function (RED) {
  function Node(config) {
    RED.nodes.createNode(this, config)
    new LintoTerminalIn(RED, this, config)
  }
  RED.nodes.registerType('linto-terminal-in', Node)
}

class LintoTerminalIn extends LintoConnectCoreNode {
  constructor(RED, node, config) {
    super(node, config)

    this.init()
  }

  async init() {
    let mqttConfig = this.getFlowConfig('confMqtt')
    if (mqttConfig && this.config.sn) {
      await this.mqtt.connect(mqttConfig)
      this.mqtt.subscribeToLinto(mqttConfig.fromLinto, this.config.sn, TOPIC_SUBSCRIBE)
      this.mqtt.onMessage(mqttHandler.bind(this), TOPIC_FILTER)
      this.cleanStatus()

      await this.configure()
    } else this.sendStatus('yellow', 'ring', 'Configuration is missing')
  }
}

function mqttHandler(topic, payload) {
  let jsonParsePayload = JSON.parse(payload)

  let msg = {
    payload: {
      topic,
      audio: jsonParsePayload.audio,
      conversationData: jsonParsePayload.conversationData
    }
  }

  this.wireNode.nodeSend(this.node, msg)
}

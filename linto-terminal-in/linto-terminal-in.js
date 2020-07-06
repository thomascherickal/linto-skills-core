const debug = require('debug')('linto:skill:v2:core:linto-terminal-in')
const LintoCoreNode = require('@linto-ai/linto-components').nodes.lintoCoreNode
const { mqtt } = require('@linto-ai/linto-components').connect

const TOPIC_SUBSCRIBE = '#'
const TOPIC_FILTER = 'nlp'

module.exports = function (RED) {
  function Node(config) {
    RED.nodes.createNode(this, config)
    new LintoTerminalIn(RED, this, config)
  }
  RED.nodes.registerType('linto-terminal-in', Node)
}

class LintoTerminalIn extends LintoCoreNode {
  constructor(RED, node, config) {
    super(node, config)
    this.mqtt = new mqtt(this)

    this.init()
  }

  async init() {
    let mqttConfig = this.getFlowConfig('confMqtt')
    if (mqttConfig && this.config.sn) {
      await this.mqtt.connect(mqttConfig)
      this.mqtt.subscribeToLinto(mqttConfig.fromLinto, this.config.sn, TOPIC_SUBSCRIBE)
      this.mqtt.onMessage(mqttHandler.bind(this), TOPIC_FILTER)
      this.cleanStatus()
    } else {
      this.sendStatus('yellow', 'ring', 'Configuration is missing')
    }
  }
}

function mqttHandler(topic, payload) {
  let data = topic.split('/')
  let outTopic = data[0] + '/tolinto/' + data[2] + '/nlp/file/' + data[5]

  let jsonParsePayload = JSON.parse(payload)

  let msg = {
    topic: outTopic,
    payload: {
      audio: jsonParsePayload.audio,
      conversationData: jsonParsePayload.conversationData
    }
  }

  this.wireNode.nodeSend(this.node, msg)
}

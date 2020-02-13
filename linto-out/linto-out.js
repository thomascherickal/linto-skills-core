const debug = require('debug')('linto:skill:v2:core:linto-out')
const LintoCoreNode = require('@linto-ai/linto-components').nodes.lintoCoreNode
const { wireEvent } = require('@linto-ai/linto-components').components
const { mqtt } = require('@linto-ai/linto-components').connect

const NODE_SUCCES_MESSAGE = 'Connected'

module.exports = function (RED) {
  function Node(config) {
    RED.nodes.createNode(this, config)
    new LintoTerminalOut(RED, this, config)
  }
  RED.nodes.registerType('linto-out', Node)
}

class LintoTerminalOut extends LintoCoreNode {
  constructor(RED, node, config) {
    super(node, config)

    this.wireEvent = wireEvent.init(RED)

    this.mqtt = new mqtt(this)
    this.init()
  }

  async init() {
    let mqttConfig = this.getFlowConfig('confMqtt')
    if (mqttConfig) {
      await this.mqtt.connect(mqttConfig.host, mqttConfig.port)
      this.wireNode.onMessage(this, toHardWareLinto.call(this), NODE_SUCCES_MESSAGE)
    } else {
      this.sendStatus('yellow', 'ring', 'Configuration is missing')
    }
    this.wireEvent.subscribe(this.node.z, this.node.type, toLintoByEvent.bind(this))

    this.node.on('close', (remove, done) => {
      this.wireEvent.unsubscribe(`${this.node.z}-${this.node.type}`)
      done()
    })
  }
}

function toLintoByEvent(msg) {
  if (msg.topic === undefined || msg.topic === '') {
    this.sendStatus('yellow', 'ring', 'Error during skill processing')
  } else {
    let output = { behavior: {} }
    output.behavior = msg.payload

    this.mqtt.publish(msg.topic, JSON.stringify(output))
    this.sendStatus('green', 'ring', NODE_SUCCES_MESSAGE)
  }
}

function toHardWareLinto(msg) {
  if (msg) {
    this.mqtt.publish(msg.topic, msg.payload.say)
  }
}
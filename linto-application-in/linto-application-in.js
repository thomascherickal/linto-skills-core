const debug = require('debug')('linto:skill:v2:core:linto-application-in')
const LintoConnectCoreNode = require('@linto-ai/linto-components').nodes.lintoConnectCoreNode
const { authToken } = require('@linto-ai/linto-components').connect
const { wireEvent } = require('@linto-ai/linto-components').components

const tts = require('./data/tts')

const TOPIC_SUBSCRIBE = '#'
const TOPIC_FILTER = 'nlp'

const DEFAULT_TOPIC = '+'
const LINTO_OUT_EVENT = 'linto-out'

module.exports = function (RED) {
  function Node(config) {
    RED.nodes.createNode(this, config)
    new LintoApplicationIn(RED, this, config)
  }
  RED.nodes.registerType('linto-application-in', Node)
}


class LintoApplicationIn extends LintoConnectCoreNode {
  constructor(RED, node, config) {
    super(node, config)

    this.wireEvent = wireEvent.init(RED)
    this.init()
  }

  async init() {

    if (this.node.context().global.authServerHost !== undefined) {
      this.authToken = authToken.init(this.node.context().global.authServerHost + '/local/isAuth')

      let mqttConfig = this.getFlowConfig('confMqtt')
      if (mqttConfig) {
        await this.mqtt.connect(mqttConfig)
        this.mqtt.subscribeToLinto(mqttConfig.fromLinto, DEFAULT_TOPIC, TOPIC_SUBSCRIBE)
        this.mqtt.onMessage(mqttHandler.bind(this), TOPIC_FILTER)

        await this.configure()
      } else {
        this.sendStatus('yellow', 'ring', 'Configuration is missing')
      }

    } else {
      this.sendStatus('red', 'ring', 'Authentification server not setup')
    }
  }
}

async function mqttHandler(topic, payload) {
  if (topic.includes('/status')) {
    debug('message /status receive, is ignored')
    return;
  }
  let data = topic.split('/')
  let outTopic = data[0] + '/tolinto/' + data[2] + '/nlp/file/' + data[5]

  let jsonParsePayload = JSON.parse(payload)
  let response = await this.authToken.checkToken(jsonParsePayload.auth_token)

  if (response.statusCode === 200) {
    let msg = {
      payload: {
        topic: outTopic,
        audio: jsonParsePayload.audio,
        conversationData: jsonParsePayload.conversationData
      }
    }
    this.wireNode.nodeSend(this.node, msg)
  } else {
    let msg = {
      topic: outTopic,
      payload: {
        say: tts[this.getFlowConfig('language').language].say.auth_error,
        error: {
          message: JSON.parse(response.body).message,
          code: response.statusCode
        }
      }
    }
    this.wireEvent.notify(`${this.node.z}-${LINTO_OUT_EVENT}`, msg)
  }
}
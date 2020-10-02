const debug = require('debug')('linto:skill:v2:core:linto-application-in')
const LintoConnectCoreNode = require('@linto-ai/linto-components').nodes.lintoConnectCoreNode
const { authToken } = require('@linto-ai/linto-components').connect
const { wireEvent } = require('@linto-ai/linto-components').components

const TOPIC_SUBSCRIBE = '#'
const TOPIC_FILTER = ['nlp', 'streaming', 'action']

const DEFAULT_TOPIC = '+'

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

    this.setFlowConfig('application_auth_type', {
      auth_android: config.auth_android,
      auth_web: config.auth_web
    })

  }

  async init() {
    if (this.node.context().global.authServerHost !== undefined) {
      this.authToken = authToken.init('http://' + this.node.context().global.authServerHost + '/local/isAuth')

      await this.autoloadTopic(__dirname + '/topic')

      let mqttConfig = this.getFlowConfig('confMqtt')
      if (mqttConfig) {
        await this.mqtt.connect(mqttConfig)
        this.mqtt.subscribeToLinto(mqttConfig.fromLinto, DEFAULT_TOPIC, TOPIC_SUBSCRIBE)
        this.mqtt.onMessage(mqttHandler.bind(this), TOPIC_FILTER)

        await this.configure()
      } else this.sendStatus('yellow', 'ring', 'Configuration is missing')

    } else this.sendStatus('red', 'ring', 'Authentification server not setup')
  }
}


async function mqttHandler(topic, payload) {
  const applicationAuthType = this.getFlowConfig('application_auth_type')

  const [_clientCode, _channel, _sn, _etat, _type, _id] = topic.split('/')
  switch (_etat) {
    case 'nlp':
      this.topicHandler.nlp.call(this, topic, payload, applicationAuthType)
      break
    case 'streaming':
      this.topicHandler.lvcsrstreaming.call(this, topic, payload, applicationAuthType)
      break
    case 'action':
      this.topicHandler.action.call(this, topic, payload)
      break
    default:
      const outTopic = `${_clientCode}/tolinto/${_sn}/streaming/${_id}`
      this.notifyEventError(outTopic, text.say.streaming_not_started, 'User need to start a streaming process')

      console.error('No data to store message')
      break
  }
}
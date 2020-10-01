const debug = require('debug')('linto:skill:v2:core:linto-application-in')
const LintoConnectCoreNode = require('@linto-ai/linto-components').nodes.lintoConnectCoreNode
const { authToken } = require('@linto-ai/linto-components').connect
const { wireEvent } = require('@linto-ai/linto-components').components

const tts = require('./data/tts')

const TOPIC_SUBSCRIBE = '#'
const TOPIC_FILTER = ['nlp', 'lvcsrstreaming', 'action']

const DEFAULT_TOPIC = '+'
const LINTO_OUT_EVENT = 'linto-out'

const ANDROID_BASE_TOKEN = 'Android'
const WEB_APPLICATION_BASE_TOKEN = 'WebApplication'


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
  let enable_auth = this.getFlowConfig('application_auth_type')
  const [_clientCode, _channel, _sn, _etat, _type, _id] = topic.split('/')

  if (_etat) {
    debug('message /status receive, is ignored')
    return;
  }

  const outTopic = data[0] + '/tolinto/' + data[2] + '/nlp/file/' + data[5]
  const jsonParsePayload = JSON.parse(payload)
  
  // Check if authentification method is enable
  if (jsonParsePayload.auth_token &&
    ((jsonParsePayload.auth_token.split(' ')[0] === ANDROID_BASE_TOKEN && enable_auth.auth_android === false)
      || (jsonParsePayload.auth_token.split(' ')[0] === WEB_APPLICATION_BASE_TOKEN && enable_auth.auth_web === false))) {
    this.wireEvent.notify(`${this.node.z}-${LINTO_OUT_EVENT}`,
      msgGeneratorError(outTopic, tts[this.getFlowConfig('language').language].say.auth_disable))
  } else {
    try {
      let response = await this.authToken.checkToken(jsonParsePayload.auth_token)
      if (response.statusCode === 200) {  // Check if user token is valid
        this.wireNode.nodeSend(this.node, {
          payload: {
            topic,
            audio: jsonParsePayload.audio,
            conversationData: jsonParsePayload.conversationData
          }
        })
      } else {  // Auth error
        this.wireEvent.notify(`${this.node.z}-${LINTO_OUT_EVENT}`,
          msgGeneratorError(outTopic, tts[this.getFlowConfig('language').language].say.auth_error, {
            message: JSON.parse(response.body).message,
            code: response.statusCode
          }))
      }
    } catch (err) {
      this.wireEvent.notify(`${this.node.z}-${LINTO_OUT_EVENT}`,
        msgGeneratorError(outTopic, tts[this.getFlowConfig('language').language].say.auth_error))
    }
  }
}

function msgGeneratorError(outTopic, tts, error) {
  let msg = {
    topic: outTopic,
    payload: {
      say: tts
    }
  }

  if (error) msg.error = error
  return msg
}
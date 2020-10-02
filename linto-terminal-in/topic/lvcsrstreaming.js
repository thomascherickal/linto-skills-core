const debug = require('debug')(`linto:skill:v2:core:terminal-in:topic:lvcsrstreaming`)
const tts = require('../data/tts')

let slots = []
module.exports = async function (topic, rawPayload, applicationAuthType) {
  const [_clientCode, _channel, _sn, _etat, _type] = topic.split('/')
  const outTopic = `${_clientCode}/tolinto/${_sn}/streaming/${_type}`
  const text = tts[this.getFlowConfig('language').language]

  let payload

  switch (_type) {
    case 'start':
      payload = JSON.parse(rawPayload)
      if (slots.indexOf(_sn) === -1) {
        slots.push(_sn)
        this.wireNode.nodeSend(this.node, { payload: { ...payload, topic: outTopic,  /*Config data ??? */ } })
      } else this.notifyEventError(outTopic, text.say.streaming_already_started, 'User has already started a streaming process')

      break
    case 'stop':
      payload = JSON.parse(rawPayload)
      if (slots.indexOf(_sn) > -1) {
        slots.splice(slots.indexOf(_sn), 1)
        this.wireNode.nodeSend(this.node, { payload: { ...payload, topic: outTopic /*Config data ??? */ } })
      } else this.notifyEventError(outTopic, text.say.streaming_not_started, 'User need to start a streaming process')

      break
    case 'chunk':
      if (slots.indexOf(_sn) > -1) this.wireNode.nodeSend(this.node, { payload: { topic: outTopic, chunk: rawPayload } })
      else this.notifyEventError(outTopic, text.say.streaming_not_started, 'User need to start a streaming process')

      break
    default:
      break
  }
}
const debug = require('debug')(`linto:skill:v2:core:transcribe-streaming:linstt`)
const WebSocket = require('ws')
let websocket = {}

module.exports = async function (msg) {
  let largeVocabStreaming = this.config.transcribe.largeVocabStreaming
  const [_clientCode, _channel, _sn, _etat, _type, _id] = msg.payload.topic.split('/')

  switch (_type) {
    case 'start':
      startWS(largeVocabStreaming, _id)
      this.sendPayloadToLinTO(topic, { status: 'started' })
      break
    case 'stop':
      stopWS(_id)
      this.sendPayloadToLinTO(topic, { status: 'stoped' })
      break
    case 'chunk':
      onMessage(msg.payload.chunk, _id)
      break
  }
  return msg
}

function startWS(host, id) {
  websocket[id] = new WebSocket('ws://'+host)
  websocket[id].send('{"config": {"sample_rate":16000, "metadata":1 }}')
  websocket[id].on('message', function incoming(event) {
    let data = JSON.parse(event.data)
    let topic = JSON.parse(event.topic)
    if ('partial' in data) this.sendPayloadToLinTO(topic, { partial: data.partial })
    else if ('text' in data && !('words' in data)) this.sendPayloadToLinTO(topic, { text: data.text })
    else if ('words' in data) this.sendToLinto(topic, { result: JSON.stringify(data, null, 4) })
    else if ('eod' in data) websocket[id].close()
    else console.error("unsupported event", data)
  })
}

function stopWS(id) {
  websocket[id].send('{"eof" : 1}')
}

function onMessage(data, _id) {
  let left = data.inputBuffer.getChannelData(0)
  websocket[_id].send(convertFloat32ToInt16(left))
}

function convertFloat32ToInt16(buffer) {
  l = buffer.length
  buf = new Int16Array(l)
  while (l--) {
    buf[l] = Math.min(1, buffer[l]) * 0x7FFF
  }
  return buf.buffer
}
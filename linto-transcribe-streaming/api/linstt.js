const debug = require('debug')(`linto:skill:v2:core:transcribe-streaming:linstt`)
const WebSocket = require('ws')
const DEFAULT_CONFIG = '{"config": {"sample_rate":16000, "metadata":1 }}'

let websocket = {}

module.exports = async function (msg) {
  let largeVocabStreaming = this.config.transcribe.largeVocabStreaming
  const [_clientCode, _channel, _sn, _etat, _type] = msg.payload.topic.split('/')
  let topic = `${_clientCode}/${_channel}/${_sn}/${_etat}`

  switch (_type) {
    case 'start':
      startWS.call(this, largeVocabStreaming, _sn, topic, msg)
      this.sendPayloadToLinTO(topic, { streaming: { status: 'started' } })
      break
    case 'stop':
      stopWS(_sn)
      this.sendPayloadToLinTO(topic, { streaming: { status: 'stoped' } })
      break
    case 'chunk':
      onMessage(msg.payload.chunk, _sn)
      break
  }
  return msg
}

function startWS(host, id, topic, msg) {
  websocket[id] = new WebSocket('wss://' + host)
  websocket[id].linto_id = id
  websocket[id].linto_topic = topic
  websocket[id].skillLinto = this

  websocket[id].on('open', function open() {
    if (msg.payload.config) {
      delete msg.payload.auth_token
      this.send(JSON.stringify(msg.payload))
    }
    else this.send(DEFAULT_CONFIG)
  })

  websocket[id].on('message', function incoming(msg) {
    const topicChunk = this.linto_topic + '/chunk'
    let data = JSON.parse(msg)
    console.log(data)
    if ('partial' in data) this.skillLinto.sendPayloadToLinTO(topicChunk, { streaming: { partial: data.partial } })
    else if ('text' in data && !('words' in data)) this.skillLinto.sendPayloadToLinTO(topicChunk, { streaming: { text: data.text } })
    else if ('words' in data) this.skillLinto.sendPayloadToLinTO(topicChunk, { streaming: { "status": "stop", result: JSON.stringify(data, null, 4) } })
    else if ('eod' in data) this.close()
    else console.error("unsupported msg", data)
  })
}

function stopWS(id) {
  websocket[id].send('{"eof" : 1}')
  websocket[id].on('close', function close() {
    console.log('disconnected')
  })
  websocket[id].close()
  delete websocket[id]
}

function onMessage(chunk, _id) {
  websocket[_id].send(chunk)
}

function convertFloat32ToInt16(buffer) {
  l = buffer.length
  buf = new Int16Array(l)
  while (l--) {
    buf[l] = Math.min(1, buffer[l]) * 0x7FFF
  }
  return buf.buffer
}
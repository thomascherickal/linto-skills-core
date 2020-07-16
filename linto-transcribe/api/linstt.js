const debug = require('debug')(`linto:skill:v2:core:transcribe:linstt`)

const TRANSCRIBE_PATH = 'transcribe'

module.exports = async function (msg) {
  let audio = msg.payload.audio
  if (audio) {
    let audioBuffer = Buffer.from(audio, 'base64')
    delete msg.payload.audio
    if (Buffer.isBuffer(audioBuffer)) {
      let options = prepareRequest(audioBuffer)

      try {
        let requestUri = this.config.transcribe.host
        if (this.config.transcribe.service !== undefined)
          requestUri += '/' + this.config.transcribe.service
        requestUri += '/' + TRANSCRIBE_PATH

        let transcriptResult = await this.request.post(requestUri, options)

        msg.payload.transcript = wrapperLinstt(transcriptResult)
        return msg
      } catch (err) {
        throw new Error(err)
      }
    }
  }
  throw new Error('Input should containt an audio buffer')
}

function prepareRequest(buffer) {
  let options = {
    headers: {
      accept: 'text/plain'
    },
    formData: {
      file: {
        value: buffer,
        options: {
          filename: 'wavFile',
          type: 'audio/wav',
          contentType: 'audio/wav'
        }
      },
      speaker: 'no'
    },
    encoding: null
  }
  return options
}

function wrapperLinstt(transcript) {
  let text = transcript.toString('utf8')
  return {
    text: text,
    confidence: 0
  }
}
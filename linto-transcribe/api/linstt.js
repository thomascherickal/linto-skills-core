const debug = require('debug')(`linto:skill:v2:core:transcribe:linstt`)

const TRANSCRIBE_PATH = '/transcribe'

module.exports = async function (msg) {
  let audio = msg.payload.audio
  if (audio) {
    let audioBuffer = Buffer.from(audio, 'base64')
    delete msg.payload.audio
    if (Buffer.isBuffer(audioBuffer)) {
      let options = prepareRequest(audioBuffer)
      let transcriptResult = await this.request.post(this.config.transcribe.host + TRANSCRIBE_PATH, options)
      msg.payload.transcript = wrapperLinstt(transcriptResult)

      return msg
    }
  }
  throw new Error('Input should containt an audio buffer')
}

function prepareRequest(buffer) {
  let options = {
    formData: {
      wavFile: {
        value: buffer,
        options: {
          filename: 'wavFile',
          type: 'audio/wav',
          contentType: 'audio/wav'
        }
      }
    },
    encoding: null
  }
  return options
}

function wrapperLinstt(transcript) {
  let wrapper = JSON.parse(transcript)

  return {
    text: wrapper.transcript.transcription,
    confidence: wrapper.transcript.trust_ind
  }
}
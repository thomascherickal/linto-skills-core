const debug = require('debug')(`linto:skill:v2:core:application-in:topic:nlp`)

module.exports = async function (topic, payload, applicationAuthType) {
  let isConnect = await this.authToken.isAuthEnableAndValidToken(payload, applicationAuthType)

  if (isConnect) {
    this.wireNode.nodeSend(this.node, {
      payload: {
        topic,
        audio: payload.audio,
        conversationData: payload.conversationData
      }
    })
  }else{
    //TODO: Error auth
  }
}
/*
 * Copyright (c) 2018 Linagora.
 *
 * This file is part of Linto-Skills-Core
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
module.exports = function (RED) {
    const debug = require('debug')('redmanager:flow:core:stt:bing')
    const speechService = require('ms-bing-speech-service')

    async function decodingAudio(buffer, recognizer) {
        return new Promise((resolve, reject) => {
            recognizer
                .start()
                .then(_ => {
                    recognizer.sendFile(buffer)
                        .then(_ => debug('file send'))
                        .catch((err) => {
                            reject(err)
                        })
                    recognizer.on('recognition', (res) => {
                        if (res.RecognitionStatus === 'Success') {
                            resolve({
                                transcript: res.NBest[0].Display,
                                confidence: res.NBest[0].Confidence
                            })
                        }
                    })
                }).catch((err) => {
                    reject(err)
                })
        })
    }

    async function prepareDecoding(buffer, config) {
        const recognizer = new speechService({
            language: config.language,
            subscriptionKey: config.key,
            mode: config.mode,
            format: 'detailed'
        })
        return await decodingAudio(buffer, recognizer)
    }

    function Bing(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', async function (msg) {
            try {
                let audioBuffer = Buffer.from(msg.payload.audio, 'base64')
                delete msg.payload.audio
                if (Buffer.isBuffer(audioBuffer)) {
                    let transResult = await prepareDecoding(audioBuffer, config)
                    msg.payload.transcript = transResult.transcript
                    msg.payload.confidence = transResult.confidence
                    node.send(msg);
                }
            } catch (err) {

            }
        });
    }
    RED.nodes.registerType("bing", Bing);
}
/*
 * Copyright (c) 2017 Linagora.
 *
 * This file is part of Business-Logic-Server
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
    const debug = require('debug')('redmanager:flow:core:stt:linstt')
    const request = require('request')

    async function decodingAudio(options) {
        return new Promise((resolve, reject) => {
            try {
                request.post(options, (err, sttRes, body) => {
                    if (!err && sttRes.statusCode == 200) {
                        let result = JSON.parse(body)
                        let jsonResult = {
                            transcript: result.transcript.transcription,
                            confidence: result.transcript.trust_ind
                        }
                        resolve(jsonResult)
                    }
                    reject({
                        errorMsg: err,
                        statusCode: sttRes.statusCode
                    })
                })
            } catch (err) {
                reject(err)
            }
        })
    }

    async function prepareDecoding(buffer, config) {
        let options = {
            url: config.url,
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
        return await decodingAudio(options)
    }

    function LinStt(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', async function (msg) {
            try {
                let json = JSON.parse(msg.payload)
                if (json.audio !== undefined) {
                    let audioBuffer = Buffer.from(json.audio, 'base64')
                    delete json.audio
                    if (Buffer.isBuffer(audioBuffer)) {
                        let transResult = await prepareDecoding(audioBuffer, config)
                        json.transcript = transResult.transcript
                        json.confidence = transResult.confidence
                        msg.payload = json;
                        node.send(msg);
                    }
                }
            } catch (err) {
                console.error(err)
                node.error("Error while managing stt", err);
            }
        });
    }
    RED.nodes.registerType("linstt", LinStt);
}
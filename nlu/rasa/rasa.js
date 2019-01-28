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
    const debug = require('debug')('redmanager:flow:core:nlu:rasa')
    const request = require('request')

    function prepareRequestRasa(msg, config, language) {
        let options = {
            method: 'POST',
            url: config.url,
            headers: {
                'content-type': 'application/json'
            },
            body: {
                queries: [msg.payload.transcript],
                namespace: config.namespace,
                applicationName: config.appname,
                context: {
                    language
                }
            },
            json: true
        };
        return options;
    }

    async function requestRasa(options) {
        return new Promise((resolve, reject) => {
            try {
                request(options, function (error, response, body) {
                    if (error) {
                        reject({
                            error
                        })
                    }
                    resolve(body)
                });
            } catch (error) {
                reject(error)
            }
        })
    }

    function wrapperRasa(nluData) {
        let wrapper = {}
        wrapper.intent = nluData.intent.name
        if (nluData.entities.length !== undefined)
            wrapper.entitiesNumber = nluData.entities.length
        wrapper.entities = nluData.entities
        return wrapper
    }

    function RasaRequest(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        node.on('input', async function (msg) {
            try {
                if (config.url === '' || config.namespace === '' || config.appname === '') {
                    node.error(RED._("rasa.error.config"))
                    node.status({
                        fill: "red",
                        shape: "ring",
                        text: RED._("rasa.status.disconnect")
                    });
                } else {
                    let options = prepareRequestRasa(msg, config, this.context().flow.get('language').split('-')[0])
                    let response = await requestRasa(options)
                    msg.payload.nlu = wrapperRasa(response)
                    node.send(msg);
                }
            } catch (err) {
                node.error(RED._("rasa.error.connect"))
                node.status({
                    fill: "red",
                    shape: "ring",
                    text: RED._("rasa.status.disconnect")
                });
            }
        });
    }
    RED.nodes.registerType("rasa", RasaRequest)
}
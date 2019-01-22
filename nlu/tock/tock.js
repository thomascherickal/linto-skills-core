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
    const debug = require('debug')('linto-interface:redmanager:flow:nlu:tock')
    const request = require('request')
    const NAMESPACE = "app"
    let node

    function prepareRequestTock(msg, config) {
        let options = {
            method: 'POST',
            url: config.url,
            headers: {
                'content-type': 'application/json'
            },
            body: {
                queries: [msg.payload.transcript],
                namespace: NAMESPACE,
                applicationName: config.appname,
                context: {
                    language: process.env.LANG.split('_')[0]
                }
            },
            json: true
        };
        return options;
    }

    async function requestTock(options) {
        return new Promise((resolve, reject) => {
            try {
                request(options, function (error, response, body) {
                    if (error) {
                        reject({
                            error
                        })
                    }
                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: RED._("tock.status.connect")
                    });
                    resolve(body)
                });
            } catch (error) {
                node.status({
                    fill: "red",
                    shape: "ring",
                    text: RED._("tock.status.disconnect")
                });
                node.error(RED._("tock.error.connect"))
            }
        })
    }

    function wrapperTock(nluData) {
        let wrapper = {}
        wrapper.intent = nluData.intent
        wrapper.text = nluData.retainedQuery
        if (nluData.entities.length !== undefined)
            wrapper.entitiesNumber = nluData.entities.length
        wrapper.entities = []
        let text = nluData.retainedQuery
        for (let i = 0; i < nluData.entities.length; i++) {
            wrapper.entities[i] = nluData.entities[i]
            wrapper.entities[i].value = text.substring(nluData.entities[i].start, nluData.entities[i].end)
            wrapper.entities[i].entity = nluData.entities[i].entity.role
        }
        return wrapper
    }

    function TockRequest(config) {
        RED.nodes.createNode(this, config);
        node = this;
        node.on('input', async function (msg) {
            try {
                if (config.url === '' || config.appname === '') {
                    node.error(RED._("tock.error.config"))
                    node.status({
                        fill: "red",
                        shape: "ring",
                        text: RED._("tock.status.disconnect")
                    });
                } else {
                    let options = prepareRequestTock(msg, config)
                    let response = await requestTock(options)
                    msg.payload = wrapperTock(response)
                    node.send(msg);
                }
            } catch (err) {
                node.error(RED._("tock.error.connect"))
            }
        });
    }
    RED.nodes.registerType("tock", TockRequest)
}
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
'use strict'

module.exports = function(RED) {
  const debug = require('debug')('redmanager:flow:core:nlu:tock')
  const request = require('request')
  const NAMESPACE = 'app'

  function prepareRequestTock(msg, config, language) {
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
          language
        }
      },
      json: true
    }
    return options
  }

  async function requestTock(options) {
    return new Promise((resolve, reject) => {
      try {
        request(options, function(error, response, body) {
          if (error)
            reject(error)
          resolve(body)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  function wrapperTock(nluData) {
    let wrapper = {}
    wrapper.intent = nluData.intent

    let nluEntities = nluData.entities
    if (nluEntities.length)
      wrapper.entitiesNumber = nluEntities.length
    wrapper.entities = []

    let text = nluData.retainedQuery
    for (let i = 0; i < nluEntities.length; i++) {
      let textEntitie = text.substring(nluEntities[i].start, nluEntities[i].end)
      wrapper.entities[i] = nluEntities[i]
      wrapper.entities[i].value = textEntitie
      wrapper.entities[i].entity = nluEntities[i].entity.role
    }
    return wrapper
  }

  function TockRequest(config) {
    RED.nodes.createNode(this, config)
    let node = this
    node.on('input', async function(msg) {
      try {
        if (config.url === '' || config.appname === '') {
          node.error(RED._('tock.error.config'))
          node.status({
            fill: 'yellow',
            shape: 'ring',
            text: RED._('tock.status.config')
          })
        } else {
          let language = this.context().flow.get('language').split('-')[0],
            options = prepareRequestTock(msg, config, language),
            response = await requestTock(options)
          msg.payload.nlu = wrapperTock(response)
          node.send(msg)
        }
      } catch (err) {
        node.error(RED._('tock.error.connect'))
        node.status({
          fill: 'red',
          shape: 'ring',
          text: RED._('tock.status.disconnect')
        })
      }
    })
  }
  RED.nodes.registerType('tock', TockRequest)
}

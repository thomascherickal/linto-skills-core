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
  const debug = require('debug')('redmanager:flow:core:settings:prepare'),
    TOPIC_LENGTH = 6

  function prepareFlow(config) {
    RED.nodes.createNode(this, config)
    var node = this

    if (!this.context().flow.get('language'))
      this.context().flow.language = process.env.DEFAULT_LANGUAGE

    if (!this.context().flow.register)
      this.context().flow.register = {
        intent: []
      }

    node.on('input', function(msg) {
      try {
        let topic = msg.topic
        if (!topic || topic.split('/').length < TOPIC_LENGTH) {
          this.error(RED._('prepare.error.topic'))
        } else {
          let data = msg.topic.split('/')
          msg.topic = data[0] + '/tolinto/' + data[2] + '/nlp/file/' + data[5]
          node.send(msg)
        }
      } catch (err) {
        this.error(RED._('prepare.error.topic'))
      }
    })
  }
  RED.nodes.registerType('prepare', prepareFlow)
}

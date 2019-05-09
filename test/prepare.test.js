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

let assert = require('assert'),
  helper = require('node-red-node-test-helper'),

  prepare = require('../settings/prepare/prepare.js')

const flow = [
  {
    id: 'f1',
    type: 'tab',
    label: 'Test flow'
  },
  {
    id: 'n1',
    z: 'f1',
    type: 'prepare',
    name: 'test name',
    wires: [['n2']]
  },
  {
    id: 'n2',
    z: 'f1',
    type: 'helper'
  }
]

helper.init(require.resolve('node-red'))

describe('check prepare node', function() {
  before(function() {
    process.env.DEFAULT_LANGUAGE = 'en-US'
  })

  beforeEach(function(done) {
    helper.startServer(done)
  })

  afterEach(function() {
    helper.unload()
  })

  it('it should update topic without changing the payload', function(done) {
    let payload = 'myPayload'

    helper.load(prepare, flow, function() {
      let nodePrepare = helper.getNode('n1'),
        nodeHelper = helper.getNode('n2')
      nodeHelper.on('input', function(msg) {
        assert.equal(msg.payload, payload)
        assert.equal(msg.topic, 'BLK/tolinto/0/nlp/file/1')
        done()
      })
      nodePrepare.receive({
        payload: payload,
        topic: 'BLK/fromlinto/0/nlp/file/1'
      })
    })
  })

  it('it should update topic without creating a payload', function(done) {
    helper.load(prepare, flow, function() {
      let nodePrepare = helper.getNode('n1'),
        nodeHelper = helper.getNode('n2')
      nodeHelper.on('input', function(msg) {
        assert.equal(msg.payload, undefined)
        assert.equal(msg.topic, 'BLK/tolinto/0/nlp/file/1')
        done()
      })
      nodePrepare.receive({
        topic: 'BLK/fromlinto/0/nlp/file/1'
      })
    })
  })

  // TODO: can't test fail case see
  // https://github.com/node-red/node-red-node-test-helper/issues/25
})

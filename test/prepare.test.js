let assert = require("assert")
let helper = require("node-red-node-test-helper")

let prepare = require("../settings/prepare/prepare.js")

const flow = [{
    id: "f1",
    type: "tab",
    label: "Test flow"
  }, {
    id: "n1",
    z: "f1",
    type: "prepare",
    name: "test name",
    wires: [
      ["n2"]
    ]
  },
  {
    id: "n2",
    z: "f1",
    type: "helper"
  }
]

helper.init(require.resolve('node-red'))

describe('check prepare node', function () {
  before(function () {
    process.env.DEFAULT_LANGUAGE = 'en-US'
  })

  beforeEach(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  it('it should update topic without changing the payload', function (done) {
    let payload = 'myPayload'

    helper.load(prepare, flow, function () {
      let nodePrepare = helper.getNode("n1")
      let nodeHelper = helper.getNode("n2")
      nodeHelper.on("input", function (msg) {
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

  it('it should update topic without creating a payload', function (done) {
    helper.load(prepare, flow, function () {
      let nodePrepare = helper.getNode("n1")
      let nodeHelper = helper.getNode("n2")
      nodeHelper.on("input", function (msg) {
        assert.equal(msg.payload, undefined)
        assert.equal(msg.topic, 'BLK/tolinto/0/nlp/file/1')
        done()
      })
      nodePrepare.receive({
        topic: 'BLK/fromlinto/0/nlp/file/1'
      })
    })
  })


  // TODO: can't test fail case : https://github.com/node-red/node-red-node-test-helper/issues/25
})
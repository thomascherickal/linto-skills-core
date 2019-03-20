let assert = require("assert")
let helper = require("node-red-node-test-helper")

let prepare = require("../settings/prepare/prepare.js")
let rasaNode = require("../nlu/rasa/rasa.js")
let tockNode = require("../nlu/tock/tock.js")
let bingNode = require("../stt/bing/bing.js")
let linsttNode = require("../stt/linstt/linstt.js")


helper.init(require.resolve('node-red'))

describe('checking loading node', function () {
  before(function () {
    process.env.DEFAULT_LANGUAGE = 'fr-FR'
  })

  beforeEach(function (done) {
    helper.startServer(done)
  })


  afterEach(function () {
    helper.unload()
  })

  it('it should load the rasa node', function (done) {
    let flow = [{
      id: "n1",
      type: "rasa",
      name: "nodeName"
    }]
    helper.load(rasaNode, flow, function () {
      let n1 = helper.getNode("n1")
      assert.equal(n1.name, 'nodeName')
      done()
    })
  })

  it('it should load the tock node', function (done) {
    let flow = [{
      id: "n1",
      type: "tock",
      name: "nodeName"
    }]
    helper.load(tockNode, flow, function () {
      let n1 = helper.getNode("n1")
      assert.equal(n1.name, 'nodeName')
      done()
    })
  })

  it('it should load the bing node', function (done) {
    let flow = [{
      id: "n1",
      type: "bing",
      name: "nodeName"
    }]
    helper.load(bingNode, flow, function () {
      let n1 = helper.getNode("n1")
      assert.equal(n1.name, 'nodeName')
      done()
    })
  })

  it('it should load the linstt node', function (done) {
    let flow = [{
      id: "n1",
      type: "linstt",
      name: "nodeName"
    }]
    helper.load(linsttNode, flow, function () {
      let n1 = helper.getNode("n1")
      assert.equal(n1.name, 'nodeName')
      done()
    })
  })

  it('it should load the prepare node', function (done) {
    let flow = [{id:"f1", type:"tab", label:"Test flow"},
    { id: "n1", z:"f1", type: "prepare", name: "nodeName" }]

    helper.load(prepare, flow, function () {
      let n1 = helper.getNode("n1")
      assert.equal(n1.name, 'nodeName')
      done()
    })
  })
})
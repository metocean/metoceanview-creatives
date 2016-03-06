{ component, hub, dom } = require 'odojs'
relay = require 'odo-relay'
exe = require 'odoql-exe'
odoql = require 'odoql/odojs'
component.use odoql

hub = hub()
exe = exe hub: hub

router = component
  render: (state, params, hub) ->
    dom '#root', [
      dom 'div', 'test component'
    ]

root = document.querySelector '#root'
scene = relay root, router, exe, hub: hub

hub.every 'update', (p, cb) ->
  console.log p?.autocomplete
  scene.update p
  cb()

scene.update {}

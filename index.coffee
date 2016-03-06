{ component, hub, dom } = require 'odojs'
relay = require 'odo-relay'
exe = require 'odoql-exe'
odoql = require 'odoql/odojs'
component.use odoql

hub = hub()
exe = exe hub: hub

select = require './selector'

router = component
  render: (state, params, hub) ->

    dom '#root', [
      select state, params.siteDataSetSelector, hub.new
        update: (m, cb) ->
          hub.emit 'update', siteDataSetSelector: m.autocomplete
          cb()
    ]

root = document.querySelector '#root'
scene = relay root, router, exe, hub: hub

hub.every 'update', (p, cb) ->
  scene.update p
  cb()

scene.update {}

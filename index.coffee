{ component, hub, dom } = require 'odojs'
relay = require 'odo-relay'
exe = require 'odoql-exe'
odoql = require 'odoql/odojs'
component.use odoql

hub = hub()
exe = exe hub: hub

selector = require './components/selector'

router = component
  render: (state, params, hub) ->

    dom '#root.metoceanview-creatives-page.grid', [
      dom 'div.example.selector-example', [
        dom 'div', 'Selector component: '
        selector state, params.siteDataSetSelector, hub.new
          update: (m, cb) ->
            hub.emit 'update', siteDataSetSelector: m.autocomplete
            cb()
      ]
      dom 'div.example', 'need component here'
      dom 'div.example', 'need component here'
      dom 'div.example', 'need component here'
      dom 'div.example', 'need component here'
    ]

root = document.querySelector '#root'
scene = relay root, router, exe, hub: hub

hub.every 'update', (p, cb) ->
  scene.update p
  cb()

scene.update {}

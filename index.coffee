{ component, hub, dom } = require 'odojs'
relay = require 'odo-relay'
exe = require 'odoql-exe'
odoql = require 'odoql/odojs'
component.use odoql

hub = hub()
exe = exe hub: hub

selector = require './components/selector'

selectorDefaultParams =
  allItems: [
    'Buildings'
    'Shared Services'
    'Control Systems'
    'High Voltage'
    'Other'
    'Fluid Exchanger'
    'Protection System'
    'Steam Plant'
    'Steam Turbines'
    'Geo Wells'
    'Therm Generators'
    'Transformers'
    'Transmission'
  ]
  default: 'Shared Services'
router = component
  render: (state, params, hub) ->
    params.exampleSelectorParams ?= selectorDefaultParams
    dom '#root.metoceanview-creatives-page.grid', [
      dom 'div.example.selector-example', [
        dom 'div', 'Selector component: '
        dom 'div.selector-container', [
          selector state, params.exampleSelectorParams, hub.new
            update: (m, cb) ->
              hub.emit 'update', exampleSelectorParams: m.autocomplete
              cb()
        ]
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

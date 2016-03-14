{ component, hub, dom } = require 'odojs'
relay = require 'odo-relay'
exe = require 'odoql-exe'
odoql = require 'odoql/odojs'
component.use odoql

hub = hub()
exe = exe hub: hub

selector = require './components/selector'
select = require './components/select'

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
    hubForSelect = hub.new()
    hubForSelect.every 'selected value: {value}', (p, cb) ->
      console.log 'inside the hub every'
      console.log p
      cb()
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
      dom 'div.example', [
        select state, params, hubForSelect
      ]
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

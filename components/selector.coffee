{component, dom} = require 'odojs'
autoCompleteHelper = require 'odojs-autocomplete'

items = [
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

module.exports = (state, params, hub) ->
  params ?= {}
  params.value ?= ''
  params.isopen ?= no
  params.selectedindex ?= null
  params.items ?= items

  helper = autoCompleteHelper state, params, hub.child
    update: (p, cb) ->
      p.items = items.filter (item) -> item.toLowerCase().indexOf(p.value.toLowerCase()) is 0
      if p.items.length is 1
        if p.items[0] is p.value
          p.items = items
        else if p.isopen and !p.selectedindex?
          p.selectedindex = 0
      hub.emit 'update', autocomplete: p
      cb()
  isopen = params.isopen and params.items.length > 0
  helper.inputparams.value = params.value
  dom ".metoceanview-selector#{if isopen then '.open' else ''}", [
    dom 'div.selector-input-wrapper', [
      dom 'input', helper.inputparams
    ]
    if isopen
      dom 'div.list-container', [
        dom 'ul', params.items.map (item, index) ->
          description = dom 'span', item
          if params.items.length isnt items.length
            description = [
              dom 'span.underline', item.substr 0, params.value.length
              dom 'span', item.substr params.value.length
            ]
          isselected = index is params.selectedindex
          linkparams = helper.linkparams item, index
          dom "#{if isselected then 'li.selected' else 'li'}", dom '.item', linkparams, description
      ]
  ]

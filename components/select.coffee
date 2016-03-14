#how to use:
#params.items where items is an array of json objects containing value and label properties
#params.defaultValue is the default selected item
#once a value is selected then 'selected value: {value}' will be emitted

{dom, widget} = require 'odojs'
react = require 'react'
reactDOM = require 'react-dom'
reactSelect = require 'react-select'

valueAndLabel = (value, label) ->
  value: value
  label: label

defaultItems = [
  valueAndLabel('first', 'first')
  valueAndLabel('second', 'second')
  valueAndLabel('third', 'third')
]
defaultValue = ''

module.exports = widget
  afterMount: (el, state, params, hub) ->
    items = params.items ? defaultItems
    defaultValue = params.defaultValue ? defaultValue
    change = (value) ->
      hub.emit 'selected value: {value}', value: value
    reactDOM.render(react.createElement(reactSelect, {name: 'select-name', value: defaultValue, options: items, onChange: change}), el)
  render: () ->
    dom '.select', ''

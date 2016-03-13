{dom, widget} = require 'odojs'
react = require 'react'
reactDOM = require 'react-dom'
reactSelect = require 'react-select'

valueAndLabel = (value, label) ->
  value: value
  label: label

options = [
  valueAndLabel('first', 'first')
  valueAndLabel('second', 'second')
  valueAndLabel('third', 'third')
]

change = () ->
  console.log 'onchange'

module.exports = widget
  afterMount: (el, state, params, hub) ->
    reactDOM.render(react.createElement(reactSelect, {name: 'select-name', value:'first', options: options, onChange: change}), el)
  render: (a, b, c, d) ->
    dom '.select', ''

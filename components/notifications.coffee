# params = JSON from helm

{ dom, component } = require 'odojs'

module.exports = component render: (state, params, hub) ->
  containerstyle = """
    border: 1px solid white;
    background-color: #D9222A;
  """
  linkstyle = """
    display: block;
    padding: 0.3em 1.6em;
    color: white;
  """
  dom 'div', { attributes: style: containerstyle },
    dom 'a', { attributes: style: linkstyle, href: 'https://helm.metoceanview.com/' },
      params
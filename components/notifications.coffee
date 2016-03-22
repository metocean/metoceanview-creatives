# params = JSON from helm

{ dom, component } = require 'odojs'

module.exports = component render: (state, params, hub) ->
  containerstyle = """
    border: 1px solid white;
    border-bottom: none;
    margin-bottom: -1px;
  """
  linkstyle = """
    border-bottom: 1px solid white;
    display: block;
    padding: 0.3em 1.6em;
    color: white;
    background-color: #D9222A;
  """
  dom 'div', { attributes: style: containerstyle }, params.messages.filter((m) -> m.type is 'warning').map (m) ->
    dom 'a', { attributes: style: linkstyle, href: 'https://helm.metoceanview.com/' },
      m.title
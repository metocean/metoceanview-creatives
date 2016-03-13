(function() {
  var change, dom, options, react, reactDOM, reactSelect, valueAndLabel, widget, _ref;

  _ref = require('odojs'), dom = _ref.dom, widget = _ref.widget;

  react = require('react');

  reactDOM = require('react-dom');

  reactSelect = require('react-select');

  valueAndLabel = function(value, label) {
    return {
      value: value,
      label: label
    };
  };

  options = [valueAndLabel('first', 'first'), valueAndLabel('second', 'second'), valueAndLabel('third', 'third')];

  change = function() {
    return console.log('onchange');
  };

  module.exports = widget({
    afterMount: function(el, state, params, hub) {
      return reactDOM.render(react.createElement(reactSelect, {
        name: 'select-name',
        value: 'first',
        options: options,
        onChange: change
      }), el);
    },
    render: function(a, b, c, d) {
      return dom('.select', '');
    }
  });

}).call(this);

(function() {
  var dom, options, react, reactDOM, reactSelect, valueAndLabel, widget, _ref;

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

  module.exports = widget({
    afterMount: function(el, state, params, hub) {
      var change;
      change = function(value) {
        return hub.emit('selected value: {value}', {
          value: value
        });
      };
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

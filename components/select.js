(function() {
  var defaultItems, defaultValue, dom, react, reactDOM, reactSelect, valueAndLabel, widget, _ref;

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

  defaultItems = [valueAndLabel('first', 'first'), valueAndLabel('second', 'second'), valueAndLabel('third', 'third')];

  defaultValue = '';

  module.exports = widget({
    afterMount: function(el, state, params, hub) {
      var change, items, _ref1, _ref2;
      items = (_ref1 = params.items) != null ? _ref1 : defaultItems;
      defaultValue = (_ref2 = params.defaultValue) != null ? _ref2 : defaultValue;
      change = function(value) {
        return hub.emit('selected value: {value}', {
          value: value
        });
      };
      return reactDOM.render(react.createElement(reactSelect.default, {
        name: 'select-name',
        defaultValue: defaultValue,
        options: items,
        onChange: change
      }), el);
    },
    render: function() {
      return dom('.select', '');
    }
  });

}).call(this);

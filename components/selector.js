(function() {
  var autoCompleteHelper, component, dom, items, _ref;

  _ref = require('odojs'), component = _ref.component, dom = _ref.dom;

  autoCompleteHelper = require('odojs-autocomplete');

  items = ['Buildings', 'Shared Services', 'Control Systems', 'High Voltage', 'Other', 'Fluid Exchanger', 'Protection System', 'Steam Plant', 'Steam Turbines', 'Geo Wells', 'Therm Generators', 'Transformers', 'Transmission'];

  module.exports = function(state, params, hub) {
    var helper, isopen;
    if (params == null) {
      params = {};
    }
    if (params.value == null) {
      params.value = '';
    }
    if (params.isopen == null) {
      params.isopen = false;
    }
    if (params.selectedindex == null) {
      params.selectedindex = null;
    }
    if (params.items == null) {
      params.items = items;
    }
    helper = autoCompleteHelper(state, params, hub.child({
      update: function(p, cb) {
        p.items = items.filter(function(item) {
          return item.toLowerCase().indexOf(p.value.toLowerCase()) === 0;
        });
        if (p.items.length === 1) {
          if (p.items[0] === p.value) {
            p.items = items;
          } else if (p.isopen && (p.selectedindex == null)) {
            p.selectedindex = 0;
          }
        }
        hub.emit('update', {
          autocomplete: p
        });
        return cb();
      }
    }));
    isopen = params.isopen && params.items.length > 0;
    return dom(".metoceanview-selector" + (isopen ? '.open' : ''), [
      dom('div.selector-input-wrapper', [dom('input', helper.inputparams)]), isopen ? dom('div.list-container', [
        dom('ul', params.items.map(function(item, index) {
          var description, isselected, linkparams;
          description = dom('span', item);
          if (params.items.length !== items.length) {
            description = [dom('span.underline', item.substr(0, params.value.length)), dom('span', item.substr(params.value.length))];
          }
          isselected = index === params.selectedindex;
          linkparams = helper.linkparams(item, index);
          linkparams.attributes = {
            href: '#'
          };
          return dom("" + (isselected ? 'li.selected' : 'li'), dom('.item', linkparams, description));
        }))
      ]) : void 0
    ]);
  };

}).call(this);

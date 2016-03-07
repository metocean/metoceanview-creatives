(function() {
  var autoCompleteHelper, component, dom, fillerItems, _ref;

  _ref = require('odojs'), component = _ref.component, dom = _ref.dom;

  autoCompleteHelper = require('odojs-autocomplete');

  fillerItems = ['You', 'Need', 'To', 'Pass', 'In', 'Your', 'Items', 'Through', 'Params'];

  module.exports = function(state, params, hub) {
    var helper, isopen, _ref1;
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
    params.allItems = (_ref1 = params.allItems) != null ? _ref1 : fillerItems;
    if (params.items == null) {
      params.items = fillerItems;
    }
    helper = autoCompleteHelper(state, params, hub.child({
      update: function(p, cb) {
        p.items = params.allItems.filter(function(item) {
          return item.toLowerCase().indexOf(p.value.toLowerCase()) === 0;
        });
        if (p.items.length === 1) {
          if (p.items[0] === p.value) {
            p.items = params.allItems;
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
    helper.inputparams.value = params.value;
    return dom(".metoceanview-selector" + (isopen ? '.open' : ''), [
      dom('div.selector-input-wrapper', [dom('input', helper.inputparams)]), isopen ? dom('div.list-container', [
        dom('ul', params.items.map(function(item, index) {
          var description, isselected, linkparams;
          description = dom('span', item);
          if (params.items.length !== params.allItems.length) {
            description = [dom('span.underline', item.substr(0, params.value.length)), dom('span', item.substr(params.value.length))];
          }
          isselected = index === params.selectedindex;
          linkparams = helper.linkparams(item, index);
          return dom("" + (isselected ? 'li.selected' : 'li'), dom('.item', linkparams, description));
        }))
      ]) : void 0
    ]);
  };

}).call(this);

(function() {
  var component, dom, exe, hub, odoql, relay, root, router, scene, select, selector, selectorDefaultParams, _ref;

  _ref = require('odojs'), component = _ref.component, hub = _ref.hub, dom = _ref.dom;

  relay = require('odo-relay');

  exe = require('odoql-exe');

  odoql = require('odoql/odojs');

  component.use(odoql);

  hub = hub();

  exe = exe({
    hub: hub
  });

  selector = require('./components/selector');

  select = require('./components/select');

  selectorDefaultParams = {
    allItems: ['Buildings', 'Shared Services', 'Control Systems', 'High Voltage', 'Other', 'Fluid Exchanger', 'Protection System', 'Steam Plant', 'Steam Turbines', 'Geo Wells', 'Therm Generators', 'Transformers', 'Transmission'],
    "default": 'Shared Services'
  };

  router = component({
    render: function(state, params, hub) {
      var hubForSelect;
      if (params.exampleSelectorParams == null) {
        params.exampleSelectorParams = selectorDefaultParams;
      }
      hubForSelect = hub["new"]();
      hubForSelect.every('selected value: {value}', function(p, cb) {
        console.log('inside the hub every');
        console.log(p);
        return cb();
      });
      return dom('#root.metoceanview-creatives-page.grid', [
        dom('div.example.selector-example', [
          dom('div', 'Selector component: '), dom('div.selector-container', [
            selector(state, params.exampleSelectorParams, hub["new"]({
              update: function(m, cb) {
                hub.emit('update', {
                  exampleSelectorParams: m.autocomplete
                });
                return cb();
              }
            }))
          ])
        ]), dom('div.example', [select(state, params, hubForSelect)]), dom('div.example', 'need component here'), dom('div.example', 'need component here'), dom('div.example', 'need component here')
      ]);
    }
  });

  root = document.querySelector('#root');

  scene = relay(root, router, exe, {
    hub: hub
  });

  hub.every('update', function(p, cb) {
    scene.update(p);
    return cb();
  });

  scene.update({});

}).call(this);

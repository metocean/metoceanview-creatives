(function() {
  var component, dom, exe, hub, odoql, relay, root, router, scene, selector, selectorDefaultParams, _ref;

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

  selectorDefaultParams = {
    allItems: ['Buildings', 'Shared Services', 'Control Systems', 'High Voltage', 'Other', 'Fluid Exchanger', 'Protection System', 'Steam Plant', 'Steam Turbines', 'Geo Wells', 'Therm Generators', 'Transformers', 'Transmission']
  };

  router = component({
    render: function(state, params, hub) {
      if (params.exampleSelectorParams == null) {
        params.exampleSelectorParams = selectorDefaultParams;
      }
      return dom('#root.metoceanview-creatives-page.grid', [
        dom('div.example.selector-example', [
          dom('div', 'Selector component: '), selector(state, params.exampleSelectorParams, hub["new"]({
            update: function(m, cb) {
              hub.emit('update', {
                exampleSelectorParams: m.autocomplete
              });
              return cb();
            }
          }))
        ]), dom('div.example', 'need component here'), dom('div.example', 'need component here'), dom('div.example', 'need component here'), dom('div.example', 'need component here')
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

(function() {
  var component, dom, exe, hub, odoql, relay, root, router, scene, _ref;

  _ref = require('odojs'), component = _ref.component, hub = _ref.hub, dom = _ref.dom;

  relay = require('odo-relay');

  exe = require('odoql-exe');

  odoql = require('odoql/odojs');

  component.use(odoql);

  hub = hub();

  exe = exe({
    hub: hub
  });

  router = component({
    render: function(state, params, hub) {
      return dom('#root', [dom('div', 'test component')]);
    }
  });

  root = document.querySelector('#root');

  scene = relay(root, router, exe, {
    hub: hub
  });

  hub.every('update', function(p, cb) {
    console.log(p != null ? p.autocomplete : void 0);
    scene.update(p);
    return cb();
  });

  scene.update({});

}).call(this);

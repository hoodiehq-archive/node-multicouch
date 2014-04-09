// Execute `nodeunit test` from `node-multicouch` directory to run this test.

var MultiCouch = require('../lib/multicouch');

exports['multicouch emits start event asynchronously'] = function (test) {
  var couch;

  test.expect(0);

  function synchronousCatcher () {
    throw new Error('start event emitted synchronously');
  }

  couch = new MultiCouch({});
  couch.on('start', synchronousCatcher);
  couch.start();
  couch.removeListener('start', synchronousCatcher);

  couch.on('start', function() {
    test.done();
  });
};

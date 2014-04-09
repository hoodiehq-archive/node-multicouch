// Execute `nodeunit test` from `node-multicouch` directory to run this test.

var MultiCouch = require('../lib/multicouch');

exports.tearDown = function (callback) {
  this.couch.stop();

  this.couch.once('stop', function () {
    callback();
  });
};

exports['multicouch emits start event asynchronously'] = function (test) {
  test.expect(0);

  function synchronousCatcher () {
    throw new Error('start event emitted synchronously');
  }

  this.couch = new MultiCouch({});
  this.couch.on('start', synchronousCatcher);
  this.couch.start();
  this.couch.removeListener('start', synchronousCatcher);

  this.couch.on('start', function() {
    test.done();
  });
};

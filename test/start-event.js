// Execute `nodeunit test` from `node-multicouch` directory to run this test.

var MultiCouch = require('../lib/multicouch');

exports.tearDown = function (callback) {
  if (!this.couch) {
    return process.nextTick(callback);
  }

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

exports['multicouch emits stop event asynchronously'] = function (test) {

  // Use local variable instead of `this.couch` because we stop CouchDB
  // instance here and do not need `tearDown` to do this.

  var couch;

  test.expect(0);

  function synchronousCatcher () {
    throw new Error('stop event emitted synchronously');
  }

  couch = new MultiCouch({});
  couch.start();

  couch.on('start', function() {
    couch.on('stop', synchronousCatcher);
    couch.stop();
    couch.removeListener('stop', synchronousCatcher);

    couch.on('stop', function() {
      test.done();
    });
  });
};

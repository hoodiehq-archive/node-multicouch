var path = require('path');
var shell = require('shelljs');


// find couchdb in path
//  - set default.ini to ../etc/couchdb/default.ini
// else
//  - find CouchDB.app bundle
//  - set defaul.ini to $couchdbx-core/etc/couchdb/default.ini

// var system_couch = require('system-couchdb');
// this could be its own module 'launch CouchDB from app'
exports.system_couch = (function () {
  var bin = null;
  var default_ini = null;
  var prefix = process.env.COUCHDB_PATH;

  if (process.env.COUCHDB_PATH) {
    return {
      bin: path.resolve(prefix, 'bin/couchdb'),
      default_ini: path.resolve(prefix, 'etc/couchdb/default.ini')
    };
  }

  // to find `default.ini`, we need to take the following
  // things into account:
  // `couchdb` might live in `/usr/bin`, `/usr/local/bin` or
  // in another `$prefix/bin dir. In all cases but `/usr/bin`,
  // the corresponding `etc/` directory exists next to
  // `bin/`, e.g. `/usr/local/bin` and `/usr/local/etc`.
  // `/usr/bin` however usually pairs with `/etc`, so we
  // need to special-case that.
  try {
    bin = shell.which('couchdb', {
      async: true,
      silent: true
    }, function (err) {
      throw err;
    });

    if (bin === '/usr/bin/couchdb') {
      default_ini = '/etc/couchdb/default.ini';
    } else {
      default_ini = path.resolve(path.dirname(bin), '../etc/couchdb/default.ini');
    }

  } catch (e) {
    // could not find one in PATH, maybe there is an
    // `Apache CouchDB.app` that we can use
    bin = path.resolve(__dirname, '../bin/launch-couchdb-from-app.sh');
    default_ini = 'etc/couchdb/default.ini';
  }

  return {
    bin: bin,
    default_ini: default_ini
  };

}());

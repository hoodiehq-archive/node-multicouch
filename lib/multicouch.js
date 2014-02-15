var fs = require('fs');
var ini = require('ini');
var util = require('util');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var spawn = require('child_process').spawn;

var system_couch = require('./system_couch');

util.inherits(MultiCouch, EventEmitter);

function MultiCouch(args) {

  var prefix = args.prefix || (process.platform === 'win32' ? process.env.TEMP : '/tmp');
  var win_bin;
  var couch;

  if (process.platform === 'win32') {

    var erlPath_x86 = 'C:\\Program Files (x86)\\Apache Software Foundation\\CouchDB\\bin\\erl.exe';
    var erlPath = 'C:\\Program Files\\Apache Software Foundation\\CouchDB\\bin\\erl.exe';

    win_bin = process.arch === 'x86' ? erlPath_x86 : erlPath;

    if (!fs.existsSync(win_bin)) {
      win_bin = undefined;
    }
  }

  var options = {
    stderr_file: args.stderr_file || path.join(prefix, 'couch.stderr'),
    stdout_file: args.stdout_file || path.join(prefix, 'couch.stdout'),
    ini_file: args.ini_file || path.join(prefix, 'couch.ini'),
    default_sys_ini: args.default_sys_ini || system_couch.default_ini || '/usr/local/etc/couchdb/default.ini',
    pid_file: args.pid_file || prefix + '/couch.pid',
    couchdb_path: args.couchdb_path || win_bin || system_couch.bin,
    respawn: args.respawn === undefined ? 5: args.respawn
  };

  var iniContent = {
    couchdb: {
      database_dir: args.db_dir || prefix,
      view_index_dir: args.index_dir || args.db_dir || prefix,
      uri_file: args.uri_file || path.join(prefix, 'couch.uri')
    },
    httpd: {
      port: args.port || 8080
    },
    log: {
      file: args.log_file || path.join(prefix, 'couch.log')
    },
    couch_httpd_auth: {
      timeout: args.session_timeout || 600
    }
  };

  this.start = function () {
    // do the start
    var out = fs.openSync(options.stdout_file, 'a');
    var err = fs.openSync(options.stderr_file, 'a');

    if (fs.existsSync(options.ini_file)) {
      var oldIni = ini.parse(fs.readFileSync(options.ini_file, 'utf8'));

      // Merge the old and the new
      for (var i in iniContent) {
        if (i in oldIni) {
          for (var j in iniContent[i]) {
            oldIni[i][j] = iniContent[i][j];
          }
        } else {
          oldIni[i] = iniContent[i];
        }
      }

      iniContent = oldIni;
    }

    fs.writeFileSync(options.ini_file, ini.stringify(iniContent));

    var args;

    if (process.platform === 'win32') {
      args = [
        '-sasl', 'errlog_type', 'error',
        '-couch_ini', '../etc/couchdb/default.ini', options.ini_file,
        '-s', 'couch',
        '+A', '4', '+W', 'w',
        '-pidfile', options.pid_file,
        '-detached'
      ];

      couch = spawn(path.join(path.dirname(options.couchdb_path), 'erl.exe'), args, {
        stdio: ['ignore', out, err],
        env: process.env,
        detached: true,
        cwd: path.dirname(options.couchdb_path)
      });

      couch.unref();

    } else {
      args = [
        '-b',
        '-o ' + options.stdout_file,
        '-e ' + options.stderr_file,
        '-p ' + options.pid_file,
        '-n', // reset config file chain
        '-a ' + options.default_sys_ini, // re add system default
        '-a ' + options.ini_file
      ];

      if (options.respawn) {
        args.unshift('-r ' + options.respawn);
      }

      couch = spawn(options.couchdb_path, args, {
        stdio: ['ignore', out, err],
        env: process.env
      });

    }

    this.emit('start');
  };

  this.stop = function () {
    // do the stop
    if (process.platform === 'win32') {
      process.kill(fs.readFileSync(options.pid_file, { encoding: 'utf8' }));
    } else {
      var out = fs.openSync(options.stdout_file, 'a');
      var err = fs.openSync(options.stderr_file, 'a');

      couch = spawn(options.couchdb_path, [
        '-d',
        '-p ' + options.pid_file + ''
      ], {
        stdio: ['ignore', out, err],
        env: process.env
      });
    }
    this.emit('stop');
  };
}

module.exports = MultiCouch;


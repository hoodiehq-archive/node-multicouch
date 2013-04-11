var events = require("events");
var util = require("util");
var fs = require("fs");
var spawn = require("child_process").spawn;
var which = require("which").sync;

function MultiCouch(args) {
  events.EventEmitter.call(this);
  var prefix = args.prefix || "/tmp";
  var options = {
    port: args.port || 8080,
    db_dir: args.db_dir || prefix,
    index_dir: args.index_dir || args.db_dir || prefix,
    log_file: args.log_file || prefix + "/couch.log",
    uri_file: args.uri_file || prefix + "/couch.uri",
    stderr_file: args.stderr_file || prefix + "/couch.stderr",
    stdout_file: args.stdout_file || prefix + "/couch.stdout",
    ini_file: args.ini_file || prefix + "/couch.ini",
    default_sys_ini: args.default_sys_ini || "/usr/local/etc/couchdb/default.ini",
    pid_file: args.pid_file || prefix + "/couch.pid",
    couchdb_path: args.couchdb_path || which("couchdb"),
    respawn: args.respawn === undefined ? 5: args.respawn
  };

  this.start = function() {
    // do the start
    var out = fs.openSync(options.stdout_file, "a");
    var err = fs.openSync(options.stderr_file, "a");

    if(!fs.existsSync(options.ini_file)) {
      var ini = [
        "[couchdb]",
        "database_dir = " + options.db_dir,
        "index_dir = " + options.index_dir,
        "uri_file = " + options.uri_file,
        "[httpd]",
        "port = " + options.port,
        "[log]",
        "file = " + options.log_file,
        ""
      ].join("\n");
      fs.writeFileSync(options.ini_file, ini);
    }

    var args = [
      "-b",
      "-o " + options.stdout_file,
      "-e " + options.stderr_file,
      "-p " + options.pid_file,
      "-n", // reset config file chain
      "-a " + options.default_sys_ini, // re add system default
      "-a " + options.ini_file
    ];
    if (options.respawn) {
      args.unshift("-r " + options.respawn);
    }
    var couch = spawn(options.couchdb_path, args, {
      stdio: ["ignore", out, err],
      env: process.env
    });
    this.emit("start");
  }

  this.stop = function() {
    // do the stop
    var out = fs.openSync(options.stdout_file, "a");
    var err = fs.openSync(options.stderr_file, "a");
    var couch = spawn(options.couchdb_path, [
        "-d",
        "-p " + options.pid_file + ""
        ], {
        stdio: ["ignore", out, err],
        env: process.env
    });
    this.emit("stop");
  }
}

util.inherits(MultiCouch, events.EventEmitter);
module.exports = MultiCouch;


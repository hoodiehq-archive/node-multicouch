var events = require("events");
var util = require("util");
var fs = require("fs");
var spawn = require("child_process").spawn;

function MultiCouch(args) {
  events.EventEmitter.call(this);

  var options = {
    port: args.port || 8080,
    db_dir: args.db_dir || "/tmp",
    view_dir: args.view_dir || args.db_dir || "/tmp",
    log_file: args.log_file || "/tmp/couch.log",
    uri_file: args.uri_file || "/tmp/couch.uri",
    stderr_file: args.stderr_file || "/tmp/couch.stderr",
    stdout_file: args.stdout_file || "/tmp/couch.stdout",
    ini_file: args.ini_file || "/tmp/couch.ini",
    pid_file: args.pid_file || "/tmp/couch.pid",
    couchdb_path: args.couchdb_path || "/usr/local/bin/couchdb"
  };

  this.start = function() {
    // do the start
    var out = fs.openSync(options.stdout_file, "a");
    var err = fs.openSync(options.stderr_file, "a");

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

    var couch = spawn(options.couchdb_path, [
      "-b",
      "-r 5",
      "-o " + options.stdout_file,
      "-e " + options.stderr_file,
      "-p " + options.pid_file,
      "-a " + options.ini_file
      ], {
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
        "-p " + options.pid_file
        ], {
        stdio: ["ignore", out, err],
        env: process.env
    });
    this.emit("stop");
  }
}

util.inherits(MultiCouch, events.EventEmitter);
module.exports = MultiCouch;

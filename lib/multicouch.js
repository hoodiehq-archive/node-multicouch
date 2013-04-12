var events = require("events");
var util = require("util");
var fs = require("fs");
var path = require("path");
var os = require("os");
var spawn = require("child_process").spawn;
var exec = require("child_process").exec;
var which = require("which").sync;

function MultiCouch(args) {
  events.EventEmitter.call(this);
  var prefix = args.prefix || process.platform === "win32" ? process.env["TEMP"] : "/tmp";
  var win_ini, win_bin;
  if (process.platform === "win32") {
    process.env["ERL"] = "erl.exe"; // defaults to werl, which is gui
    win_ini = process.arch == "x64" ? '"C:\\Program Files (x86)\\Apache Software Foundation\\CouchDB\\etc\\couchdb\\default.ini"' : '"C:\\Program Files\\Apache Software Foundation\\CouchDB\\etc\\couchdb\\default.ini"';  // Ugh, must be a better way.
    win_bin = process.arch == "x64" ? 'C:\\Program Files (x86)\\Apache Software Foundation\\CouchDB\\\\bin\\couchdb.bat' : 'C:\\Program Files\\Apache Software Foundation\\CouchDB\\bin\\couchdb.bat'; // OH GOD WHY THE BACKSLASHES THEY BURN. couch doesnt even add itself to the path. This sucks.
  }
  var options = {
    port: args.port || 8080,
    db_dir: args.db_dir || prefix,
    index_dir: args.index_dir || args.db_dir || prefix,
    log_file: args.log_file || path.join(prefix,"couch.log"),
    uri_file: args.uri_file || path.join(prefix,"couch.uri"),
    stderr_file: args.stderr_file || path.join(prefix,"couch.stderr"),
    stdout_file: args.stdout_file || path.join(prefix,"couch.stdout"),
    ini_file: args.ini_file || path.join(prefix,"couch.ini"),
    default_sys_ini: args.default_sys_ini || win_ini || "/usr/local/etc/couchdb/default.ini",
    pid_file: args.pid_file || prefix + "/couch.pid",
    couchdb_path: args.couchdb_path || win_bin || which("couchdb"),
    respawn: args.respawn || 5
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
      ].join(os.EOL);
      fs.writeFileSync(options.ini_file, ini);
    }

    var args = [
      "-b",
      "-o " + options.stdout_file,
      "-e " + options.stderr_file,
      "-p " + options.pid_file,
      "-n", // reset config file chain
      //"-a " + options.default_sys_ini, // re add system default
      "-a " + options.ini_file
    ];
    if (options.respawn) {
      args.unshift("-r " + options.respawn);
    }
    console.log(args);
    var argsj = args.join(" ");
    var couch = spawn(options.couchdb_path, args, {
      stdio: ["ignore", out, err],
      env: process.env
    });
    // var couch = exec(options.couchdb_path + " " + argsj, {
    //    stdio: ["ignore", process.stdout, process.stderr/*out, err*/],
    //    env: process.env
    // });
    this.emit("start");
  };

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
  };
}

util.inherits(MultiCouch, events.EventEmitter);
module.exports = MultiCouch;


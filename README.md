# Multi-Couch

Launch multiple CouchDBs from the same installation, programmaticly 
or from the command line.


## What?

You can have many reasons for running more than one instance of the same CouchDB installation. Maybe you are developing multiple apps, and would like an instance per app, or you are just plain daring.

CouchDB allows you to run multiple separate instances from the same installation. So in iaddition to the default installation you can launch more.

To do that, you will need to adjust a few configuration variables. Namly:

 * The TCP port to bind to.
 * The database directory.
 * The view directory.
 * The log file.
 * The URI file.


## How?

To do this, we create a new CouchDB config file that includes all the values and start CouchDB with the default config files and this special one as well.


## Usage

From Node:

    var MultiCouch = require("multicouch");
    var my_couch = new MultiCouch({
      port: 8080,
      prefix: "/tmp"
      // view_dir: "/tmp", // same as db_dir when ommitted
      // log_file: "/tmp/couch.log",
      // uri_file: "/tmp/couch.uri"
      });
    
    my_couch.start();

    my_couch.stop();

    my_couch.on("start", function() {
      console.log("CouchDB started.");
      });

    my_couch.on("stop", function() {
      console.log("CouchDB stopped.");
      });

    my_couch.on("error", function(error) {
      console.log("CouchDB errored '%s'.", error);
      });


From the CLI:

    TBD


## License

Apache License 2.0


## Copyright

(c) 2013 Jan Lehnardt <jan@apache.org>

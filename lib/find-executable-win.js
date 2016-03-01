"use strict";

/***********************************************************************
* This file contains one possible solution to the problem of
* finding the correct CouchDB Installation Path under Win32.
* If you find a better solution (for example, a more idiomatic one),
* please, replace this code. Also, don't forget to replace and/or adjust
* the 'other half' residing at the top of 'multicouch.js'.
*************************************************************************

/*********************************************************************
*
* Original idea by @Acconut (https://github.com/Acconut)
* Issue thread: https://github.com/hoodiehq/node-multicouch/issues/26
*
***********************************************************************/

var exec = require("child_process").exec;
var os   = require("os");

/**
 * Surrogate function that returns 'promisified' exec commands
 *
 * @param {string} command DOS-Command to be executed by child_process.exec().
 * @return {object} Promise that resolves to {stdout,stderr} or rejects with (err).
 */
var surrogate = function(command) {
  return new Promise(function(resolve, reject){
        exec(command, null,
            function(err, stdout, stderr) {
        if(!err){
          resolve({ stdout: stdout,
                stderr: stderr });
        } else {
          reject(err);
        }
    });
  });
};

/**
 * Returns the Win32 Registry RegKey for current architecture
 *
 * @return {string} Win32 Registry Hive Key
 */
var getRegKey = function(){
  var key_x86 = "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ApacheCouchDB_is1";
  var key_x64 = "HKEY_LOCAL_MACHINE\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ApacheCouchDB_is1";

  // Use different key on 64-bit Windows
  if(os.arch() == "x64") {
      return key_x64;
  }
  return key_x86;
}

/**
 * Calls the surrogate function to create a new Promise containing the
 * execution of the 'reg query' command.
 *
 * IMPORTANT: Do not call this function directly as it can only be
 *            called once, at the 'require' of this module.
 *
 * @return {object} Promise that resolves to {stdout,stderr} or catches
 * the exception which effectively stops any data forwarding.
 */
var findInstallPathInternal = function(){
  var cmd = 'reg query ' + getRegKey() + ' /v "Inno Setup: App Path"';
  return surrogate(cmd).then(function(data){
      return new Promise(function(resolve, reject){
        resolve(data);
      });
    }).catch(function(err){
      console.error('Could not find path: ' + err);
  });
}

//Execute the above function at the 'require' of this module.
//This will kick off the execution of the 'reg key' command
//and return a new Promise containing {stdout, stderr}-structure.
var internalPromise = findInstallPathInternal();

/**
 * Chains the 'internalPromise' by using a manually created
 * Promise.resolve() which by default processes a 'thenable'
 * object returned from 'surrogate'. The second object
 * in chain is the Promise containing {stdout,stderr}-structure.
 * Only the 'stdout'-content is being forwarded to callback
 * from 'multicouch.js'
 *
 * NOTICE: This function executes only under Win32.
 *
 * @return {string} Content in 'stdout' or null if not running Win32
 */
var findInstallPath = function(cb){
  if (process.platform === "win32") {
    var seq = Promise.resolve();
    return seq.then(function(){
      return internalPromise;
    }).then(function(data){
      cb(data.stdout);
    });
  }else{
    cb(null);
  }
}

module.exports = {
  findInstallPath : findInstallPath
}

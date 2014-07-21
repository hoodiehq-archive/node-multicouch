module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-release-hoodie');

  grunt.initConfig({
    release: {
      options: {
        bump: {
          files: ['package.json']
        },
        tasks: ['changelog']
      }
    }
  });

  grunt.registerTask('ci', ['integration-test']);
};

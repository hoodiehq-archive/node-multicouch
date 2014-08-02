module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-release-hoodie');
  grunt.registerTask('ci', ['integration-test']);
};

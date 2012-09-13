module.exports = function(grunt) {

  var exec = require('child_process').exec,
      fs = require('fs');

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('commandline', 'Shell command line tool.', function() {
    var data = this.data,
        done = this.async();
    if (!data.cmd) {
      grunt.log.error('' +
          '/!\\'.red +
          ' Set the build parameter ' + 'cmd'.red +
          ' and\nmake it point to your root of python scripts.' +
          '\n');
      return false;
    }

    var command = data.cmd;

    grunt.log.writeln(command);
    // process data.
    exec(command, function(err, stdout, stderr) {
      if (err) {
        grunt.warn(err);
        done(false);
      }

      if (stdout) {
        grunt.log.writeln(stdout);
      }

      done();
    });

  });
};

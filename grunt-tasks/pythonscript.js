module.exports = function(grunt) {

  var exec = require('child_process').exec,
      fs = require('fs');

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('pythonscript', 'Python script processing JS files to separate export from externals.', function() {

    var pythonScriptPath = '',
        reportFile = '',
        data = this.data,
        done = this.async();

    // Check for python script path.
    if (data.script) {
      pythonScriptPath = data.script;
    } else {
      grunt.log.error('' +
          '/!\\'.red +
          ' Set the build parameter' + 'pythonScriptPath'.red +
          ' and\nmake it point to your root of python scripts.' +
          '\n');
      return false;
    }

    var command = 'python ' + pythonScriptPath + ' ';

    if (!data.src || !data.dst) {
      // This task requires at least one file
      grunt.warn('Missing src property.');
      return false;
    }

    // Build command line.
    command += data.src + ' ' + data.dst;

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

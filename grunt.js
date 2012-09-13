module.exports = function(grunt) {

  var projectFiles = [
            'dm/dm/loader.js',
            'dm/ds/diagram.js',
            'dm/hs/framework.js',
            'dm/es/class.js',
/*            'dm/dm/loader.js',
            'dm/ds/base.js',
            'dm/ms/us/us.js',
            'dm/ms/ds/common.js',
//            'dm/es/*.js',
//            'dm/cs/*.js',
            'dm/ms/ctx/default.js',
            'dm/ms/ctx/class.js',
            'dm/ms/ctx/connector.js'
            */];

  // Project configuration.
   initProjectConfig = {
  'commandline': {
      init_externals: {
          cmd: "cp -f obfuscator/jquery_ext.js diagrammer/externals.js",
      },
      create_dirs: {
          cmd: "mkdir -p viewer && cp -rf diagrammer/* viewer/ && mkdir -p editor && cp -rf diagrammer/* editor/",
      },
      clean: {
          cmd: "rm -rf viewer editor",
      },
      sync_viewer_externals: {
        cmd: "cat externals_ext.js >> viewer/externals.js",
      },
  },
  'pythonscript': {
  },
  'closure-compiler': {
  },

  concat: {
    dist: {
      src: ['./diagrammer/dm/ds/diagram.js',
            './diagrammer/dm/dm/loader.js',
            './diagrammer/dm/ds/base.js',
            './diagrammer/dm/hs/framework.js',
            './diagrammer/dm/ms/us/us.js',
            './diagrammer/dm/ms/ds/common.js',
            './diagrammer/dm/es/*.js',
            './diagrammer/dm/cs/*.js',
            './diagrammer/dm/ms/ctx/default.js',
            './diagrammer/dm/ms/ctx/class.js',
            './diagrammer/dm/ms/ctx/connector.js'],
      dest: 'diagrammer/built.js'
    },
    connectors: {
      src: ['./diagrammer/dm/cs/*.js',],
      dest: 'diagrammer/built_cont.js'
    }
  },
  jshint: {
      options: {
        browser: true
      }
    }
};

  var defaultTasks = ' ';

  var expandedListOfFiles = new Array();

  for (p in projectFiles) {
           var file = "viewer/" + projectFiles[p],
            severalFiles = grunt.file.expandFiles(file);
          if (severalFiles.length > 0) {
              expandedListOfFiles = expandedListOfFiles.concat(severalFiles)
          } else {
              expandedListOfFiles.push(file)
          }
  }

  projectFiles = expandedListOfFiles;

  var taskPP0 = "commandline:init_externals commandline:create_dirs";

  for (p in projectFiles) {
      var file = projectFiles[p],
          cutext = file.substring(0,file.length-2);
      taskPP0 += " pythonscript:pre0"+ file;
      initProjectConfig['pythonscript']["pre0" + file] =  {
        src: projectFiles[p],
        dst: "VIEWER",
        script: 'obfuscator/scripts/preprocessor0.py',
      };

      // pre-processor target
      initProjectConfig['pythonscript']["pre" + file] =  {
        src: projectFiles[p],
        dst: cutext + "pre.js",
        script: 'obfuscator/scripts/preprocessor.py',
      };

      // post-processor target
      initProjectConfig['pythonscript']["post" + file] =  {
        src: cutext + "min.a.js",
        dst: cutext + "min.js",
        script: 'obfuscator/scripts/postprocessor.py',
      };

      // closure compiler target
      initProjectConfig['closure-compiler'][file] = {
        closurePath: 'obfuscator/3pp-closure-compiler/',
        js: cutext + "pre.js",
        jsOutputFile: cutext + "min.a.js",
        options: {
            compilation_level: 'ADVANCED_OPTIMIZATIONS',
            language_in: 'ECMASCRIPT5_STRICT',
            externs: 'viewer/externals.js',
        }
      };

      defaultTasks += ' pythonscript:pre' + file;
      defaultTasks += ' closure-compiler:' + file;
      defaultTasks += ' pythonscript:post' + file;
      defaultTasks += ' commandline:sync_viewer_externals';
  }

  grunt.initConfig(initProjectConfig);
  
  grunt.loadTasks('./grunt-tasks/');
  
  // Load tasks from "grunt-sample" grunt plugin installed via Npm.
  //grunt.loadNpmTasks('grunt-sample');
  grunt.loadNpmTasks('grunt-closure-compiler');

  // Default task.
  grunt.registerTask('viewer', taskPP0);
  grunt.registerTask('default', taskPP0 + defaultTasks);

  // Clean task
  grunt.registerTask('clean', 'commandline:clean');
};

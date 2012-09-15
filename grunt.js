module.exports = function(grunt) {

  var editorFiles = [
            'dm/dm/loader.js',
            'dm/ds/diagram.js',
            'dm/hs/framework.js',
            'dm/ms/ds/common.js',
            'dm/es/class.js',
            'dm/es/note.js',
            'dm/es/interface.js',
            'dm/es/component.js',
            'dm/es/package.js',
            'dm/es/image.js',
            'dm/es/objinstance.js',
            'dm/es/port.js',
'dm/cs/aggregation.js',
'dm/cs/generalization.js',
'dm/cs/nested.js',
'dm/cs/anchor.js',
'dm/cs/iobserver.js',
'dm/cs/association.js',
'dm/cs/realization.js',
'dm/cs/selfassociation.js',
'dm/cs/dependency.js',
/*   dm/cs/lifeline.js        dm/cs/onetoone.js
dm/cs/bitransition.js  dm/cs/llselfcall.js      
dm/cs/composition.js   dm/cs/llsequence.js      
    dm/cs/manytomany.js      dm/cs/transition.js
'./dm/cs/onetomany.js'*/
            'dm/ds/base.js',
            'dm/ds/sequence.js',
/*            'dm/ms/us/us.js',
/*            'dm/es/*.js',
            'dm/ms/ctx/default.js',
            'dm/ms/ctx/class.js',
            'dm/ms/ctx/connector.js'*/
            ];

  var viewerFiles = [
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

  for (p in editorFiles) {
           var file = "editor/" + editorFiles[p],
            severalFiles = grunt.file.expandFiles(file);
          if (severalFiles.length > 0) {
              expandedListOfFiles = expandedListOfFiles.concat(severalFiles)
          } else {
              expandedListOfFiles.push(file)
          }
  }

  editorFiles = expandedListOfFiles;

  var taskPP0 = "commandline:init_externals commandline:create_dirs";

  for (p in expandedListOfFiles) {
      var file = expandedListOfFiles[p],
          cutext = file.substring(0,file.length-2);
      taskPP0 += " pythonscript:pre0"+ file;
      initProjectConfig['pythonscript']["pre0" + file] =  {
        src: expandedListOfFiles[p],
        dst: "EDITOR",
        script: 'obfuscator/scripts/preprocessor0.py',
      };

      // pre-processor target
      initProjectConfig['pythonscript']["pre" + file] =  {
        src: expandedListOfFiles[p],
        dst: cutext + "pre.js",
        script: 'obfuscator/scripts/preprocessor.py',
      };

      // post-processor target
      initProjectConfig['pythonscript']["post" + file] =  {
        src: cutext + "min.a.js",
        dst: cutext + "min.js",
        script: 'obfuscator/scripts/postprocessor0.py',
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
  grunt.registerTask('editor', taskPP0);
  grunt.registerTask('default', taskPP0 + defaultTasks);

  // Clean task
  grunt.registerTask('clean', 'commandline:clean');
};

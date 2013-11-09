module.exports = function(grunt) {

  var editorFiles = [
// Base files
            'dm/dm/loader.js',
            'dm/ds/diagram.js',
            'dm/hs/framework.js',
            'dm/ms/ds/common.js',
            'dm/ms/us/us.js',
// Elements
            'dm/es/class.js',
            'dm/es/note.js',
            'dm/es/interface.js',
            'dm/es/component.js',
            'dm/es/package.js',
            'dm/es/image.js',
            'dm/es/objinstance.js',
            'dm/es/port.js',
// Connectors
'dm/cs/aggregation.js',
'dm/cs/generalization.js',
'dm/cs/nested.js',
'dm/cs/anchor.js',
'dm/cs/iobserver.js',
'dm/cs/association.js',
'dm/cs/realization.js',
'dm/cs/selfassociation.js',
'dm/cs/dependency.js',
// Diagram extentions
            'dm/ds/base.js',
            'dm/ds/sequence.js',
// Context menu for elements
            'dm/ms/ctx/default.js',
            'dm/ms/ctx/sequence.js',
            'dm/ms/ctx/entity.js',
            'dm/ms/ctx/stereotype.js',
            'dm/ms/ctx/connector.js'

// Postponed connectors
/*   dm/cs/lifeline.js        dm/cs/onetoone.js
dm/cs/bitransition.js  dm/cs/llselfcall.js      
dm/cs/composition.js   dm/cs/llsequence.js      
    dm/cs/manytomany.js      dm/cs/transition.js
'./dm/cs/onetomany.js'*/
            ];

  var viewerFiles = [
            'dm/dm/loader.js',
            'dm/ds/diagram.js',
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
      create_dirs: {
          cmd: "mkdir -p viewer",
      },
      clean: {
          cmd: "rm -rf viewer",
      },
  },
  'pythonscript': {
  },

  concat: {
    dist: {
      src: ['./viewer/dm/ds/diagram.js',
            './viewer/dm/dm/loader.js',
            './viewer/dm/ds/base.js',
            './viewer/dm/es/*.js',
            './viewer/dm/cs/*.js'
            ],
      dest: 'viewer/built.js'
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

  for (p in viewerFiles) {
           var file = "editor/" + editorFiles[p],
            severalFiles = grunt.file.expandFiles(file);
          if (severalFiles.length > 0) {
              expandedListOfFiles = expandedListOfFiles.concat(severalFiles)
          } else {
              expandedListOfFiles.push(file)
          }
  }

  editorFiles = expandedListOfFiles;

  var taskPP0 = "commandline:create_dirs";

  for (p in expandedListOfFiles) {
      var file = expandedListOfFiles[p],
          cutext = file.substring(0,file.length-2);
      taskPP0 += " pythonscript:pre0"+ file;
      initProjectConfig['pythonscript']["pre0" + file] =  {
        src: expandedListOfFiles[p],
        dst: "EDITOR",
        script: 'obfuscator/scripts/preprocessor0.py',
      };

/*      initProjectConfig['commandline'][file] = {
        cmd: 'cat ./obfuscator/license.txt > ' + file +' && cat ' + cutext + "min.js >> " + file
             + ' &&rm -f ' + cutext + "pre.js " + cutext + "min.a.js " + cutext + "min.js"
             + ' &&rm -f ' + cutext + "min.a.js.report.txt "
      };
*/
      defaultTasks += ' commandline:' + file;
  }

  grunt.initConfig(initProjectConfig);
  
  grunt.loadTasks('./grunt-tasks/');
  
  // Load tasks from "grunt-sample" grunt plugin installed via Npm.
  //grunt.loadNpmTasks('grunt-sample');
  //grunt.loadNpmTasks('grunt-closure-compiler');

  // Default task.
  grunt.registerTask('viewer', taskPP0);
//  grunt.registerTask('default', taskPP0 + defaultTasks);

  // Clean task
  grunt.registerTask('clean', 'commandline:clean');
};

//
//  UMLSync diagramming
//  A showdown extension to replace an external references on local
//

(function(){

    var umlsync = function(converter) {
        return [
            { type: 'output', filter: function(source){

                return source.replace(/(<img [^>]*alt="Diagram:([^"]*)"[^>]*>)/gi, function(match) {
                    var s = match.split(" "),
                    isDiagram = false,
                    repo = branch = path = title = "";

                    for (var i in s) {
                      // Check that it is diagram:
                      if (s[i].indexOf('alt="') == 0) {
                        if (s[i].indexOf('alt="Diagram:') == 0) {
                          isDiagram = true;
                        }
                        else {
                          break;
                        }
                      }

                      // Detect soruce type
                      if (s[i].indexOf('src="') == 0) {
                        // Check if it is correct reference
                        if (s[i].indexOf('src="http://umlsync.org/github') != 0) {
                          isDiagram = false;
                          break;
                        }

                        // relative path: http://umlsync.org/github?path=../../path/to/file.umlsync
                        var relPath = 'src="http://umlsync.org/github?';
                        if (s[i].indexOf(relPath) == 0) {
                          // remove "path=" prefix too
                          path = ' path="' + s[i].substr(relPath.length + 5, s[i].length - relPath.length);
                        }

                        // absolute path:
                        var absPath = 'src="http://umlsync.org/github/%user%/%repo%/blob/%master%/path';
                        if (s[i].indexOf(absPath) == 0) {
                          var sp = s[i].substr(absPath.length, s[i].length - absPath.length -1).split("/");

                          // Check that it is blob
                          if (sp[2] != "blob") {
                            isDiagram = false;
                            break;
                          }
                          repo = ' repo="'+ sp[0] + '/' + sp[1] + '"';
                          branch = ' branch="'+ sp[3] +'"';
                        }

                      }

                      // Copy title as is:
                      if (s[i].indexOf('title="') == 0) {
                        title = " " + s[i];
                      }
                    }
                    
                    if (isDiagram) {
                      return '<div id="ClassInheritanceExample"\
                         class="pack-diagram" ' + branch + repo + path + title+'></div>'
                    }
                    
                    return match;
                });
            }}
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.umlsync = umlsync; }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = umlsync;

}());

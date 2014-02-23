//
//  UMLSync diagramming
//  A showdown extension to replace an external references on local
//

(function(){

    var umlsync = function(converter) {
        return [
            { type: 'output', filter: function(source){

                return source.replace(/(<img [^>]*alt="mime-type:application\/vnd.umlsync.([^"]*)"[^>]*>)/gi, function(match) {
                    var s = match.split(" "),
                    isDiagram = false,
                    repo = branch = path = title = "";
					var style, width = "", height = "";

                    for (var i in s) {
                      // Check that it is diagram:
                      if (s[i].indexOf('alt="') == 0) {
					    var si = s[i];
					    var alt = si.substr(5, si.length -6);
						var alts = alt.split(";");
						
						for (var v in alts) {
                          if ((alts[v] == "mime-type:application/vnd.umlsync.json")
						    || (alts[v] == "mime-type:application/vnd.umlsync.svg")) {
                            isDiagram = true;
						  }
						  else if (alts[v].indexOf("width:") == 0) {
						    var sss = alts[v].split(":");
							var w = parseInt(sss[1]);
						    style = style ? style + "width:"+w+";" : 'style="' + "width:"+w+";";
							width = ' width="'+w+'px" ';
						  }
						  else if (alts[v].indexOf("height:") == 0) {
						    var sss = alts[v].split(":");
							var h = parseInt(sss[1]);
						    style = style ? style + "height:"+h+";" : 'style="' + "height:"+h+";";
							height = ' height="'+h+'px" '
						  }
                        }
						if (!isDiagram) {
						  return match;
						}
						style = style ? style + '"': '';
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
                      return '<div id="umlsync-embedded-content"\
                         class="umlsync-embedded-diagram" ' + branch + repo + path + title+style+width+height+'></div>'
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

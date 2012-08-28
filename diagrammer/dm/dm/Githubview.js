/*
Class: GithubView

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2012 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  umlsync.org/about

Version:
  2.0.0 (2012-07-22)
 */
//@aspect
(function($, dm, undefined) {

    dm.base.GithubView = function(url) {
        function treeView(data, textStatus, jqXHR) {
              //the variable 'data' will have the JSON object
              // In your example, the following will work:
                if (data['data']) {
                  var ret = [];
                  var json = data['data'];
                  for (j in json["tree"]) {
                    ret[j] = {};
                    if (json["tree"][j]["type"] == "blob") {
                        ret[j]["isFolder"] = false;
                        ret[j]["isLazy"] = false;
                        ret[j]["title"] = json["tree"][j]["path"];
                        ret[j]["sha"] = json["tree"][j]["sha"];
                    } else if (json["tree"][j]["type"] == "tree") {
                        ret[j]["isFolder"] = true;
                        ret[j]["isLazy"] = true;
                        ret[j]["title"] = json["tree"][j]["path"];
                        ret[j]["sha"] = json["tree"][j]["sha"];
                    }
                  }
                  return ret;
                }
              return data;
        };
        
        function decodeContent(data, textStatus, jqXHR, callback) {
          for (d in data) {
            if (d == 'data') {
               var splitted = data[d].content.split('\n');
               var decoded = "";
               for (s in splitted) {
                 decoded += $.base64.decode(splitted[s]);
               }
               var json = $.parseJSON(decoded);
			   if (callback) callback(json);
            }
          }
        };

        var pUrl = url;
        var self = {
		    euid: "Github",
            // Check if loging required
            init: function() {
            },
            info: function(callback) {
                // TODO: define github view capabilities
                //       right now only view available
                if (callback)
                    callback(null);
            },
		    'save': function(path, data, description) {
              alert(description);
		    },
			'loadDiagram': function(node, callback) {
			  if (node && node.data && node.data.sha) {
		        $.ajax({
		          url: 'https://api.github.com/repos/EvgenyAlexeyev/umlsync/git/blobs/'+node.data.sha,
                  accepts: 'application/vnd.github-blob.raw',
			      dataType: 'jsonp',
                  success: function(x, y, z) {decodeContent(x,y,z,callback.success);},
			      error:callback.error
		        });
			  }
			},
			'ctx_menu': {
			   "Reload": function(node) {
			      node.reloadChildren();
			   },
			   "Open": function(node) {
			     // TODO: REMOVE THIS COPY_PAST OF tree.onActivate !!!
                 if ((!node.data.isFolder)
                        && (node.data.title.indexOf(".json") != -1)) {
					dm.dm.fw.loadDiagram(self.euid, node);
                    /*$.ajax({
                        accepts: 'application/vnd.github-blob.raw',
                        dataType: 'jsonp',
                        url: 'https://api.github.com/repos/EvgenyAlexeyev/umlsync/git/blobs/'+node.data.sha,
                        success: decodeContent,
                        error: function(jqXHR, textStatus, errorThrown) {
                           //Error handling code
                           alert('Oops there was an error');
                        },
                    });*/
				 }
			   },
			   "Save": function(node) {
			   },
			   "New folder": function(node) {
			     this.newfolder(node.getAbsolutePath(), "newFolder", function(desc) {node.addChild(desc);});
			   },
			   "Remove": function(node) {
			     this.remove(node.getAbsolutePath(), function() {node.remove();});
			   }
			},
            tree: {
                persist: true,
                initAjax: {
                    url: pUrl + 'git/trees/master',
                    dataType:"jsonp",
                    postProcess: treeView
                },
                onCreate: function(node, span){
                   $(span).bind('contextmenu', function(e) {
				     var node = $.ui.dynatree.getNode(e.currentTarget);
					 dm.dm.fw.ShowContextMenu("Github", e, node);
					 e.preventDefault();
				   });
                },
                onLazyRead: function(node){
                    if (node.data.isFolder)
                        node.appendAjax({url: "https://api.github.com/repos/EvgenyAlexeyev/umlsync/git/trees/" + node.data.sha,
                               postProcess: treeView,
                               dataType:"jsonp"});
                },
                onActivate: function(node) {
                    if ((!node.data.isFolder)
                        && (node.data.title.indexOf(".json") != -1))
						dm.dm.fw.loadDiagram(self.euid, node);
                },
            },
        };
		return self;
    };
//@aspect
})(jQuery, dm);


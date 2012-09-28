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
    


    dm.base.GithubView = function(url, token) {
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

    function _request(method, path, data, cb, raw) {
	function getURL() {
	    var url = path;
	    return url + ((/\?/).test(url) ? "&" : "?") + (new Date()).getTime();
	}
	var xhr = new XMLHttpRequest();
	
	if (!raw) {xhr.dataType = "json"}

	xhr.open(method, getURL());
	xhr.onreadystatechange = function () {
	    if (this.readyState == 4) {
		if (this.status >= 200 && this.status < 300 || this.status === 304) {
		    cb(null, raw ? this.responseText : this.responseText ? JSON.parse(this.responseText) : true);
		} else {
		    cb({request: this, error: this.status});
		}
	    }
	}

	xhr.setRequestHeader('Accept','application/vnd.github.raw');
	xhr.setRequestHeader('Content-Type','application/json');
/*	if (
	(options.auth == 'oauth' && options.token) ||
	(options.auth == 'basic' && options.username && options.password)
	) {*/
	    xhr.setRequestHeader('Authorization', 'token'+token);
//	    options.auth == 'oauth'
//	    ? 'token '+ options.token
	    //: 'Basic ' + Base64.encode(options.username + ':' + options.password)
//	    );
	//}
	data ? xhr.send(JSON.stringify(data)) : xhr.send();
    }         
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
			  $.ajax({
				url: 'https://api.github.com/user/repos',
                  dataType: 'jsonp',
                  success: function(mdata) {
                       var data = mdata.data;
					
					  data = [{name:"umlsync",
					           full_name:"EvgenyAlexeyev/umlsync",
							   url: "https://api.github.com/repos/EvgenyAlexeyev/umlsync",
							   private: false}];
					
                    dm.dm.dialogs['SelectRepoDialog'](data, function(repo) {
				      var IGhView = new dm.base.GithubView(repo, "{{ access_token }}");
				      dm.dm.fw.addView2('Github', IGhView);
				    });
  			  }
			  });
            },
            info: function(callback) {
                // TODO: define github view capabilities
                //       right now only view available
                if (callback)
                    callback(null);
            },
		    'save': function(path, data, description) {
			var content = data;
			alert("SAVE:" + data);
			//if (typeof(content) === "string") {
content = {
"content": content,
"encoding": "utf-8"
};
//} 
			_request("POST", pUrl + "/git/blobs", content, function(err, res) {
			    if (err) { alert("ERR:" + err);} else 
			    alert("SHA:" + res.sha);
			}); 
			
  /*            $.ajax({"url":"https://api.github.com/repos/EvgenyAlexeyev/umlsync/git/blobs?access_token=" + token,
		      "type":"post",
		      "data":{"content" : data,
			      "encoding": "utf-8"},
		      "success":function(response) {
			  $.RRRRRRRRRRTTTTTTTTTTTTT = reponse;
			  alert(response);
			  alert(response.sha);
			  alert(response.url);
		       },
		       "error" : function() { 
			   alert("FAILED to create blob 1");},
		      });*/
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
                    url: pUrl + '/git/trees/master',
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
                        node.appendAjax({url: pUrl + "/git/trees/" + node.data.sha,
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


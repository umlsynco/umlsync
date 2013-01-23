/**
Class: GithubView

Copyright (c) 2012-2013 UMLSync. All rights reserved.

URL:
  umlsync.org/about

 */
//@aspect
(function($, dm, undefined) {
  dm.base.GithubViewsManager = function(username, access_token, url) {
    // local web site mode
	var isLocal = true; //(url != undefined);
	var ISelectionObserver = this;
	var viewsMap = {};

    function github() {
	  // create singletone object. It is not possible to have two access tokens
	  if (dm.dm.github == undefined) {
        dm.dm.github = new Github({
          token: access_token,
          auth: "oauth"
        });
	  }
	  return dm.dm.github;
    };

    function processTree(data) {
      if (data) {
        $.log(data);
        var ret = [];
        for (j in data["tree"]) {
          ret[j] = {};
          if (data["tree"][j]["type"] == "blob") {
            ret[j]["isFolder"] = false;
            ret[j]["isLazy"] = false;
            ret[j]["title"] = data["tree"][j]["path"];
            ret[j]["sha"] = data["tree"][j]["sha"];
            ret[j]["url"] = data["tree"][j]["url"];
          }
          else if (data["tree"][j]["type"] == "tree") {
            ret[j]["isFolder"] = true;
            ret[j]["isLazy"] = true;
            ret[j]["title"] = data["tree"][j]["path"];
            ret[j]["sha"] = data["tree"][j]["sha"];
          }
        }
        $.log("Processing ret ->", ret);
        return ret;
      }
      return data;
    };

	this.onRepoSelect = function(title, repo) {
      if (title == 'Yours') {
	    if (viewsMap[repo] == undefined) {
          dm.dm.fw.addView2(repo, new IGithubView(repo));
		}
		else {
		  dm.dm.fw.activateView(repo);
		}
	  }
	};

    this.init = function() {
      function showRepos(repos) {
	    dm.dm.fw.addRepositories("Yours", ISelectionObserver, repos);
      };

	  if (!isLocal) {
        var user = github().getUser();
        user.repos(function(err, repos){ showRepos({'Yours':repos}) });
	  }
	  else {
	    showRepos([{name:'umlsynco/diagrams'},
			      {name:'umlsynco/umlsync'},
				  {name:'kalaidin/octotest'},
				  {name: 'umlsynco/GIST'}]);
/*			{
			  'Yours': [ ],
			  'Follow': [{name:'absde/somethe'}],
			  'Starred': [{name:'absde/somethe'}],
			  'Search': [{name:'search/result'}]
			}
		);*/
	  }
    };
    
    var IGithubView = function (repoUrl) {
	  var pUrl = repoUrl;
	  var self = {
        euid: "Github",
		repo: pUrl,
        modifiedList: {}, // The list of modified files by sha
        info: function(callback) {
          // TODO: define github view capabilities
          // right now only view available
          if (callback)
            callback(null);
        },
        'save': function(path, data, description) {
          self.modifiedList[path] = data;
          $.log("Saving " + data.toString() + " on " + path.toString());
          //var repo = github().getRepo(username, pUrl.split('/').pop());
          //repo.write(
          //  'master',
          //  path.toString().substring(1),
          //  data.toString(),
          //  "Autosaving.",
          //  function(err) {}
          //);
        },
        'loadDiagram': function(node, callback) {
          if (node && node.data && node.data.sha) {
            $.log("loadDiagram()");
            $.log(node.data);
            $.log(node.data.url);
            $.log(node.data.title);
            var repo = github().getRepo(username, pUrl.split('/').pop());
            repo.getBlob(node.data.sha,
                function(err, data) {
              json = $.parseJSON(data);
              path = json["fullname"];
              if (self.modifiedList[path]) {
                json = self.modifiedList[path];
              }
              callback.success(json);
            });
          }
        },
        'ctx_menu': 
          [
           {
             title:"Commit...",
             click: function(node, view) {
             if (dm.dm.dialogs)
               dm.dm.dialogs['CommitDataDialog'](
                   view.modifiedList,
                   function(message, items) {
                     var path;
                     $.log("Commiting...");

                     repo = github().getRepo(username, pUrl.split('/').pop());

                     var contents = [];
                     for (path in items) {
                       $.log(path);
                       contents.push({
                         'path': path.toString().substring(1),
                         'content': items[path].toString()
                       });
                       // Remove from updated list
                       delete self.modifiedList[path];
                     };

                     // second call won't work as we need to update the tree
                     repo.multipleWrite('master', contents, message, function(err) {});
                   });
           }
           },
           {
             title:"Reload",
             click: function(node) {
             node.reloadChildren();
           }
           },
           {
             title:"Open",
             click: function(node) {
             // TODO: REMOVE THIS COPY_PAST OF tree.onActivate !!!
             if ((!node.data.isFolder)
                 && (node.data.title.indexOf(".json") != -1)) {
               dm.dm.fw.loadDiagram(self.euid, node);
             }
           }
           },
           {
             title: "Save",
             click:function(node) {
           },
           },
           {
             title:"New folder",
             click: function(node) {
             this.newfolder(
                 node.getAbsolutePath(),
                 "newFolder",
                 function(desc) { node.addChild(desc); }
             );
           }
           },
           {
             title:"Remove",
             click: function(node) {
             this.remove(
                 node.getAbsolutePath(),
                 function() {node.remove(); }
             );
           }
           }
           ],
           initTree: function (parentSelector) {
          function updateTree(tree) {
            $.log("updateTree()");
            datax = {};
            datax["tree"] = tree;
            real_tree = {}
            real_tree = processTree(datax);
            $(parentSelector).dynatree(
                {
                  persist: true,
                  children: real_tree,
                  onCreate: function(node, span) {
                  $.log("onCreate()");
                  $(span).bind('contextmenu', function(e) {
                    var node = $.ui.dynatree.getNode(e.currentTarget);
                    dm.dm.fw.ShowContextMenu("Github", e, node);
                    e.preventDefault();
                  });
                },
                onLazyRead: function(node) {
                  $.log("onLazyRead()");
                  if (node.data.isFolder) {
                    repo.getTree(node.data.sha, function(err, tree) {
                      datax = {};
                      datax["tree"] = tree;
                      real_tree = {}
                      real_tree = processTree(datax);
                      if (err) {
                        $.log("Failed to update SHA tree for a git repo: " + err);
                      }
                      else {
                        node.append(real_tree);
                      }
                    }); // getTree
                  }// IsFolder
                },
                onActivate: function(node) {
                  $.log("onActivate()");
                  if ((!node.data.isFolder)
                      && ((node.data.title.indexOf(".json") != -1)
                          || (node.data.title.indexOf(".umlsync") != -1)))
                    dm.dm.fw.loadDiagram(self.euid, node);
                }
                }
            );
          };
          // Reading a repository
          var repo = github().getRepo(username, pUrl.split('/').pop());
          repo.getTree('master', function(err, tree) {
            if (err) {
              $.log("Failed to load a git repo: " + err);
            }
            else {
              updateTree(tree);
            }
          });
        },
      };
	  return self;
    };
  };
  //@aspect
})(jQuery, dm);

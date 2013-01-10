/*
Class: GithubView

Copyright (c) 2012-2013 UMLSync. All rights reserved.

URL:
  umlsync.org/about

*/
//@aspect
(function($, dm, undefined) {
  dm.base.GithubView = function(url, username, access_token) {
    function github() {
      return new Github({
        token: access_token,
        auth: "oauth"
      });
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
    var pUrl = url;
    var self = {
      euid: "Github",
      modifiedList: {}, // The list of modified files by sha
      init: function(username, access_token) {
        function showRepos(repos) {
          if (dm.dm.dialogs)
            dm.dm.dialogs['SelectRepoDialog'](repos, function(repo) {
              "repo URL is stored in repo variable"
              var IGhView = new dm.base.GithubView(
                repo, username, access_token);
              dm.dm.fw.addView2('Github', IGhView);
            });
        };
        var user = github().getUser();
        user.repos(function(err, repos){ showRepos(repos) });
      },
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
                        $.log(data);
                        callback.success($.parseJSON(data))
                      });
        }
      },
      'ctx_menu': [
      {
        title:"Commit...",
        click: function(node, view) {
          if (dm.dm.dialogs)
            dm.dm.dialogs['CommitDataDialog'](
              view.modifiedList,
              function(message, items) {
                $.log("Commiting...");
                for (path in items) {
                  $.log(path);
                  repo = github().getRepo(username, pUrl.split('/').pop());
                  // second call won't work as we need to update the tree
                  repo.write('master', path.toString().substring(1), items[path].toString(), message, function(err) {});
                  // Remove from updated list
                  delete view.modifiedList[path];
                };
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
        $.log("initTree()");
        function updateTree(tree) {
          $.log("updateTree()");
          datax = {};
          datax["tree"] = tree;
          real_tree = {}
          real_tree = processTree(datax);
          $(parentSelector).dynatree({
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
                && (node.data.title.indexOf(".json") != -1))
                dm.dm.fw.loadDiagram(self.euid, node);
            }
          });
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
//@aspect
})(jQuery, dm);

/*
Class: GithubView

Copyright (c) 2012 UMLSync. All rights reserved.

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
        var ret = [];
        for (j in data) {
          ret[j] = {};
          if (json["tree"][j]["type"] == "blob") {
            ret[j]["isFolder"] = false;
            ret[j]["isLazy"] = false;
            ret[j]["title"] = json["tree"][j]["path"];
            ret[j]["sha"] = json["tree"][j]["sha"];
            ret[j]["url"] = json["tree"][j]["url"];
            }
          else if (json["tree"][j]["type"] == "tree") {
            ret[j]["isFolder"] = true;
            ret[j]["isLazy"] = true;
            ret[j]["title"] = json["tree"][j]["path"];
            ret[j]["sha"] = json["tree"][j]["sha"];
          }
        }
        console.log("Processing ret ->", ret);
        return ret;
      }
      return data;
    };
    var pUrl = url;
    var self = {
      euid: "Github",
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
        var content = data;
        console.log("Saving " + data.toString() + " on " + path.toString());
        var repo = github().getRepo(username, pUrl.split('/').pop());
        repo.write(
          'master',
          path.toString().substring(1),
          data.toString(),
          "Autosaving.",
          function(err) {}
        );
      },
      'loadDiagram': function(node, callback) {
        if (node && node.data && node.data.sha) {
          console.log("loadDiagram()");
          console.log(node.data);
          console.log(node.data.url);
          console.log(node.data.title);
          var repo = github().getRepo(username, pUrl.split('/').pop());
          repo.read(
            'master',
            node.data.title.toString(),
            function(err, data) {
              console.log(data);
              callback.success($.parseJSON(data))
            } 
          );
        }
      },
      'ctx_menu': [
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
        console.log("initTree()");
        function updateTree(tree) {
          console.log("updateTree()");
          datax = {};
          datax["tree"] = tree;
          real_tree = {}
          real_tree = processTree(datax);
          $(parentSelector).dynatree({
            persist: true,
            children: real_tree,
            onCreate: function(node, span) {
              console.log("onCreate()");
              $(span).bind('contextmenu', function(e) {
                var node = $.ui.dynatree.getNode(e.currentTarget);
                dm.dm.fw.ShowContextMenu("Github", e, node);
                e.preventDefault();
              });
            },
            /*onLazyRead: function(node) {
              //FIXME not working now
              console.log("onLazyRead()");
              console.log(pUrl);
              if (node.data.isFolder)
                node.appendAjax({url: pUrl + "/git/trees/" + node.data.sha,
                postProcess: treeView,
                dataType:"jsonp"});
            },*/
            onActivate: function(node) {
              console.log("onActivate()");
              if ((!node.data.isFolder)
                && (node.data.title.indexOf(".json") != -1))
                dm.dm.fw.loadDiagram(self.euid, node);
            }
          });
        };
        // Read repository
        var repo = github().getRepo(username, pUrl.split('/').pop());
        repo.getTree(
          'master?recursive=true',
          function(err, tree) { updateTree(tree) }
        );
      },
    };
    return self;
  };
//@aspect
})(jQuery, dm);

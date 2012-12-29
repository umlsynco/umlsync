/*
Class: GithubView

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2012 UMLSync Inc. All rights reserved.

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
                        ret[j]["url"] = json["tree"][j]["url"];
                    } else if (json["tree"][j]["type"] == "tree") {
                        ret[j]["isFolder"] = true;
                        ret[j]["isLazy"] = true;
                        ret[j]["title"] = json["tree"][j]["path"];
                        ret[j]["sha"] = json["tree"][j]["sha"];
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
          modifiedList:{}, // The list of modified files by sha
          // Check if loging required
          init: function(username, access_token) {
                 function showRepos(repos) {
                     if (dm.dm.dialogs)
                     dm.dm.dialogs['SelectRepoDialog'](
                       repos,
                       function(repo) {
                             "repo URL is stored in repo variable"
                             var IGhView = new dm.base.GithubView(repo, username, access_token);
                             dm.dm.fw.addView2('Github', IGhView);
                      });
                 };
            var user = github().getUser();
            user.repos(function(err, repos){ showRepos(repos) });
          },
          info: function(callback) {
            // TODO: define github view capabilities
            //       right now only view available
            if (callback)
                callback(null);
          },
          'save': function(path, data, description) {
            self.modifiedList[path] = data;
//            var repo = github().getRepo(username, pUrl.split('/').pop());
//            repo.write('master', path.toString().substring(1), data.toString(), "Autosaving.", function(err) {});

          },
          'loadDiagram': function(node, callback) {
            if (node && node.data && node.data.sha) {
                console.log("loadDiagram()");
                console.log(node.data);
                console.log(node.data.url);
                console.log(node.data.title);
                var repo = github().getRepo(username, pUrl.split('/').pop());
                repo.getBlob(node.data.sha, function(err, data) {
                    $.log(data);
                    callback.success($.parseJSON(data)) } );
            }
          },
          'ctx_menu': [
                     {
                         title:"Commit ...",
                         click: function(node, view) {
                             if (dm.dm.dialogs)
                               dm.dm.dialogs['CommitDataDialog'](
                                  view.modifiedList,
                                  function(message, items) {
                                      var repo = github().getRepo(username, pUrl.split('/').pop());
                                      // REPO MULTIPLE WRITE  

                                      //repo.write('master', path.toString().substring(1), data.toString(), "Autosaving.", function(err) {});

                                      // REMOVE THE COMMITED ITEMS
                                      // FROM THE LIST OF MODIFIED !!!
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
                         } // click
                     },
                     {
                         title: "Save",
                         click:function(node) {
                         },
                     },
                     {
                         title:"New folder",
                         click: function(node) {
                           this.newfolder(node.getAbsolutePath(), "newFolder", function(desc) {node.addChild(desc);});
                         }
                     },
                     {
                         title:"Remove",
                         click: function(node) {
                           this.remove(node.getAbsolutePath(), function() {node.remove();});
                         }
                     }
                     ],
                     initTree: function (parentSelector) {
            // Read repository
            var repo = github().getRepo(username, pUrl.split('/').pop());

            function updateTree(tree) {
                $.log("updateTree()");
                datax = {};
                datax["data"] = {};
                datax["data"]["tree"] = tree;
                real_tree = {}
                real_tree = treeView(datax);

                $(parentSelector).dynatree({
                    persist: true,
                    children: real_tree,
                    onCreate: function(node, span) {
                    $(span).bind('contextmenu', function(e) {
                        var node = $.ui.dynatree.getNode(e.currentTarget);
                        dm.dm.fw.ShowContextMenu("Github", e, node);
                        e.preventDefault();
                    });
                },
                onLazyRead: function(node) {
                    console.log("onLazyRead()");
                    if (node.data.isFolder) {
                        repo.getTree(node.data.sha, function(err, tree) {

                            // SOME BLOODY STUFF !!!
                            datax = {};
                            datax["data"] = {};
                            datax["data"]["tree"] = tree;
                            real_tree = {}
                            real_tree = treeView(datax);
                            if (err) {
                                $.log("FAILED TO UPDATE SHA TREE for some github repo: " + err);
                            }
                            else {
                                node.append(real_tree);
                            }
                        }); // getTree
                    }// IsFolder
                },
                onActivate: function(node) {
                    console.log("onActivate()");
                    if ((!node.data.isFolder)
                            && (node.data.title.indexOf(".json") != -1))
                        dm.dm.fw.loadDiagram(self.euid, node);
                }
                });
            };

            repo.getTree('master', function(err, tree) {
                if (err) {
                    $.log("FAILED TO LOAD: some github repo: " + err);
                }
                else {
                    updateTree(tree);
                }
            }); // getTree
        },
        };
        return self;
    };
    //@aspect
})(jQuery, dm);


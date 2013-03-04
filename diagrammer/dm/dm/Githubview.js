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
    var isLocal = (url != undefined);
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
        user.repos(function(err, repos){ showRepos(repos) });
      }
      else {
        showRepos([{full_name:'umlsynco/diagrams'},
                   {full_name:'umlsynco/websync'},
                   {full_name:'umlsynco/umlsync'},
                   {full_name:'kalaidin/octotest'},
                   {full_name:'umlsynco/GIST'}]);
      }
    };

    function decodeContent(data) {
      if (data.encoding == "base64") {
        var splitted = data.content.split('\n');
        var decoded = "";
        for (s in splitted) {
          decoded += $.base64.decode(splitted[s]);
        }
        return decoded;
      }
      return null;
    };
    
    var IGithubView = function (repoUrl) {
      var pUrl = repoUrl;

      // Reading a repository
      var repo = github().getRepo(username, pUrl.split('/').pop());
      var repositories = {}, repoid = username + "/" + pUrl.split('/').pop();

      var self =
      {
        euid: repoUrl.replace("/", "-"),
        activeBranch: "master",
        repositories:repositories,
        getRepository: function() { return pUrl},
        modifiedList: {}, // The list of modified files by sha
        initBranches: function() {
          repo.listBranches(
            function(err, branches) {
              dm.dm.fw.addBranch("Branches", repoUrl, self, branches);
              repo.listTags(
                function(err, tags) {
                  dm.dm.fw.addBranch("Tags", repoUrl, self, tags);
                }
              );
            }
          );
        },
        onBranchSelected: function(tab, branch) {
          self.activeBranch = branch;
          //$(self.treeParentSelector).children().empty();
          self.initTree(self.treeParentSelector);
        },
        saveContent: function(path, data, description) {
          self.modifiedList[path] = data;
          $.log("Saving " + data.toString() + " on " + path.toString());
        },
        //
        // Load content or get it from cache:
        //
        loadContent: function(params, callback) {
          // Get repository by params.repo
          // right now we suppose that we are working in the same repository, BUT it is not alway true
          if (params.sha) {
            repo.getBlob(params.sha, function(err, data) {
              if (data == null) {
                callback.error(err);
                return;
              }
              callback.success(err, data);
            });
          }
          else if (params.absPath) {
            var cPath = (params.absPath[0] == '/')? params.absPath.substring(1):params.absPath;
            repo.contents(cPath,  function(err, data) {
              if (data.message)
                callback.error(data.message);

              var decodedData = decodeContent(data);

              if (!decodedData)
                callback.error("No data found in: " + cPath);

              callback.success(err, decodedData);
            });
          }
          else {
            callback.error("Not enough information about content.");
          }
        },
        'ctx_menu':
                    [
                     {
                       title: "Commit...",
                       click: function(node, view) {
                       if (dm.dm.dialogs)
                         dm.dm.dialogs['CommitDataDialog'](
                             view.modifiedList,
                             function(message, items) {
                               var path;
                               $.log("Commiting...");

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
                        title: "Export to svg",
                        click: function(node, view) {
                          $.log(node.data.title);
                          // get json data here
                          path = node.getAbsolutePath();
                          data = view.modifiedList[path];
                          $.ajax({
                            type: "GET",
                            url: "http://localhost:8000/export/?contents=" + data,
                            success: function(svg) {
                              $.log("exported!");
                              $.log(svg);
                            },
                            error: function(xhr) {
                            }
                          });
                        }
                     },
                     {
                       title: "Reload",
                       click: function(node) {
                       node.reloadChildren();
                     }
                     },
                     {
                       title: "Open",
                       click: function(node) {
                         // TODO: REMOVE THIS COPY_PAST OF tree.onActivate !!!
                         if (!node.data.isFolder) {
                            var tt = node.data.title.split(".");
                            var title = tt[0].toUpperCase(), ext = (tt.length > 1) ? tt[tt.length-1].toUpperCase() : "";
                            var repo="pe";

                            var params =
                              {
                                viewid:self.euid,
                                node:node,
                                title:node.data.title,
                                absPath:node.getAbsolutePath(),
                                branch:"master",
                                repo:"umlsynco/umlsync",
                                editable:false
                              };

                            if (ext == "JSON" || ext == "UMLSYNC") {
                                params.contentType = "dm";
                            }
                            else if (title == "README" ||  ext == "MD" || ext == "rdoc") {
                                params.contentType = "md";
                            }
                            else if ((["C", "CPP", "H", "HPP", "PY", "HS", "JS", "CSS", "JAVA", "RB", "PL", "PHP"]).indexOf(ext) >= 0){
                                params.contentType = "code";
                            }
                            if (params.contentType != undefined)
                              dm.dm.fw.loadContent(params);
                         }
                       }
                     },
                     {
                       title: "Save",
                       click:function(node) {
                     },
                     },
                     {
                       title: "New folder",
                       click: function(node) {
                       this.newfolder(
                           node.getAbsolutePath(),
                           "newFolder",
                           function(desc) { node.addChild(desc); }
                       );
                     }
                     },
                     {
                       title: "Remove",
                       click: function(node) {
                       this.remove(
                           node.getAbsolutePath(),
                           function() {node.remove(); }
                       );
                     }
                     }
                     ],
        initTree: function (parentSelector) {
                    var isReload = (self.treeParentSelector == parentSelector);
                    self.treeParentSelector = parentSelector;
                    function updateTree(tree) {
                      $.log("updateTree()");
                      datax = {};
                      datax["tree"] = tree;
                      real_tree = {}
                      real_tree = processTree(datax);
                      if (isReload) {
                        var $root = $(parentSelector).dynatree("getTree");
                        $root.options.children = real_tree;
                        $root.reload();
                        return;
                      }
                      self.$tree = $(parentSelector).dynatree(
                          {
                            persist: true,
                            children: real_tree,
                            onCreate: function(node, span) {
                            $.log("onCreate()");
                            $(span).bind('contextmenu', function(e) {
                              var node = $.ui.dynatree.getNode(e.currentTarget);
                              dm.dm.fw.ShowContextMenu(self.euid, e, node);
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
                          onFocus: function(node) {
                            if (node.data.isFolder) {
                              self.active = node.getAbsolutePath();
                            }
                            else {
                              // get the neares parent folder or root
                            }
                          },
                          onActivate: function(node) {
                            $.log("onActivate()");
                            if (!node.data.isFolder) {
                              var tt = node.data.title.split(".");
                              var title = tt[0].toUpperCase(), ext = (tt.length > 1) ? tt[tt.length-1].toUpperCase() : "";
                              var repo="pe";

                              var params =
                                {
                                  viewid:self.euid,
                                  node:node,
                                  title:node.data.title,
                                  absPath:node.getAbsolutePath(),
                                  branch:"master",
                                  repo:"umlsynco/umlsync",
                                  editable:false
                                };

                              if (ext == "JSON" || ext == "UMLSYNC") {
                                params.contentType = "dm";
                              }
                              else if (title == "README" ||  ext == "MD" || ext == "rdoc") {
                                params.contentType = "md";
                              }
                              else if ((["C", "CPP", "H", "HPP", "PY", "HS", "JS", "CSS", "JAVA", "RB", "PL", "PHP"]).indexOf(ext) >= 0){
                                params.contentType = "code";
                              }
                              if (params.contentType != undefined)
                                dm.dm.fw.loadContent(params);
                            }
                          }
                        }
                      );
                    };
                    repo.getTree(self.activeBranch , function(err, tree) {
                      if (err) {
                        $.log("Failed to load a git repo: " + err);
                      }
                      else {
                        updateTree(tree);
                      }
                    });
                  }
      };
      return self;
    };
  };
  //@aspect
})(jQuery, dm);

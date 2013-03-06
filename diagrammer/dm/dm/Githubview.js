/**
Class: GithubView

Copyright (c) 2012-2013 UMLSync. All rights reserved.

URL:
  umlsync.org/about

 */
//@aspect
(function($, dm, undefined) {
////////////////////////////////////////////////////////////////////// VIEW MANAGER
  dm.base.GithubViewsManager = function(username, access_token, url) {
    // local web site mode
    var isLocal = (url != undefined);
    var ISelectionObserver = this;
    var viewsMap = {};
    var githubView = null;

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
        if (githubView != null) {
          githubView.openRepository(repo, true);
        }
        else {
          githubView = new IGithubView(repo, true);
          dm.dm.fw.addView2('github', githubView); // repoid + view
        }

        dm.dm.fw.onRepoSelect(githubView, repo);
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
    
    var IGithubView = function (repoId, isEditable) {
      // Reading a repository
      //var repo = github().getRepo(username, repoId.split('/').pop());
     
      var self =
      {
        euid: "github",
        modifiedList: {}, // The list of modified files by sha
////////////////////////////////////////////////////////////////////// REPOSITORIES AND BRANCHES
        //
        // Active branch of repository
        //
        activeBranch: null,
        //
        // Active repository "user/repository"
        //
        activeRepo: null,
        //
        // The list of loaded repositories and loaded contents of these repositories:
        //
        // repositories[repoid="user/repo"] {
        //    contents[sha] = {path: %ABS PATH%, content: data}, - cache of loaded contents
        //    updated[path] = {sha:sum, content:data, orig: data}, - cache of modified contents 
        //    repo: repo,  - github.js repo instance
        //    activeBranch: "master", - latest active branch
        // }
        //
        repositories: {},
        //
        // Return the active repository
        //
        getActiveRepository: function() { return self.activeRepo;},
        //
        // Open repository
        //
        openRepository: function(repoId, isEditable) {
          // Do nothing if it is the same repo
          if (repoId == self.activeRepo) {
            return;
          }

          var newRepo = self.repositories[repoId],
              activeRepo = self.repositories[self.activeRepo];

          if (activeRepo != null && Object.keys(activeRepo.updated).length > 0) {
            alert("All modified files will be lost !!!");
          }

          // Open a new repository
          if (newRepo == null) {
            newRepo = self.repositories[repoId] = {
              contents: {},
              updated: {},
              repo: github().getRepo(repoId.split('/')[0], repoId.split('/')[1]),
              activeBranch: "master"
            };
          }
          self.activeRepo = repoId;
          self.activeBranch = newRepo.activeBranch;
          repo = newRepo.repo;
          // Update tree
          self.initTree(self.treeParentSelector);
          self.initBranches(repoId);
        },
        //
        // Get branches and tabs of repository and add them to dialog
        //
        initBranches: function(repoId) {
          var repo = self.repositories[repoId].repo;
          repo.listBranches(
            function(err, branches) {
              dm.dm.fw.addBranch("Branches", repoId, self, branches);
              repo.listTags(
                function(err, tags) {
                  dm.dm.fw.addBranch("Tags", repoId, self, tags);
                }
              );
            }
          );
        },
        //
        // Callback from dialog that some branch was selected
        //
        onBranchSelected: function(tab, branch) {
          self.activeBranch = branch;
          //$(self.treeParentSelector).children().empty(); // Remove the previous tree content. It is important to hide previous tree to provide feedback to user ASAP

          // Init tree
          self.initTree(self.treeParentSelector);
        },
////////////////////////////////////////////////////////////////////// CONTENT MANAGMENT
        //
        // Save content if it is belog to the active branch and repository
        // otherwise throw an exception
        //
        saveContent: function(params, data) {
          if (params.repoId != self.activeRepo
          || params.branch != self.activeBranch) {
            alert("Attemption to commit on not active repository or branch.");
            return;
          }

          if (self.repositories[params.repoId] == undefined) {
            alert("Can not identify repository:" + params.repoId);
            return;
          }

          // was not modified before
          if (params.sha != undefined && self.repositories[params.repoId].contents[params.sha]) {
            var tmp = self.repositories[params.repoId].contents[params.sha];
            if (self.repositories[params.repoId].updated[params.absPath]) {
              self.repositories[params.repoId].updated[params.absPath].content = data;
              return;
            }

            self.repositories[params.repoId].updated[params.absPath] = {
              sha: params.sha,
              content:data,
              orig:tmp.content
            };

            // remove part from content
            delete self.repositories[params.repoId].contents[params.sha];
          }
        },
        //
        // Load content or get it from cache:
        //
        loadContent: function(params, callback) {
          // Check modified cache:
          if (params.absPath && self.repositories[params.repoId].updated[params.absPath]) {
            callback.success(null, self.repositories[params.repoId].updated[params.absPath].content);
          }

          // Check cache:
          if (params.sha && self.repositories[params.repoId].contents[params.sha]) {
            callback.success(null, self.repositories[params.repoId].contents[params.sha].content);
          }
        
          // Active or inactive repository:
          var repo = self.repositories[params.repoId].repo,
           // Editable if only data located on the active repo and branch
            isEditable = (params.repoId == self.activeRepo && params.branch == self.activeBranch);

          if (params.sha) {
            repo.getBlob(params.sha, function(err, data) {
              if (data == null) {
                callback.error(err);
                return;
              }

              self.repositories[params.repoId].contents[params.sha] = {path: params.absPath, content:data, isOpen:true};

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
              
              self.repositories[params.repoId].contents[params.sha] = {path: params.absPath, content:data, isOpen:true};

              callback.success(err, decodedData);
            });
          }
          else {
            callback.error("Not enough information about content.");
          }
        },
        //
        // Indicates that content is not active and could be removed
        // from cache by request
        //
        closeContent: function(params) {
          // Empty stub for future
        },
        getContentPath: function(params, parent) {
          var relPath = params.relativePath;
          // Actually it is an absolute path
          if (relPath == undefined)
            return "";

          if(relPath[0] == "/") {
            return relPath;
          }
          // Load an embedded diagrams
          var count = 0,
              liof = parent.absPath.lastIndexOf("/"), // if slash not found than it is root
              parentPath = (liof == -1) ? "/":parent.absPath.substring(0, liof);
          return parentPath + relPath;
        },
////////////////////////////////////////////////////////////////////// CONTEXT MENU
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

                            var params =
                              {
                                viewid:self.euid,
                                node:node,
                                sha:node.data.sha,
                                title:node.data.title,
                                absPath:node.getAbsolutePath(),
                                branch:"master",
                                repoId:self.activeRepo,
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
////////////////////////////////////////////////////////////////////// REPOSITORY TREE
        initTree: function (parentSelector, isReload) {
          var repo = self.repositories[self.activeRepo].repo;
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

                              var params =
                                {
                                  viewid:self.euid,
                                  node:node,
                                  sha:node.data.sha,
                                  title:node.data.title,
                                  absPath:node.getAbsolutePath(),
                                  branch:self.activeBranch,
                                  repoId:self.activeRepo,
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
////////////////////////////////////////////////////////////////////// INITIALIZATION
      // Open the first repository
      self.openRepository(repoId, isEditable);
      return self;
    };
  };
  //@aspect
})(jQuery, dm);

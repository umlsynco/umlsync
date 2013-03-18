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
          githubView = new IGithubView(repo, false);
          dm.dm.fw.addView2('github', githubView); // repoid + view
        }

        dm.dm.fw.onRepoSelect(githubView, repo);
      }
    };

    var userRepositories = new Array();
    this.init = function() {
      function showRepos(repos) {
        dm.dm.fw.addRepositories("Yours", ISelectionObserver, repos);
        for (var r in repos) {
          userRepositories.push(repos[r]['full_name']);
        }
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
    
    var IGithubView = function (repoId, isOwner) {
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
        // Return the active repository
        //
        getActiveBranch: function() { return self.activeBranch;},
        //
        // Open repository
        //
        openRepository: function(repoId, isOwner) {
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
              activeBranch: "master",
              owner:isOwner
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
        // defines the cached content data limit
        //
        contentCacheLimit:40,
        //
        // The number of cached contents
        //
        contentCachedNum:0,
        //
        // Save content if it is belog to the active branch and repository
        // otherwise throw an exception
        //
        saveContent: function(params, data, isNewContent) {
          if (params.repoId != self.activeRepo
          || params.branch != self.activeBranch) {
            alert("Attemption to commit on not active repository or branch.");
            return;
          }

          if (self.repositories[params.repoId] == undefined) {
            alert("Can not identify repository:" + params.repoId);
            return;
          }

          // Save new content
          if (isNewContent) {
            // Check that user has selected the location of content
            if (!params.absPath) {
              alert("Location not defined !");
              return;
            }
            self.repositories[params.repoId].updated[params.absPath] = {content: data};
          }

          // Modified before
          if (self.repositories[params.repoId].updated[params.absPath]) {
            self.repositories[params.repoId].updated[params.absPath].content = data;
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

            params.absPath

            // remove part from content
            delete self.repositories[params.repoId].contents[params.sha];
            // Reduced the cached number because now it is in modified list
            self.contentCachedNum--;
          }
        },
        //
        // Load content or get it from cache:
        //
        loadContent: function(params, callback) {
          // Check modified cache:
          if (params.absPath && self.repositories[params.repoId].updated[params.absPath]) {
            callback.success(null, self.repositories[params.repoId].updated[params.absPath].content);
            return;
          }

          // Check cache:
          if (params.sha && self.repositories[params.repoId].contents[params.sha]) {
            callback.success(null, self.repositories[params.repoId].contents[params.sha].content);
            self.repositories[params.repoId].contents[params.sha].refCount++;
            return;
          }
          
          // Try to get by path:
          if (params.sha == undefined) {
            for (var g in self.repositories[params.repoId].contents) {
              if (self.repositories[params.repoId].contents[g].path == params.absPath) {
                self.repositories[params.repoId].contents[g].refCount++;
                params.sha = g;
                callback.success(null, self.repositories[params.repoId].contents[g].content);
                return;
              }
            }
          }

          // Setup ownership parameter to indicate that
          // it is possible to modify cotent
          params.isOwner = (userRepositories.indexOf(params.repoId) >= 0);

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

              self.contentCachedNum++;
              self.repositories[params.repoId].contents[params.sha] = {path: params.absPath, content:data, isOpen:true, refCount:1};

              callback.success(err, data);
              return;
            });
          }
          else if (params.absPath) {
            var cPath = (params.absPath[0] == '/')? params.absPath.substring(1):params.absPath;
            repo.contents(cPath,  function(err, data) {
              if (data.message) {
                callback.error(data.message);
                return;
              }

              var decodedData = (data.encoding == "base64") ? decodeContent(data) : data;

              if (!decodedData) {
                callback.error("No data found in: " + cPath);
                return;
              }
              self.contentCachedNum++;
              params.sha = data.sha;
              self.repositories[params.repoId].contents[params.sha] = {path: params.absPath, content:decodedData, isOpen:true, refCount:1};

              callback.success(err, decodedData);
              return;
            });
          }
          else {
            callback.error("Not enough information about content.");
            return;
          }
          
          //
          // Reduce cache size on 5 useless contents
          //
          var mRepo, mSha, mTime = new Date();
          if (self.contentCachedNum > self.contentCacheLimit) {
            for (var re in self.repositories) {
              for (var fl in self.repositories[re].contents) {
                if (self.repositories[re].contents[fl].refCount == 0
                  && mTime > self.repositories[re].contents[fl].closeTime) {
                  mTime = self.repositories[re].contents[fl].closeTime;
                  mRepo = re;
                  mSha = fl;
                }
              }
            }

            // Remove found content in repository
            if (mRepo && mSha) {
              self.contentCachedNum--;
              delete self.repositories[mRepo].contents[mSha];
            }
          } // If got cache limit
        },
        //
        // Release the reference count on content
        //
        releaseContent: function(params) {
          if (params.sha != undefined
            && self.repositories[params.repoId] != undefined
            && self.repositories[params.repoId].contents[params.sha]) {
            self.repositories[params.repoId].contents[params.sha].refCount--;
            self.repositories[params.repoId].contents[params.sha].closeTime = new Date();
          }
          var $tree = $(self.treeParentSelector).dynatree("getTree");

          $tree.loadKeyPath(params.absPath, function(node, result) {
            if (result == "ok") {
              $(node.span).addClass("dynatree-ico-modified");
            }
          },
          "title");
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
              parentPath = (liof == -1) ? "/":parent.absPath.substring(0, liof+1);

          var full_path = parentPath + relPath;
          // Relative path doesn't contain dotted links
          if (full_path.indexOf("./") == -1) {
            return full_path;
          }
          var sfp = full_path.split("/"),
            valid_path_array = new Array();
          for (var t in sfp) {
            if (sfp[t] == "." || sfp[t] == "") { // Stay on the same position
              continue;
            }
            else if (sfp[t] == "..") { // Folder up
              var isEmpty = valid_path_array.pop();
              if (isEmpty == undefined) {
                alert("Wrong path: " + full_path);
              }
            }
            else { // next folder/item
              valid_path_array.push(sfp[t]);
            }
          }
          return "/" + valid_path_array.join("/");
          
        },
        //
        // return the list of subfolders for a given path
        //
        getSubPaths: function(path, sp_callback) {
          self.activeStorageNode = null;

          var $tree = $(self.treeParentSelector).dynatree("getTree");

          $tree.loadKeyPath(path, function(node, result) {
            if (result == "ok") {
              self.activeStorageNode = node;
              var tmp = node.getChildren();
              var res = new Array();
              for (var r in tmp) {
                if (tmp[r].data.isFolder)
                  res.push(path + "/" + tmp[r].data.title + "/");
              }
              if (sp_callback) {
                sp_callback(res);
              }
            }
          },
          "title");
        },
        //
        // Check the content name:
        //
        checkContentName: function(name) {
          if (!self.activeStorageNode) {
            return "Wrong path or path was not loaded yet: " + name;
          }
          
          if (self.activeStorageNode.getAbsolutePath() != name.substring(0, name.lastIndexOf("/"))) {
            return "Wrong path, expected: " + self.activeStorageNode.getAbsolutePath();
          }
          
          var filename = name.split("/").pop();
          var tmp = self.activeStorageNode.getChildren();
          for (var b in tmp) {
            if (!tmp[b].data.isFolder && tmp[b].data.title == filename) {
              return "File already exist";
            }
          }
          
          self.activeStorageNode.addChild({title:filename, addClass:"dynatree-ico-added"});
          
          return "ok";
        },
////////////////////////////////////////////////////////////////////// CONTEXT MENU
        'ctx_menu':
                    [
                     {
                       title: "Commit...",
                       click: function(node, view) {
                       if (dm.dm.dialogs)
                         dm.dm.dialogs['CommitDataDialog'](
                             self.repositories[self.activeRepo].updated,
                             function(message, items) {
                               var path;
                               $.log("Commiting...");

                               var contents = [];
                               for (path in items) {
                                 $.log(path);
                                 contents.push({
                                   'path': path.toString().substring(1),
                                   'content': items[path].content
                                 });
                                 // Remove from updated list
                                 delete self.repositories[self.activeRepo].updated[path];
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
                       title: "New folder",
                       click: function(node) {
                       self.newfolder(
                           node.getAbsolutePath(),
                           "newFolder",
                           function(desc) { node.addChild(desc); }
                       );
                     }
                     },
                     {
                       title: "Remove",
                       click: function(node) {
                         $(node.span).addClass("dynatree-ico-removed");
                       /*self.remove(
                           node.getAbsolutePath(),
                           function() {node.remove(); }
                       );*/
                       }
                     },
                     {
                       title: "Revert",
                       click: function(node) {
                         $(node.span).removeClass("dynatree-ico-removed");
                       /*self.remove(
                           node.getAbsolutePath(),
                           function() {node.remove(); }
                       );*/
                       }
                     }
                     ],
////////////////////////////////////////////////////////////////////// REPOSITORY TREE
        initTree: function (parentSelector, isReload) {
          var repo = self.repositories[self.activeRepo].repo;
                    self.treeParentSelector = parentSelector;
                    function updateTree(tree) {
                      var datax = {};
                      datax["tree"] = tree;
                      var real_tree = {}
                      real_tree = processTree(datax);
                      if (isReload) {
                        var $root = $(parentSelector).dynatree("getTree");
                        $root.options.children = real_tree;
                        $root.reload();
                        return;
                      }
                      $(parentSelector).dynatree('destroy').empty();
                      self.$tree = $(parentSelector).dynatree(
                          {
                            persist: false,
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
                              if (params.contentType != undefined) {
                                $(node.span).addClass("dynatree-ico-cached");
                                dm.dm.fw.loadContent(params);
                              }
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
      self.openRepository(repoId, isOwner);
      return self;
    };
  };
  //@aspect
})(jQuery, dm);

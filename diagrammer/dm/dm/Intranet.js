//
// Class: intranetView
//
// Copyright (c) 2012-2013 UMLSync. All rights reserved.
//
// URL: umlsync.org/about
//
(function($, dm, undefined) {
    //////////////////////////////////////////////////////////////
    //           IViewManager
    //////////////////////////////////////////////////////////////
    //
    // intranet view manager is an abstraction which allow
    // to extract information about user's repositories (own, followed, starred etc..)
    // and switch between them
    //
    //  @param username - log-in user name
    //  @param access_token - secure access token
    //  @param url - optional param which allow to run service locally without SERVER !!!
    //
    dm.base.IntranetViewsManager = function(urlArg) {
        var ISelectionObserver = this;
        var viewsMap = {};

        this.intranetView = null;
        this.id = "us-intranet";
        this.title = "SvnPython";
        this.activated = false;
        //
        // IViewManager::getId for the div#reponav element insertion
        // ------
        //
        this.getId = function() {return this.id;}
        
        //
        // IViewManager::getTitle for the div#reponav element insertion
        // ------
        //
        this.getTitle = function() {return this.title;}

        //
        // IViewManager::getIcon for the div#reponav element insertion
        // ------
        //
        this.getIcon = function() {return "%path to icon%";}

        //
        // IViewManager::onViewManagerChange for the div#reponav element insertion
        // @return - true  - on success change completion
        //           false - on cancel change procedure
        // ------
        //
        this.onViewManagerChange = function(id, callback) {
            var self = this;
            // Switch to null repository
            // is similar to close all content and commit for the
            // opened repository
            if (this.id != id) {
                this.onRepoSelect("Yours", null, function() {
                  self._activateRepoWidget("#us-repo-select", false);
                  self._activateToolboxWidget("#us-toolbox", false);

                  // Drop the repository tree widget
                  $("#us-treetabs").children().remove();
                  $(self.treeCtxSelector).remove();
                  self.treeCtxSelector = null;
                  delete self.intranetView;
                  self.intranetView = null;

                  if (callback) {
                    callback(true);
                  }
                  self.activated = false;
                });
                return;
            }
            // Do nothing if already active
            if (this.activated) {
                return;
            }

            // Initialize widgets
            this._activateRepoWidget("#us-repo-select", true);
            this._activateToolboxWidget("#us-toolbox", true);

            this.activated = true;
        };

        //
        // IViewManager::onViewManagerChange - activate the toolbox area helper
        // ------
        //
        this._activateToolboxWidget = function(selector, flag) {
            var item = $(selector + " #us-intranet-list");
            if (item.length > 0){
              if (flag) {
                item.show();
              }
              else {
                item.hide();
              }
              return;
            }

            var self = this;
            // Append HTML code
            $(selector).append('<ul id="us-intranet-list" style="list-style:none;">\
                    <li id="us-intranet-commit" class="us-left" title="Commit changes"><img src="http://umlsync.org/static/images/commit.png" class="ui-icon"></li>\
                    <li id="us-intranet-reload" class="us-left" title="Update branch ..."><img src="http://umlsync.org/static/images/reload.png" class="ui-icon"></li>\
                    <li id="us-intranet-newdoc" title="New diagram"><img src="http://umlsync.org/static/images/newdoc.png" class="ui-icon"></li>\
                    <li id="us-intranet-revertdoc" title="Revert diagram"><img src="http://umlsync.org/static/images/revertdoc.png" class="ui-icon"></li>\
                    <li id="us-intranet-removedoc" title="Remove diagram"><img src="http://umlsync.org/static/images/deldoc.png" class="ui-icon"></li>\
            </ul>');
            // Initialize handlers
            $("#us-intranet-newdoc").click(function() {
                $(document).trigger("us-dialog-newdiagram", {view:self.intranetView, path:"/"});
            });

            $("#us-intranet-commit").click(function() {
                if (self.intranetView != null) {
                    self.intranetView.commitContent();
                }
            });

            $("#us-intranet-reload").click(function() {
                if (self.intranetView != null) {
                    self.intranetView.reloadTree();
                }
            });

        };

        //
        // Helper method to create the drop down selector with tabs
        // param - element id to attach widget
        // desc - JSON description of drop down selector
        //        {filter: true/false, mtitle: MiniTitle, title: TITLE, tabs:{ name1: {id1, id2}, name2: {id3, id4}}}
        //
        this._helperInitDropDownSelector = function(parentId, uid, desc) {
            $('<div class="dropdown-widget" id="'+uid+'">\
                    <div class="select-menu">\
                    <a class="minibutton select-menu-button js-menu-target">\
                    <span class="mini-icon mini-icon-branch"></span>\
                    <i>'+desc.mtitle+':</i>\
                    <span class="js-select-button">none</span>\
                    </a>\
                    </div>\
            </div>')
            .appendTo(parentId)
            .click(function() {
                if (uid == "us-repo")
                    dm.dm.dialogs['Activate']("svn-selection-dialog");
            });
        };

        //
        // IViewManager::onViewManagerChange - activate the toolbox area helper
        // ------
        //
        this._activateRepoWidget = function(selector, flag) {
            var item = $("#switcher #us-repo-select #us-repo");
            if (item.length > 0) {
              flag ? item.show() : item.hide();
              return;
            }

            // Init repo selection widget (not dialog)
            this._helperInitDropDownSelector('#switcher #us-repo-select', "us-repo",
            {
                filter:true,
                mtitle: 'Branch:',
                title: 'Open/Switch repository',
                onSelect: function(selectedTab, selectedItem) {
                    if (selectedTab == 'Branches') {
                        // simply change repo
                    }
                    else if (selectedTab == 'CheckOut') {
                        // open folow repository
                    }
                    else if (selectedTab == 'Snipets') {
                        // open gists
                    }
                }//onSelect
            }); // _helperInitDropDownSelector
        };

        //
        // Add the number of repositories into the repo selection dialog
        // @param title - the title of tab in dialog
        // @param IViewsManager - view manager object
        // @param descr - repositories description object
        //
        this._activateRepoDialogWidget = function(title, IViewsManager, descr) {
            if (dm.dm.dialogs) {
                dm.dm.dialogs['SelectBranchesDialog'](title, IViewsManager, descr);
            }
        },

        //
        //  Callback method which indicates that user has changed the
        //  repository.
        //  1. Check for the modifications in current repository
        //  2. Commit changes or reject them
        //
        this.onRepoSelect = function(title, repo, callback) {
            var intranetView = this.intranetView;
            var self = this;
            var isOwner = false; // Following repos

            function updateWidgetsStatus() {
                if (self.intranetView == null) {
                    return;
                }

                var repoId = (self.intranetView.activeRepo == null) ? "none" : self.intranetView.activeRepo;

                $("#us-repo .js-select-button").text(repoId);
            }

            if (title == 'Branches' || title == 'Snippets') {
              isOwner = true;
            }
            
            if (intranetView != null) {
              // Do nothing for the same repository was selected
              if (intranetView.activeRepo == repo) {
                if (callback) { callback();}
                return;
              }

              // First activation of repository
              // after switch to another view
              if (intranetView.activeRepo == null) {
                intranetView.openRepository(repo, isOwner);
                dm.dm.fw.addView2(self, intranetView);
                updateWidgetsStatus();
                if (callback) { callback();}
                return;
              }

              // Skipped repo change during modified content
              // save dialog opening
              dm.dm.fw.handleModifiedContentOnRepoChange(intranetView.activeRepo, function(isAccepted) {
                        if (!isAccepted) {
                            return;
                        }

                        if (intranetView.hasModifications()) {
                            dm.dm.dialogs['ConfirmationDialog']({
                              title:"Change repository?",
                              description: "All modified files will be removed:",
                              buttons: {
                                    "remove": function() {
                                        intranetView.openRepository(repo, true);
                                        updateWidgetsStatus();
                                        if (callback) { callback();}
                                        $( this ).dialog( "close" );
                                    },
                                    "cancel": function() {
                                        // Do not continue if case of issues
                                        $( this ).dialog( "close" );
                                    },
                                    "commit...":function() {
                                        $( this ).dialog( "close" );
                                        intranetView.commitContent(null, function(isOk) {
                                          if (isOk) {
                                            intranetView.openRepository(repo, true);
                                            updateWidgetsStatus();
                                          }
                                          if (callback) {callback();}
                                        });
                                    }
                                }
                            });// Confirmation dialog
                        }
                        else {
                            if (callback) { callback();}
                            intranetView.openRepository(repo, true);
                            updateWidgetsStatus();

                        }
                    });
            }
            else {
              this.intranetView = new IntranetView(repo, isOwner);
              dm.dm.fw.addView2(this.id, this.intranetView);
              updateWidgetsStatus();
              if (callback) { callback();}
            }
        };

        //
        // Load content directly, without tree loading
        // @param repoId - intranet repo id (user/repo)
        // @param branch - content branch
        // @param path - absolute path from repository root
        //
        this.loadRightAway = function(repo, branch, path) {
            var title = path.split("/").pop();
            var contentType = dm.dm.fw.getContentType(title);
            if (contentType) {
                $.log(repo);
                var params =
                {
                        viewid: "intranet",
                        absPath: path,
                        title: title,
                        branch: branch,
                        repoId: repo,
                        editable: false,
                        contentType: contentType
                };
                dm.dm.fw.loadContent(params);
            }
        };


        //
        //  Function to covert the intranet's tree structure to the dynaTree compatible JSON
        //  @data - intranet return value
        //  @return - dynatree JSON
        //
        function processTree(data) {
            if (data) {
                var ret = [];
                for (j in data["tree"]) {
                    ret[j] = {};
                    if (data["tree"][j]["type"] == "blob") {
                        ret[j]["isFolder"] = false;
                        ret[j]["isLazy"] = false;
                        ret[j]["title"] = data["tree"][j]["path"];
                        ret[j]["url"] = data["tree"][j]["url"];
                    }
                    else if (data["tree"][j]["type"] == "tree") {
                        ret[j]["isFolder"] = true;
                        ret[j]["isLazy"] = true;
                        ret[j]["title"] = data["tree"][j]["path"];
                    }
                }
                $.log("Processing ret ->", ret);
                return ret;
            }
            return data;
        };

        //
        // Decode the "base64" content
        // @param data - data to decode
        // @return - the decoded content
        //
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

        //
        // Initialize the list of repositories
        // for logged-in user
        //
        this.init = function(path) {
            // Show repo title on the top
            dm.dm.fw.registerViewManager(this, true);

            // This is the default view
            this._activateRepoWidget("#us-repo-select");
            this._activateToolboxWidget("#us-toolbox");

            // activated by default
            this.activated = true;

            function loadPath() {
                if (path != undefined && path != "") {
                    var splitted_path = path.split("/"),
                            repo_path = splitted_path.slice(0, 2).join("/"),
                            branch = splitted_path[2],//master
                            diagram = splitted_path.slice(3).join("/"),
                            repo = repo_path;
                    // TODO: check that repo is in the list of user repositories
                    ISelectionObserver.onRepoSelect("Yours", repo);
                    ISelectionObserver.loadRightAway(repo_path, branch, diagram);
                }
            }

            function showRepos(err, repos, title) {
                if (err != null) {
                    dm.dm.fw.loadError("repos", err);
                    return;
                }
                // Repositories are loaded successfully
                // Now loading the content
                loadPath();
                ISelectionObserver._activateRepoDialogWidget(title, ISelectionObserver, repos);
            };

            // Server-based use-case
            $.ajax({
                url: urlArg + "branches?path=0",
                dataType: "json",
                success: function (data) {
                    if (data)
                      showRepos(null, data.branches, "Branches") 
                }
            });
        };

        //
        // Implements IView interface
        //
        //
        var IntranetView = function (repoId, isOwner) {
            // Reading a repository
            //var repo = intranet().getRepo(username, repoId.split('/').pop());

            var self =
            {
                    euid: "intranet",
                    //////////////////////////////////////////////////////////////
                    //           Repositories and branches
                    //////////////////////////////////////////////////////////////
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
                    //    updated[path] = {sha:sum, content:data, orig: data}, - cache of modified contents
                    //    repo: repo,  - intranet.js repo instance
                    //    activeBranch: "master", - latest active branch
                    // }
                    //
                    repositories: {},
                    //
                    // Return whether repo content was modified or not
                    //
                    hasModifications: function() {
                        if (self.activeRepo != null) {
                            var activeRepo = self.repositories[self.activeRepo];
                            if (activeRepo.updated != null && activeRepo.updated != undefined) {
                                return Object.keys(activeRepo.updated).length > 0;
                            }
                        }
                        else {
                            return false
                        };
                    },

                    //
                    // Return the active repository
                    // ----
                    //
                    getActiveRepository: function() { return self.activeRepo;},

                    //
                    // Return the active repository
                    // ----
                    //
                    getActiveBranch: function() { return self.activeBranch;},

                    //
                    // Open repository
                    // ----
                    //
                    openRepository: function(repoId, isOwner) {
                        // Do nothing if it is the same repo
                        if (repoId == self.activeRepo) {
                            return;
                        }
                        
                        dm.dm.fw.switchToEditable(this.euid, this.activeRepo, this.activeBranch, false);
                        
                        if (repoId == null) {
                          self.activeRepo = null;
                          self.activeBranch = null;
                          return;
                        }

                        var newRepo = self.repositories[repoId],
                            activeRepo = self.repositories[self.activeRepo];

                        // Open a new repository
                        if (newRepo == null) {
                            newRepo = self.repositories[repoId] = {
                                    contents: {},
                                    updated: {},
                                    tree: {},
                                    repo: repoId,//intranet().getRepo(repoId.split('/')[0], repoId.split('/')[1]), // user/repo
                                    activeBranch: "master",
                                    owner:isOwner
                            };
                        }
                        self.activeRepo = repoId;
                        self.activeBranch = newRepo.activeBranch;
                        repo = newRepo.repo;
                        // Update tree
                        self.initTree(self.treeParentSelector);
                        //self.initBranches(repoId);
                        
                        dm.dm.fw.switchToEditable(this.euid, this.activeRepo, this.activeBranch, true);
                    },

                    //
                    // Get branches and tabs of repository and add them to dialog
                    // ----
                    //
                    initBranches: function(repoId) {
                        var repo = self.repositories[repoId].repo;
                        repo.listBranches(
                                function(err, branches) {
                            ISelectionObserver.addBranchDialogWidget("Branches", repoId, self, branches);
                            repo.listTags(
                                    function(err, tags) {
                                ISelectionObserver.addBranchDialogWidget("Tags", repoId, self, tags);
                            }
                            );
                        }
                        );
                    },

                    //
                    // Callback from dialog that some branch was selected
                    // ----
                    //
                    onBranchSelected: function(tab, branch) {
                        if (self.activeBranch != branch) {
                            dm.dm.fw.switchToEditable(this.euid, this.activeRepo, this.activeBranch, false);
                            self.activeBranch = branch;
                            self.initTree(self.treeParentSelector);
                            dm.dm.fw.switchToEditable(this.euid, this.activeRepo, this.activeBranch, true);
                        }
                    },

                    //////////////////////////////////////////////////////////////
                    //           Content managment
                    //////////////////////////////////////////////////////////////

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
                    // ----
                    //
                    saveContent: function(params, data, isNewContent) {
                        $.log("saveContent === " + isNewContent);
                        if (params.absPath) {
                            $.ajax({
                                url: urlArg + "save?path=/" + self.activeRepo + "/" + params.absPath,
                                dataType: "json",
                                method: 'POST',
                                data: {data:data, isNewContent: isNewContent},
                                success: function (data) {
                                    alert('saved');
                                }
                            });
                        }
                    },

                    //
                    // Load content or get it from cache:
                    // ----
                    //
                    loadContent: function(params, callback) {

                        // Setup ownership parameter to indicate that
                        // it is possible to modify cotent
                        params.isOwner = true;

                        // Active or inactive repository:
                        var repo = self.repositories[params.repoId].repo,
                            // Editable if only data located on the active repo and branch
                            isEditable = (params.repoId == self.activeRepo && params.branch == self.activeBranch);

                        //
                        // Load content by path and save SHA on load complete
                        //
                        if (params.absPath) {
                            var cPath = (params.absPath[0] == '/')? params.absPath.substring(1):params.absPath;
                            $.ajax({
                                url: urlArg + "open?path=/" + self.activeRepo + "/" + cPath,
                                dataType: "json",
                                success: function (data) {
                                    var decodedData = (data.encoding == "base64") ? decodeContent(data) : data;

                                    if (!decodedData) {
                                        callback.error("No data found in: " + cPath);
                                        return;
                                    }
                                    callback.success(null, decodedData);
                                    return;
                                },
                                error: function(err) {
                                    if (err) {
                                        callback.error(err);
                                        return;
                                    }
                                }
                            });
                        }
                        else {
                            callback.error("Not enough information about content.");
                            return;
                        }
                    },

                    //
                    // Release the reference count on content
                    // or release cached content
                    // ----
                    //
                    releaseContent: function(params) {
                    },

                    //
                    // Convert a relative path to the absolute path
                    // ----
                    //
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
                    // Load the provided path and provide the result to the callback function
                    // 
                    // ----
                    //
                    getSubPaths: function(path, sp_callback) {
                        // Reset actve node
                        self.activeStorageNode = null;

                        // get Dynatree object
                        var $tree = $(self.treeParentSelector).dynatree("getTree");

                        // Check if it is root.
                        // There is no good handling of root path in dynatree
                        if (path == "") {
                            var tmp = $tree.tnRoot.getChildren();
                            var res = new Array();
                            for (var r in tmp) {
                                if (tmp[r].data.isFolder)
                                    res.push(tmp[r].data.title);
                            }
                            if (sp_callback) {
                                sp_callback("ok", res);
                            }
                            return;
                        }

                        // Load path by title of folders.
                        // It could be asynchronius call
                        // in case of request of nodes from intranet
                        $tree.loadKeyPath(path, function(node, result, msg) {
                            if (result == "ok") {
                                self.activeStorageNode = node;
                                var tmp = node.getChildren();
                                var res = new Array();
                                for (var r in tmp) {
                                    if (tmp[r].data.isFolder)
                                        res.push(tmp[r].data.title);
                                }
                                if (sp_callback) {
                                    sp_callback(result, res);
                                }
                            }
                            else if (result == "loaded") {
                              sp_callback(result, node.data.title);
                            }
                            else { // Error is left
                              $.log(result);
                              sp_callback(result, msg);
                            }
                        },
                        "title");
                    },

                    //
                    // Check the content name:
                    // ----
                    //
                    checkContentName: function(name) {
                        var $tree = $(self.treeParentSelector).dynatree("getTree");
                        var path = name.substring(0, name.lastIndexOf("/"));
                        self.activeStorageNode = null;
                        if (path == "") {
                          self.activeStorageNode = $tree.tnRoot;
                        }
                        else {
                          $tree.loadKeyPath(path, function(node, result) {
                            if (result == "ok") {
                              self.activeStorageNode = node;
                            }
                          }, "title");
                        }

                        if (!self.activeStorageNode) {
                            return "Wrong path or path was not loaded yet: " + name;
                        }

                        if (path != "" && self.activeStorageNode.getAbsolutePath() != name.substring(0, name.lastIndexOf("/"))) {
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

                    //
                    // Mark the content as removed
                    // or drop a newly created content
                    // ----
                    //
                    removeContentByNode: function(node) {
                        var absPath = node ? node.getAbsolutePath() : '';

                        $.ajax({
                          url: urlArg + "remove?path=/" + self.activeRepo + "/" + absPath,
                          dataType: "json",
                          method: 'GET',
                          success: function() {
                              if (self.hasNodeStatus(node, 'added')) {
                                node.remove();
                              }
                              else {
                                self.rmNodeStatus(node, null, "modified");
                                self.addNodeStatus(node, null, "removed");
                              }
                          }
                        });
                    },

                    //
                    // revert content revert the content changes
                    // @node - folder or content file
                    // ----
                    //
                    revertContentByNode: function(node) {
                        var absPath = node ? node.getAbsolutePath() : '';

                        if (self.hasNodeStatus(node, 'added')) {
                            $.ajax({
                              url: urlArg + "remove?path=/" + self.activeRepo + "/" + absPath,
                              dataType: "json",
                              method: 'GET',
                              success: function() {
                                  node.remove();
                              }
                            });
                        }
                        else {
                            $.ajax({
                              url: urlArg + "revert?path=/" + self.activeRepo + "/" + absPath,
                              dataType: "json",
                              method: 'GET',
                              success: function() {
                                self.rmNodeStatus(node, null, "modified");
                              }
                            });
                        }
                    },

                    //
                    // Reload the tree HEAD, and check for a conflicts
                    // TODO: MAKE AN SVN UPDATE BRANCH
                    // ----
                    //
                    reloadTree: function() {
                        self.initTree(self.treeParentSelector, true);
                    },

                    //
                    // Comit content
                    // @node - folder or content file
                    // ----
                    //
                    commitContent: function(node, callback) {
                        if (!dm.dm.dialogs) {
                            return;
                        }

                        var absPath = node ? node.getAbsolutePath() : ''
                        $.ajax({
                          url: urlArg + "status?path=/" + self.activeRepo + "/" + absPath,
                          dataType: "json",
                          method: 'GET',
                          success: function (data) {
                            dm.dm.dialogs['CommitDataDialog'](
                              data,
                              function(message, items, onComplete, onStatusChange) {
                                var path;
                                var contents = [],
                                        repo = self.repositories[self.activeRepo].repo;
                                var rrrrrrrrrrrrr = self.repositories[self.activeRepo];
                                for (path in items) {
                                    contents.push({
                                        'path': path.toString().substring(1),
                                        'sha':items[path].sha,
                                        'baseTree':items[path].parent_sha,
                                        'content': (items[path].content == null) ? null :items[path].content,
                                        'tree':self.repositories[self.activeRepo].tree[items[path].parent_sha]
                                    });
                                };
                                return; // DO NOTHING FOR A WHILE
                                // second call won't work as we need to update the tree
                                repo.multipleCommit(self.activeBranch, contents, message, function(err, res, status) {
                                    if (err != null) {
                                        onComplete(err);
                                        return;
                                    }
                                    for (path in items) {
                                        // Remove the commited content from updated list
                                        delete self.repositories[self.activeRepo].updated[path];
                                    };
                                    self.initTree(self.treeParentSelector, true);
                                    // Callbacks to the dialog
                                    onStatusChange("Updating the tree");
                                    onComplete(err);
                                    if (callback) {
                                      callback();
                                    }
                                }, onStatusChange);
                              });
                           }
                        });
                    },
//////////////////////////////////////////////////////////////
//           Context menu extention
//////////////////////////////////////////////////////////////
                    'ctx_menu':
                    [
                     {
                        title: "Commit...",
                        click: function(node, view) {
                            // Commit all content under the path
                            self.commitContent(node);
                        }
                     },
                     {
                             title: "Open",
                             click: function(node) {
                                 // TODO: REMOVE THIS COPY_PAST OF tree.onActivate !!!
                                 if (!node.data.isFolder) {
                                     if (self.hasNodeStatus(node, "removed")) {
                                         alert("You can not open removed content.Please, do revert first !");
                                         return;
                                     }

                                     var params =
                                     {
                                             viewid:self.euid,
                                             title:node.data.title,
                                             absPath:node.getAbsolutePath(),
                                             branch:"master",
                                             repoId:self.activeRepo,
                                             contentType: dm.dm.fw.getContentType(node.data.title),
                                             editable:false
                                     };

                                     if (params.contentType)
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
                                 self.removeContentByNode(node);
                             }
                     },
                     {
                             title: "Revert",
                             click: function(node) {
                                 if (!self.hasNodeStatus(node, "modified")) {
                                     alert("Nothing to revert");
                                 }
                                 else {
                                     self.revertContentByNode(node);
                                 }
                             }
                     }
                     ],

//////////////////////////////////////////////////////////////
//           Tree and nodes
//////////////////////////////////////////////////////////////
                    //
                    // Add icon to the node to indicate it's status:
                    // @node - the dynatree node
                    // @status - cached, modified, removed, added
                    //
                    addNodeStatus: function(node, path, status) {
                        function _addNodeStatus(node, status) {
                          // Can't change state for new node
                          if ((status == "cached" || status == "modified") && node.data.sha == undefined) {
                              return;
                          }
                          $(node.span).addClass("dynatree-ico-" + status);
                        }

                        if (node) { 
                          _addNodeStatus(node, status);
                          return;
                        }

                        var $tree = $(this.treeParentSelector).dynatree("getTree");

                        $tree.loadKeyPath(path, function(node, result) {
                            if (result == "ok") {
                               _addNodeStatus(node, status);
                            }
                        },  
                        "title");
                    },

                    //
                    // Remove the node status
                    // @node - the dynatree node
                    // @status - status string
                    //
                    rmNodeStatus: function(node, path, status) {
                        if (node) { 
                          $(node.span).removeClass("dynatree-ico-" + status);
                          return;
                        }

                        var $tree = $(this.treeParentSelector).dynatree("getTree");

                        $tree.loadKeyPath(path, function(node, result) {
                            if (result == "ok") {
                               $(node.span).removeClass("dynatree-ico-" + status);
                            }
                        },  
                        "title");
                    },
                    //
                    // Check the node status
                    // @node - the dynatree node
                    // @status - status string
                    // @return - boolean
                    //
                    hasNodeStatus: function(node, status) {
                        return $(node.span).hasClass("dynatree-ico-" + status);
                    },
                    
                    setTeeContextMenu:function(uid) {
                      this.treeCtxSelector = "#" + uid;
                    },
                    //
                    // Initialize the dynatree structure
                    // @parentSelector - No idea what is it
                    // @isReload       - No idea what is it
                    //
                    initTree: function (parentSelector, isReload) {
                        if (!self.activeRepo) {
                            self.treeParentSelector = parentSelector;
                            return;
                        }

                        var repo = self.repositories[self.activeRepo].repo;
                        self.treeParentSelector = parentSelector;

                        function updateTree(tree) {
                            var datax = {};
                            datax["tree"] = tree;
                            var real_tree = {}
                            real_tree = tree;
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
                                    $(span).bind('contextmenu', function(e) {
                                        var node = $.ui.dynatree.getNode(e.currentTarget);
                                        dm.dm.fw.ShowContextMenu(self.treeCtxSelector, e, node);
                                        e.preventDefault();
                                    });
                                },
                                onLazyRead: function(node) {
                                    if (node.data.isFolder) {
                                        $.ajax({
                                            url: urlArg + "list?path=/" + self.activeRepo + "/" + node.getAbsolutePath(),
                                            dataType: "json",
                                            success: function (data) {
                                                if (data)
                                                    node.append(data);
                                            }
                                        });
                                    }// IsFolder
                                },
                                onFocus: function(node) {
                                  // hide all context menus
                                  $(".context-menu").hide();
                                  // hide the color picker's menu
                                  $(".us-context-toolbox").hide();
                                  
                                  if (node.data.isFolder) {
                                    self.active = node.getAbsolutePath();
                                  }
                                  else {
                                    // get the neares parent folder or root
                                  }
                                },
                                onActivate: function(node) {
                                    // Nothing to load for folder
                                    if (node.data.isFolder) {
                                        return;
                                    }

                                    var title = node.data.title;
                                    var contentType = dm.dm.fw.getContentType(title);

                                    if (contentType) {
                                        var params =
                                        {
                                                viewid:self.euid,
                                                title:node.data.title,
                                                absPath:node.getAbsolutePath(),
                                                branch:self.activeBranch,
                                                isOwner:true,
                                                repoId:self.activeRepo,
                                                contentType:contentType,
                                                editable:false
                                        };

                                        dm.dm.fw.loadContent(params);
                                    }
                                }
                                    }); // dynatree
                        };

                        $.ajax({
                            url: urlArg + "list?path=" + self.activeRepo,
                            dataType: "json",
                            success: function (data) {
                                if (data)
                                  updateTree(data);
                            }
                        });
                    }// initTree method
            };
//////////////////////////////////////////////////////////////
//           Initialization
//////////////////////////////////////////////////////////////
            // Open the first repository
            if (repoId != null) {
                self.openRepository(repoId, isOwner);
            }
            else {
                // maybe we need to activate a select repo dialog here?
            }
            return self;
        };
    };
})(jQuery, dm);

//
// Class: GithubView
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
    // Github view manager is an abstraction which allow
    // to extract information about user's repositories (own, followed, starred etc..)
    // and switch between them
    //
    //  @param username - log-in user name
    //  @param access_token - secure access token
    //  @param url - optional param which allow to run service locally without SERVER !!!
    //
    dm.base.GithubViewsManager = function(username, access_token, url) {
        // local web site mode
        var isLocal = (url != undefined);
        var ISelectionObserver = this;
        var viewsMap = {};

        this.githubView = null;
        this.id = "us-github";
        this.title = "GitHub";
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
                  delete self.githubView;
                  self.githubView = null;

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
            var item = $(selector + " #us-github-list");
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
            $(selector).append('<ul id="us-github-list" style="list-style:none;">\
                    <li id="us-github-commit" class="us-left" title="Commit changes"><img src="http://umlsync.org/static/images/commit.png" class="ui-icon"></li>\
                    <li id="us-github-reload" class="us-left" title="Reload tree"><img src="http://umlsync.org/static/images/reload.png" class="ui-icon"></li>\
                    <li id="us-github-newdoc" title="New diagram"><img src="http://umlsync.org/static/images/newdoc.png" class="ui-icon"></li>\
                    <li id="us-github-revertdoc" title="Revert diagram"><img src="http://umlsync.org/static/images/revertdoc.png" class="ui-icon"></li>\
                    <li id="us-github-removedoc" title="Remove diagram"><img src="http://umlsync.org/static/images/deldoc.png" class="ui-icon"></li>\
            </ul>');
            // Initialize handlers
            $("#us-github-newdoc").click(function() {
                $(document).trigger("us-dialog-newdiagram", {view:self.githubView, path:"/"});
            });

            $("#us-github-commit").click(function() {
                if (self.githubView != null) {
                    self.githubView.commitContent();
                }
            });

            $("#us-github-reload").click(function() {
                if (self.githubView != null) {
                    self.githubView.reloadTree();
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
                    dm.dm.dialogs['Activate']("repo-selection-dialog");
                if (uid == "us-branch") {
                    var text = $("#us-repo .js-select-button").text();
                    var repoId = text.replace("/", "-");
                    dm.dm.dialogs['Activate']("branch-selection-dialog-" + repoId);
                }
            });
        };

        //
        // IViewManager::onViewManagerChange - activate the toolbox area helper
        // ------
        //
        this._activateRepoWidget = function(selector, flag) {
            var item = $("#switcher #us-repo-select #us-repo"),
              item2 = $("#switcher #us-repo-select #us-branch");
            if (item.length > 0 || item2.length > 0) {
              if (flag) {
                item.show();
                item2.show();
              }
              else {
                item.hide();
                item2.hide();
              }
              return;
            }

            // Init repo selection widget (not dialog)
            this._helperInitDropDownSelector('#switcher #us-repo-select', "us-repo",
                    {
                            filter:true,
                            mtitle: 'Repository',
                            title: 'Open/Switch repository',
                            onSelect: function(selectedTab, selectedItem) {
                                if (selectedTab == 'Yours') {
                                    // simply change repo
                                }
                                else if (selectedTab == 'Follow') {
                                    // open folow repository
                                }
                                else if (selectedTab == 'GIST') {
                                    // open gists
                                }
                            }//onSelect
                    }); // _helperInitDropDownSelector

            this._helperInitDropDownSelector('#switcher #us-repo-select', 'us-branch',
                    {
                            filter:true,
                            mtitle: 'Branch',
                            onSelect: function(selectedTab, selectedItem) {
                                if (selectedTab == 'Yours') {
                                    // simply change repo
                                }
                                else if (selectedTab == 'Follow') {
                                    // open gists
                                }
                                alert("SELECTED !!!");
                            }
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
                dm.dm.dialogs['SelectRepoDialog'](title, IViewsManager, descr);
            }
        },

        //
        // Add the number of repositories into the repo selection dialog
        // @param title - the title of tab in dialog
        // @param repoUrl - url of repository
        // @param IBranchSelectObserver - on branch select observer object
        // @param desc - branches description object
        //
        this.addBranchDialogWidget = function(title, repoUrl, IBranchSelectObserver, desc) {
            var repoId = repoUrl.replace("/", "-");
            if (dm.dm.dialogs) {
                dm.dm.dialogs['ChangeBranchDialog'](title, desc, repoId, IBranchSelectObserver);
            }
        },

        //
        //  Callback method which indicates that user has changed the
        //  repository.
        //  1. Check for the modifications in current repository
        //  2. Commit changes or reject them
        //
        this.onRepoSelect = function(title, repo, callback) {
            var githubView = this.githubView;
            var self = this;
            var isOwner = false; // Following repos

            function updateWidgetsStatus() {
                if (self.githubView == null) {
                    return;
                }

                var repoId = (self.githubView.activeRepo == null) ? "none" : self.githubView.activeRepo,
                  branchId = (self.githubView.activeBranch == null) ? "none" : self.githubView.activeBranch;

                $("#us-repo .js-select-button").text(repoId);
                $("#us-branch .js-select-button").text(branchId);
            }

            if (title == 'Yours' || title == 'GIST') {
              isOwner = true;
            }
            
            if (githubView != null) {
              // Do nothing for the same repository was selected
              if (githubView.activeRepo == repo) {
                if (callback) { callback();}
                return;
              }

              // First activation of repository
              // after switch to another view
              if (githubView.activeRepo == null) {
                githubView.openRepository(repo, isOwner);
                dm.dm.fw.addView2(self, githubView);
                updateWidgetsStatus();
                if (callback) { callback();}
                return;
              }

              // Skipped repo change during modified content
              // save dialog opening
              dm.dm.fw.handleModifiedContentOnRepoChange(githubView.activeRepo, function(isAccepted) {
                        if (!isAccepted) {
                            return;
                        }

                        if (githubView.hasModifications()) {
                            dm.dm.dialogs['ConfirmationDialog']({
                              title:"Change repository?",
                              description: "All modified files will be removed:",
                              buttons: {
                                    "remove": function() {
                                        githubView.openRepository(repo, true);
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
                                        githubView.commitContent(null, function(isOk) {
                                          if (isOk) {
                                            githubView.openRepository(repo, true);
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
                            githubView.openRepository(repo, true);
                            updateWidgetsStatus();

                        }
                    });
            }
            else {
              this.githubView = new IGithubView(repo, isOwner);
              dm.dm.fw.addView2(this.id, this.githubView);
              updateWidgetsStatus();
              if (callback) { callback();}
            }
        };

        //
        // Load content directly, without tree loading
        // @param repoId - github repo id (user/repo)
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
                        viewid: "github",
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
        // Method to return singlerton github object
        // @return - github object from github.js
        //
        // Note: dm.dm.* namespace for a singletone objects
        //
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

        //
        //  Function to covert the Github's tree structure to the dynaTree compatible JSON
        //  @data - github return value
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
        //  List of user repositories
        //
        var userRepositories = new Array();

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
                for (var r in repos) {
                    userRepositories.push(repos[r]['full_name']);
                }
            };

            if (!isLocal) {
                // Server-based use-case
                var user = github().getUser();
                user.repos(function(err, repos){ showRepos(err, repos, "Yours") });
            }
            else {
                // Local files access without service ON
                showRepos(null, 
                        [{full_name: 'umlsynco/diagrams'},
                         {full_name: 'umlsynco/amaterasuml'},
                         {full_name: 'umlsynco/github'}], "Yours");
            }

        };

        //
        // Implements IView interface
        //
        //
        var IGithubView = function (repoId, isOwner) {
            // Reading a repository
            //var repo = github().getRepo(username, repoId.split('/').pop());

            var self =
            {
                    euid: "github",
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
                    //    contents[sha] = {path: %ABS PATH%, content: data}, - cache of loaded contents
                    //    updated[path] = {sha:sum, content:data, orig: data}, - cache of modified contents
                    //    tree[sha] = {%github result%} - the tree blob from github
                    //    repo: repo,  - github.js repo instance
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

                        if (activeRepo != null && Object.keys(activeRepo.updated).length > 0) {
                            alert("All modified files will be lost !!!");
                        }

                        // Open a new repository
                        if (newRepo == null) {
                            newRepo = self.repositories[repoId] = {
                                    contents: {},
                                    updated: {},
                                    tree: {},
                                    repo: github().getRepo(repoId.split('/')[0], repoId.split('/')[1]), // user/repo
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
                        if (params.repoId != self.activeRepo) {
                            alert("Attemption to save to the not active repository or branch.");
                            return;
                        }

                        if (self.repositories[params.repoId] == undefined) {
                            alert("Can not identify repository:" + params.repoId);
                            return;
                        }

                        // Save new content
                        // Only new content should not have SHA summ
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
						//
						// Update the status of node
						//
						if (params.absPath)
						  self.addNodeStatus(null, params.absPath, "modified");
                    },

                    //
                    // Load content or get it from cache:
                    // ----
                    //
                    loadContent: function(params, callback) {

                        // Setup ownership parameter to indicate that
                        // it is possible to modify cotent
                        params.isOwner = (userRepositories.indexOf(params.repoId) >= 0);

                        // Check modified cache:
						// All modified files should be stored by absolute path
						//
                        if (params.absPath && self.repositories[params.repoId].updated[params.absPath]) {
                            callback.success(null, self.repositories[params.repoId].updated[params.absPath].content);
                            return;
                        }

                        // Check file cache of not modified content
						// 
                        if (params.sha && self.repositories[params.repoId].contents[params.sha]) {
                            callback.success(null, self.repositories[params.repoId].contents[params.sha].content);
                            self.repositories[params.repoId].contents[params.sha].refCount++;
                            return;
                        }

						// If sha not defined (embedded content use-case)
						// then we should check that file was not loaded before
						//
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

                        // Active or inactive repository:
                        var repo = self.repositories[params.repoId].repo,
                                // Editable if only data located on the active repo and branch
                                isEditable = (params.repoId == self.activeRepo && params.branch == self.activeBranch);

					    //
						// There are two ways to load content:
						// By SHA summ - when loading tree blob
						// By path - when loading embedded content
						//
                        if (params.sha) {
                            repo.getBlob(params.sha, function(err, data) {
                                if (data == null) {
                                    callback.error(err);
                                    return;
                                }

                                self.contentCachedNum++;
                                self.repositories[params.repoId].contents[params.sha] = {path: params.absPath, content:data, isOpen:true, refCount:1};
								self.addNodeStatus(null, params.absPath, "cached");

                                callback.success(err, data);
                                return;
                            });
                        }
						//
						// Load content by path and save SHA on load complete
						//
                        else if (params.absPath) {
                            var cPath = (params.absPath[0] == '/')? params.absPath.substring(1):params.absPath;
                            repo.contents(cPath,  function(err, data, response) {
                                if (err != null) {
                                    callback.error(err);
                                    return;
                                }
                                if (data.message) {
                                    callback.error(data.message);
                                    return;
                                }

                                var decodedData = (data.encoding == "base64") ? decodeContent(data) : data;

                                if (!decodedData) {
                                    callback.error("No data found in: " + cPath);
                                    return;
                                }
								self.addNodeStatus(null, params.absPath, "cached");
                                self.contentCachedNum++;
                                params.sha = data.sha;
								//
								// CACHE the result
								//
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
                    // or release cached content
                    // ----
                    //
                    releaseContent: function(params) {
                        if (params.sha != undefined
                                && self.repositories[params.repoId] != undefined
                                && self.repositories[params.repoId].contents[params.sha]) {
                            self.repositories[params.repoId].contents[params.sha].refCount--;
                            self.repositories[params.repoId].contents[params.sha].closeTime = new Date();
                        }
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
                        // in case of request of nodes from GitHub
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
                        var absPath,
                        flag = self.hasNodeStatus(node, "added"),
                        sha = node.parent.data.sha;

                        absPath = node.getAbsolutePath();
                        if (self.repositories[self.activeRepo].updated[absPath]) {
                            alert(flag ? "Content is not recoverable":"You are trying to remove modified content !");
                            delete self.repositories[self.activeRepo].updated[absPath];
                        }

                        if (flag) {
                            node.remove();
                        }
                        else {
                            self.rmNodeStatus(node, null, "modified");
                            self.addNodeStatus(node, null, "removed");
                            self.repositories[self.activeRepo].updated[absPath] = {content :null, parent_sha:sha, sha:node.data.sha};
                        }
                    },

                    //
                    // revert content revert the content changes
                    // @node - folder or content file
                    // ----
                    //
                    revertContentByNode: function(node) {
                        var absPath,
                        flag = self.hasNodeStatus(node, "added");
                        var bbb = self;

                        absPath = node.getAbsolutePath();
                        if (self.repositories[self.activeRepo].updated[absPath]) {
                            alert(flag ? "File will  be removed":"Content will be removed");

                            var tmp = self.repositories[self.activeRepo].updated[absPath];
                            if (tmp.sha && tmp.orig)
                                self.repositories[self.activeRepo].contents[tmp.sha] = {path: absPath, content:tmp.orig, isOpen:false, refCount:0}; // Reverted
                            delete self.repositories[self.activeRepo].updated[absPath];
                        }

                        if (flag) {
                            node.remove();
                        }
                        else {
                            self.rmNodeStatus(node, null, "modified");
                        }
                    },

                    //
                    // Reload the tree HEAD, and check for a conflicts
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
                        if (dm.dm.dialogs) {
                            dm.dm.dialogs['CommitDataDialog'](
                              self.repositories[self.activeRepo].updated,
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
                                         alert("You can not open removed content!");
                                         return;
                                     }

                                     var params =
                                     {
                                             viewid:self.euid,
                                             sha:node.data.sha,
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
                                    $(span).bind('contextmenu', function(e) {
                                        var node = $.ui.dynatree.getNode(e.currentTarget);
                                        dm.dm.fw.ShowContextMenu(self.treeCtxSelector, e, node);
                                        e.preventDefault();
                                    });
                                },
                                onLazyRead: function(node) {
                                    if (node.data.isFolder) {
                                        repo.getTree(node.data.sha, function(err, tree) {
                                            self.repositories[self.activeRepo].tree[node.data.sha] = tree;
                                            var datax = {};
                                            datax["tree"] = tree;
                                            var real_tree = {}
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
                                                sha:node.data.sha,
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

                        repo.getTree(self.activeBranch , function(err, tree) {
                            if (err) {
                                $.log("Failed to load a git repo's tree: " + err);
                            }
                            else {
                                updateTree(tree);
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

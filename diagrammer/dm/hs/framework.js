/*
 Class: framework

 Views and diagrams handler.
 it is required header, content and bottom options to make it resizeable

 Copyright:
 Copyright (c) UMLSync Inc. All rights reserved.

 URL:
 http://umlsync.org

 Version:
 1.0.0 (2012-03-21)
 */

(function ($, dm, undefined) {

    //@export:dm.hs.framework:plain
    dm.hs.framework = function (options) {
        var activeNode;
        var converter = new Showdown.converter({ extensions: ['umlsync'] });

        //
        // Singleton wrapper for the framework instance
        // dm.dm.fw - singletone object
        // ----
        //
        function getInstance(options) {
            dm.dm = dm.dm || {};
            if (!dm.dm['fw']) {
                // create a new instance
                dm.dm['fw'] = new framework(options);
            }

            // return the instance of the singletonClass
            return dm.dm['fw'];
        }

        //
        // Framework object
        // ----
        //
        var framework = function (options) {
            var tmp_opt = $.extend(true, {}, this.options, options);
            this.options = tmp_opt;

            this.counter = 0;
            this.loader = dm.dm.loader;
            this.diagrams = this.diagrams || {};
            this.markdown = this.markdown || {};
            this.contents = this.contents || {};
            this.embeddedContents = this.embeddedContents || {};
            this.openDiagramMenuOnFirstInit = false;

            this._helperInitializeToolBox(dm.dm.loader);

            if (dm.ms['dg']) {
                dm.dm['dialogs'] = new dm.ms['dg'](this);
                this._helperInitMainMenu();
            }

            // Initialize a framework structure
            $("#" + this.options.content).append('\
                    <div id="' + this.options.content + '-left" style="width:200px;height:100%;padding:0;margin:0;position:absolute;">\
                      <div id="switcher" style="background-color:gray;">\
                        <div id="us-viewmanager" class="ui-state-default"></div>\
                        <div id="us-repo-select"></div>\
                        <div id="us-toolbox"></div>\
                        <div id="us-treetabs"></div>\
                      </div>\
                    </div>\
                    <div id="' + this.options.content + '-left-right-resize" style="width:6px;left:200px;height:100%;position:absolute;padding:0;margin:0;border:0px solid gray;background-color:gray;cursor: col-resize;"></div>\
                    <div id="' + this.options.content + '-right" style="width:100px;left:206px;height:100%;position:absolute;padding:0;margin:0;">\
                      <div id="tabs"><ul></ul></div>\
                    </div>');

            var self = this;
            self._helperUpdateFrameWork(true); // $(window).trigger("resize"); ?

            $(window).resize(function (e) {
                if ((e.target === window) || (e.target == window)) {
                    self._helperUpdateFrameWork(true);
                }
            });

            // Coloring the switcher widget according to jQuery ui color-scheema
            var $switcher = $('#switcher');
            $switcher.addClass('ui-switcher ui-widget ui-helper-reset ui-switcher-icons');

            var $tabs = $("#tabs")
                .tabs(
                {
                    'tabTemplate': '<li><a href="#{href}"><span>#{label}</span></a><a class="ui-corner-all"><span class="ui-test ui-icon ui-icon-close"></span></a></li>',
                    'scrollable': true,
                    'add': function (event, ui) {
                        if (self.contents) {
                            self.selectedContentId = "#" + ui.panel.id;
                        }
                        $tabs.tabs('select', '#' + ui.panel.id);
                    },
                    'select': function (event, ui) {
                        /*if (self.contents) {
                         var params = null;
                         if (self.selectedContentId) {
                         params = self.contents[self.selectedContentId];
                         if (params && params.contentType) {
                         if (self.SnippetMode) {
                         // Check if snippet available
                         var snippet = self.formatHandlers[params.contentType].snippetMode(self.selectedContentId, false);
                         if (snippet) {
                         alert(":" + snippet);
                         }
                         }
                         self.formatHandlers[params.contentType].onFocus(self.selectedContentId, false);
                         }
                         }

                         self.selectedContentId = "#" + ui.panel.id;
                         params = self.contents[self.selectedContentId];

                         if (params && params.contentType) {
                         self.formatHandlers[params.contentType].onFocus(self.selectedContentId, true);
                         if (self.SnippetMode) {
                         self.formatHandlers[params.contentType].snippetMode(self.selectedContentId, true);
                         }
                         return;
                         }
                         }*/
                        self._helperCleanUpCanvas();
                        self._helperUpdateFrameWork(true);
                    },
                    'show': function (event, ui) {
                        if (self.contents) {
                            var params = null;
                            if (self.selectedContentId) {
                                params = self.contents[self.selectedContentId];
                                if (params && params.contentType) {
                                    if (self.SnippetMode) {
                                        // Check if snippet available
                                        var snippet = self.formatHandlers[params.contentType].snippetMode(self.selectedContentId, null);
                                        if (snippet) {
                                            self.activeSnippet = self.activeSnippet || new Array();
                                            self.activeSnippet.push(snippet);
                                        }
                                    }
                                    self.formatHandlers[params.contentType].onFocus(self.selectedContentId, false);
                                }
                            }

                            self.selectedContentId = "#" + ui.panel.id;
                            params = self.contents[self.selectedContentId];

                            if (params && params.contentType) {
                                self.formatHandlers[params.contentType].onFocus(self.selectedContentId, true);
                                if (self.SnippetMode) {
                                    self.formatHandlers[params.contentType].snippetMode(self.selectedContentId, self.snippetsHandler);
                                }
                                return;
                            }
                        }
                        self._helperCleanUpCanvas();
                        self._helperUpdateFrameWork(true);
                    }
                });

            $("#tabs").css({'background-color': '#7E8380'}).css({'background': "none"});

            // Stupid initialization of single cancas
            var canvasTop = (this.options.notabs) ? 13 : 44;
            $("#tabs").append('<canvas id="SingleCanvas" class="us-canvas" style="left:18px;top:' + canvasTop + 'px;" width="1040" height="600">YOUR BROWSER DOESN\'t SUPPORT CANVAS !!!</canvas>');

            // Depricated for a while
            if (this.options.notabs)
                $("#tabs ul.ui-tabs-nav").hide();

            // AUTOMATED TEST WORK_AROUND !!!
            $("#content-right DIV.ui-scrollable-tabs").scroll(
                function (e) {
                    $(this).scrollTop(0);
                    e.preventDefault();
                    e.stopPropagation();
                });

            $('#tabs span.ui-test').live('click', function () {
                var index = $('li', $tabs).index($(this).parent().parent()),
                    ahref = $(this).parent().parent().children("A:not(.ui-corner-all)").attr("href");

                //
                // Close the content which was opened
                // TODO: move it to the content section
                // ----
                //
                function closeContent(saveIt) {
                    $(".diagram-menu").hide();

                    if (self.contents && self.contents[ahref]) {
                        function dropTabAndContent() {
                            // release content cache
                            var params = self.contents[ahref];
                            if (self.views[params.viewid].view.releaseContent) {
                                // Release content counter
                                self.views[params.viewid].view.releaseContent(params);
                                // Release embedded content counters
                                for (var v in self.embeddedContents) {
                                    if (v.indexOf(ahref) >= 0) {
                                        var params2 = self.embeddedContents[v];
                                        // Free cache of handler
                                        if (self.formatHandlers[params2.contentType])
                                            self.formatHandlers[params2.contentType].close(v);
                                        // release content counter for IView cache
                                        self.views[params.viewid].view.releaseContent(params2);
                                        // delete an embedded content cache
                                        delete self.embeddedContents[v];
                                    }
                                }
                            }
                            // Free content cache for handler
                            if (self.formatHandlers[params.contentType])
                                self.formatHandlers[params.contentType].close(ahref);

                            delete self.contents[ahref];
                            $tabs.tabs('remove', index);
                            $(ahref).remove();
                            self._helperCleanUpCanvas();
                        }

                        if (saveIt) {
                            self.saveContent(ahref, true, dropTabAndContent);
                        }
                        else {
                            dropTabAndContent();
                        }
                    }
                    else {
                        $tabs.tabs('remove', index);
                        $(ahref).remove();
                    }
                }

                if (!self.contents[ahref].isModified) {
                    closeContent(false);
                    return;
                }

                dm.dm.dialogs['ConfirmationDialog'](
                    {
                        title: "Save",
                        description: 'Save file "' + self.contents[ahref].title + '" ?',
                        buttons: {
                            "Yes": function () {
                                $(this).dialog("close");
                                closeContent(true);
                            },
                            "No": function () {
                                $(this).dialog("close");
                                closeContent(false);
                            },
                            "Cancel": function () {
                                $(this).dialog("close");
                            }
                        }
                    });// dialog
            });

            var $treetabs = $("#us-treetabs");

            // Draggable border for between left and right content areas
            $("#content-left-right-resize")
                .draggable({
                    axis: 'x',
                    'drag': function (ui) {
                        self._helperUpdateFrameWork(false, ui);
                    },
                    stop: function (ui) {
                        self._helperUpdateFrameWork(false, ui, true);
                    }
                });

            // Initialize the key handler
            this._helperInitializeKeyHandler(dm.dm.loader);

            this.left_counter = 0;
            this.right_counter = 0;

            // Update the sizes first time
            this._helperUpdateFrameWork(true);

            self.wdddd = true;

            self.initializeHandlers();
        }

        framework.prototype = {
            options: {
                tabRight: "diag",
                embedded: "embedded",
                tabLeft: "view-",
                tabs: "tabs",
                top: "#content-header",
                bottom: "#content-bottom",
                content: "content"
            },
            //////////////////////////////////////////////////////////////
            //           ViewManager and Views
            //////////////////////////////////////////////////////////////
            // an array with views
            viewmanagers: {},
            // an active view manager
            activeViewManagerId: null,
            //
            // List of registered views
            //
            views: {},
            //
            // List of format handlers
            //
            formatHandlers: {},

            //
            // queue of delayed snippets
            // which is waiting for content load completion
            //
            snippetsQueue: new Array(),
            //
            // Initiazlize all registered handlres
            // TODO: load the list of format handlers dynamically
            //
            initializeHandlers: function () {
                var self = this;
                var obj = new dm.hs.umlsync({onModified: function (selector, flag) {
                    self.onContentModifiedStateChanged(selector, flag);
                },
                onLoadComplete: function(selector, status) {
                    self.onLoadComplete(selector, status);
                }
                });
                this.formatHandlers[obj.getUid()] = obj;

                obj = new dm.hs.markdown({onModified: function (selector, flag) {
                    self.onContentModifiedStateChanged(selector, flag);
                },
                    onEmbeddedContentHandler: function (contentParams, parentContentParams, isClose) {
                        if (isClose) {
                            //Reduce an IView cache content counter
                            if (self.views[contentParams.viewid].view.releaseContent) {
                                self.views[contentParams.viewid].view.releaseContent(contentParams);
                            }

                            // Free content cache for the corresponding handler
                            if (self.formatHandlers[contentParams.contentType]) {
                                self.formatHandlers[contentParams.contentType].close(contentParams.selector);
                            }

                            // Destroy the reference from this framwork
                            if (self.embeddedContents[contentParams.selector]) {
                                delete self.embeddedContents[contentParams.selector];
                            }
                        }
                        else {
                            // Load content
                            self.loadContent(contentParams, parentContentParams);
                        }
                    },
                    embedded: self.options.embedded
                });
                this.formatHandlers[obj.getUid()] = obj;

                obj = new dm.hs.codeview();
                this.formatHandlers[obj.getUid()] = obj;

                obj = new dm.hs.snippets();
                this.snippetsHandler = obj;
            },
            //
            // Register IViewManager (Github, Bitbucket, Eclipse)
            //
            registerViewManager: function (viewmanager, isDefault) {
                var floatStyle = "";
                if (Object.keys(this.viewmanagers).length > 0) {
                    floatStyle = 'style="float:right;"';
                }
                this.viewmanagers[viewmanager.getId()] = viewmanager;
                $("#us-viewmanager").append('<span id="' + viewmanager.getId() + '" ' + floatStyle + '>' + viewmanager.getTitle() + '</span>');

                //
                // On view manager change handler
                // 1. Notify an active view manager
                // 2. Open new view manager
                // ----
                //
                $("#" + viewmanager.getId()).click(this, function (e) {
                    var fw = e.data,
                        sss = this;
                    // Check the registered view
                    if (fw.viewmanagers[this.id]) {
                        var viewman = fw.viewmanagers[this.id],
                            viewmanId = this.id;

                        // Do nothing for the same view manager
                        if (fw.activeViewManagerId == this.id) {
                            // notify handler on click again
                            viewman.onViewManagerChange(viewmanId, function () {
                                fw._helperUpdateFrameWork(true);
                            });

                            return;
                        }

                        // Activate view manager is no view manager activated before
                        if (fw.activeViewManagerId == null) {
                            fw.viewmanagers[this.id].onViewManagerChange(this.id, function () {
                                fw._helperUpdateFrameWork(true);
                            });
                            return;
                        }

                        dm.dm.dialogs['ConfirmationDialog'](
                            {
                                title: "Data provider change:",
                                description: 'Would you like to switch to  "' + fw.viewmanagers[this.id].getTitle() + '" ?',
                                buttons: {
                                    "Yes": function () {
                                        $(this).dialog("close");
                                        fw.viewmanagers[fw.activeViewManagerId]
                                            .onViewManagerChange(viewmanId, function (isAccepted) {
                                                if (isAccepted) {
                                                    viewman.onViewManagerChange(viewmanId, function () {
                                                        fw._helperUpdateFrameWork(true);
                                                    });
                                                    fw.activeViewManagerId = viewmanId;
                                                }
                                            });
                                    },
                                    "Cancel": function () {
                                        $(this).dialog("close");
                                    }
                                }
                            });// dialog
                    }
                    else {
                        alert("Absolutely unexpected error: viewmanager not found!");
                    }
                });

                if (isDefault) {
                    this.activeViewManagerId = viewmanager.getId();
                }
            },

            //
            // Switch all opened content to editable or non editable
            // ----
            //
            switchToEditable: function (viewId, repoId, branchId, isEditable) {
                for (var t in this.contents) {
                    if (this.contents[t]
                        && this.contents[t].repoId == repoId
                        && this.contents[t].branch == branchId
                        && this.contents[t].viewid == viewId) {
                        var $edit = $(t + " #us-diagram-edit");
                        if (isEditable) {
                            $edit.parent().show();
                        }
                        else {
                            if ($edit.html() == "View") {
                                $edit.trigger("click");
                            }
                            $edit.parent().hide();
                        }

                    }
                }
            },

            //
            // Register the IView object
            // and initiate element for tree insertion
            // Note: Today it looks stuipid but previously it was an idea to
            //       support multiple trees and switch between them on repo change or on switch to Eclipse
            //       and keep all modifications in buffer(for GitHubView only because for an Eclipse we always POST changes)
            //
            addView2: function (name, IView) {
                //TODO: don't load view if name/euid is reserved yet !
                //    it could help to prevent some mess with localhost views
                var id = this.options.tabLeft + this.left_counter;
                this.left_counter++;
                $("#us-treetabs").children("DIV").hide();
                $("#us-treetabs").append("<div id='" + id + "'></div>");

                id = "DIV#" + id;
                var $treetabs = $("#us-treetabs");

                $(id).append("<div id='tree'></div>");
                var self = this;

                function initCtxMenu(vid, items, view) {
                    $('<ul id="' + vid + '" class="context-menu" ></ul>').hide().appendTo('body');


                    $("#" + vid).listmenu({
                        selector: "menu-item",
                        path: "./",
                        data: items,
                        onSelect: function (item) {
                            if (item.click) {
                                item.click(activeNode, view)
                                $(".context-menu").hide();
                                $("#context-toolbox").hide();
                            }
                        }
                    });
                }

                self.views = self.views || {};
                self.views[IView.euid] = {};
                self.views[IView.euid]['view'] = IView;

                if (IView.ctx_menu) {
                    var treeCtxMenu = "view-" + IView.euid + this.left_counter;
                    initCtxMenu(treeCtxMenu, IView.ctx_menu, IView);
                    IView.setTeeContextMenu(treeCtxMenu);

                    if (IView['element_menu']) {
                        self.views[IView.euid]['element_menu'] = {};
                        var counter = 0;
                        for (var r in IView['element_menu']) {
                            var rs = r.split(","), // Multiple elements support "Package,Subsystem"
                                nm = IView.euid + "-" + counter;
                            for (var h in rs) {
                                self.views[IView.euid]['element_menu'][rs[h]] = nm;
                            }
                            initCtxMenu("view-" + nm, IView['element_menu'][r], IView);
                            counter++;
                        }
                    }
                }

                IView.initTree(id + " #tree");

                this.activeView = IView.euid; // only 'github'

                return id;
            },

            //
            //  Return the active view unique id
            //  see addView2 for more details
            //
            getActiveView: function () {
                return this.activeView;
            },
            //////////////////////////////////////////////////////////////
            //           Repositories and branches
            //////////////////////////////////////////////////////////////
            //
            // Return an active repository under the current active view
            //
            getActiveRepository: function () {
                var text = this.getActiveView();
                if (!this.views[text])
                    return "none";
                return (this.views[text].view.getActiveRepository() || "none" );
            },
            //
            // Return an active branch under the current active view
            //
            getActiveBranch: function () {
                var text = this.getActiveView();
                if (!this.views[text])
                    return "none";
                return (this.views[text].view.getActiveBranch() || "none" );
            },
            //////////////////////////////////////////////////////////////
            //           Trees and paths
            //////////////////////////////////////////////////////////////
            //
            // Get an absolute path of active node or "/"
            //
            getActiveTreePath: function () {
                var text = this.getActiveView();
                if (!this.views[text])
                    return "/";
                return (this.views[text]['view'].active || "" ) + "/";
            },
            //
            // Return the available folders for the concrete folder
            // Uses for autocomplete functionality
            //
            getSubPaths: function (path, sp_callback) {
                var text = this.getActiveView();
                if (!this.views[text])
                    return null;
                return this.views[text]['view'].getSubPaths(path, sp_callback);
            },
            //
            // Check that content with such name do not exist
            // Uses for autocomplete functionality
            //
            checkContentName: function (name) {
                var text = this.getActiveView();
                if (!this.views[text])
                    return null;
                return this.views[text]['view'].checkContentName(name);

            },
            //////////////////////////////////////////////////////////////
            //           Menus main, diagram, context
            //////////////////////////////////////////////////////////////
            //
            // Create the diagram accordion menu
            //
            // Why it is here ?
            // It could be a common approach for the menu element creation.
            // innerHtml indicates that menu could contain any 3pp items.
            //
            // The major idea is to split items by vendors and categories and
            // select the vendors/category dynamically on tab activation.
            // For example: type - umlsync/packages - indicates that vendor is "umlsync" and category is "packages"
            //              Therefore it is up to format handler provider what to show: it could be all "umlsync" menus or only "packages".
            //
            CreateDiagramMenu: function (type, innerHtml, callback) {
                var len = $("#accordion").length;
                if (len) {
                    $("#accordion").accordion('destroy').append("<h3 aux='" + type + "'><a href='#'>" + type + " diagram</a></h3>" + innerHtml).accordion({'active': len, autoHeight: false, clearStyle: true});
                } else {
                    var header = '<div id="diagram-menu-header" class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix">\
                                <span id="ui-dialog-title-vp_main_menu" class="ui-dialog-title">Toolbox</span>\
                                <a class="ui-dialog-titlebar-close ui-corner-all" href="#" role="button">\
                                <span class="ui-icon ui-icon-closethick">close</span></a></div>';

                    $("#tabs").append("<div class='diagram-menu ui-dialog ui-widget ui-widget-content ui-corner-all'>" + header + "<div id='accordion'><h3 aux='" + type + "'><a href='#'>" + type + " diagram</a></h3>" + innerHtml + "</div></div>");

                    $(".diagram-menu").draggable({'containment': '#tabs', 'cancel': 'div#accordion'});

                    $("#accordion").accordion({'active': 0, autoHeight: false, clearStyle: true});

                    if (!this.openDiagramMenuOnFirstInit) {
                        $(".diagram-menu").hide();
                    }
                    $("#diagram-menu-header a.ui-dialog-titlebar-close").click(function () {
                        $("div.diagram-menu #accordion").slideToggle();
                    });
                }
                if (callback) {
                    callback(len); // len == index
                }
            },
            //
            //  Switch to the corresponding
            //  menu item
            //
            ActivateDiagramMenu: function (type) {
                var menuIsActive = false;
                var len = $("#accordion").length;
                if (len) {
                    var idx = -1;
                    len = 0; // Wrong length earlier, have to re-calculate it again
                    $("#accordion").find("h3").each(function (index) {
                        ++len;
                        if ($(this).attr("aux") == type) {
                            idx = index;
                            menuIsActive = true;
                        }
                    });

                    if (idx >= 0) {
                        $("#accordion").accordion({'active': idx});
                    }
                }
                $("#accordion").children("DIV").css("width", "");
                return menuIsActive;
            },
            //
            // Initialize the diagram creation menu
            //
            _helperInitMainMenu: function () {
                dm.dm.loader.LoadMainMenuData(function (data) {
                    dm.dm.dialogs['NewDiagramDialog'](data);
                });
                dm.dm.dialogs['NewFolder']();
                dm.dm.dialogs['SaveAs']();
            },
            //
            // Show the context menu for the file tree
            //
            'ShowContextMenu': function (name, event, node) {
                $.log("SHOW: " + name);
                $(".context-menu").hide();
                if (name) {
                    activeNode = node;
                    $(name + ".context-menu").css("left", event.clientX).css("top", event.clientY).show();
                }
            },
            //
            // Show the context menu extension for the diagram elements
            //
            'ShowElementContextMenu': function (desc, viewid, data, event) {
                activeNode = data;
                var self = dm.dm.fw;
                desc = data.options.type;
                $.log("ShowElementContextMenu: " + desc + "   VID: " + viewid + "  DATA: " + data.options + "  TYPE: " + data.options.title + " DESC:" + data.options.description);
                if (self.views
                    && self.views[viewid]
                    && self.views[viewid]['element_menu']
                    && self.views[viewid]['element_menu'][desc]) {
                    // Enable the context menu for element
                    var uniqueName = "#view-";
                    uniqueName += self.views[viewid]['element_menu'][desc];// Id of the menu
                    $.log("SHOW: " + uniqueName);
                    var $elem = $(uniqueName + ".context-menu");
                    if (data == undefined) {
                        $elem.hide({delay: 1000});
                    } else {
                        $elem.css("left", event.clientX - 3).css("top", event.clientY + 3).show()
                    }
                }
            },
            //////////////////////////////////////////////////////////////
            //            Content management
            //////////////////////////////////////////////////////////////
            selectedContentId: null,
            //
            // add new snippet element
            // @params - content description
            // @data - default value
            //
            addNewSnippets: function (params, data) {
                dm.dm.dialogs['SnippetNavigator'](params, this, data);
            },
            //
            // add new content
            // @param params - the description of content
            // @data - initial values
            //
            addNewContent: function (params, data) {
                var tabname = this.options.tabRight + this.counter;

                $("#" + this.options.tabs)
                    .append('<div id="' + tabname + '"></div>')
                    .tabs('add', '#' + tabname, params.title);
                tabname = "#" + tabname;

                // Enable diagram menu
                //$(tabname).attr("edm", true);
                //$(".diagram-menu").show();

                //tabs("add", tabname, name);
                this.counter++;

                //this.openDiagramMenuOnFirstInit = true;

                if (params.absPath) {
                    // Save an empty diagram. It could be new diagram or
                    this.views[params.viewid].view.saveContent(params, data, true);
                }

                // Add content to cache
                this.contents[tabname] = params;

                // Open content as regular one, but with predefined values
                this.formatHandlers[params.contentType].open(tabname, params, data);

                // Switch to editable
                this.formatHandlers[params.contentType].switchMode(tabname, true);

                // Simple toolbox for each document
                this.appendContentToolbox(tabname, params);

                this._helperUpdateFrameWork(true);
            },
            //
            // add new markdown content
            // @param params - the description of content
            //
            addMarkdownContent: function (params) {
                var tabname = this.options.tabRight + this.counter;
                var defaultMarkdownData = "Goodby Word!";

                $("#" + this.options.tabs)
                    .append('<div id="' + tabname + '"></div>')
                    .tabs('add', '#' + tabname, params.title);
                tabname = "#" + tabname;

                // Enable diagram menu
                $(tabname).attr("edm", true);
                $(".diagram-menu").hide();

                //tabs("add", tabname, name);
                this.counter++;

                var self = this;

                if (params.absPath) {
                    // Save an empty diagram. It could be new diagram or
                    self.views[params.viewid].view.saveContent(params, defaultMarkdownData, true);
                }
                // Add content into the framework cache
                self.contents[tabname] = params;

                self.loadMarkdown(tabname, params, defaultMarkdownData);

                // Simple toolbox for each document
                self.appendContentToolbox(tabname, params);

                this._helperUpdateFrameWork(true);
            },
            //
            // add new diagram content
            // @param baseType - base type of diagram (important for sequence diagrams)
            // @param type - type of diagram
            // @param params - the content description params
            //
            addDiagramContent: function (baseType, type, params) {
                var tabname = this.options.tabRight + this.counter;

                $("#" + this.options.tabs)
                    .append('<div id="' + tabname + '"></div>')
                    .tabs('add', '#' + tabname, params.title);
                tabname = "#" + tabname;

                // Enable diagram menu
                $(tabname).attr("edm", true);
                $(".diagram-menu").show();

                //tabs("add", tabname, name);
                this.counter++;
                if (type == "sequence")
                    baseType = "sequence";

                this.openDiagramMenuOnFirstInit = true;

                if (params.absPath) {
                    // Save an empty diagram. It could be new diagram or
                    this.views[params.viewid].view.saveContent(params, "{baseType:'" + baseType + "',type:'" + type + "'}", true);
                }

                // Add content to cache
                this.contents[tabname] = params;

                this.formatHandlers[params.contentType].open(tabname, params, {type: type, base_type: baseType});

                // Simple toolbox for each document
                this.appendContentToolbox(tabname, params);

                this._helperUpdateFrameWork(true);
            },

            //
            // Save snippets content, no tab changes required
            // simply save content to the view
            //
            saveSnippetsContent: function(params, snippets) {
                // Drop snippet bubble
                $("#snippet_bubble").remove();

                if (params != undefined) {
                    params.repoId = this.getActiveRepository();
                    params.viewid = this.getActiveView();
                    params.branch = this.getActiveBranch();
                    var data =
                    {
                      provider: {
                        php: 'GitHub',
                        repo: params.repoId,
                        branch: params.branch
                      },
                      snippets: [
                      ]
                    };

                    for ( var s in snippets ) {
                        var info = snippets[s];
                        data.snippets[s] = {
                            msg: info.msg,
                            position: info.position,
                            params: {
                                absPath: info.params.absPath,
                                contentType: info.params.contentType,
                                revision: info.params.sha
                            }};
                    }
                    this.views[params.viewid].view.saveContent(params, data, params.isNewOne);
                }
            },

            //
            // Save content in the concreate view cache
            // @param tabid - jquery.ui.tabs id
            // @param isTabClosed - indicate if tab was closed
            //
            saveContent: function (tabid, isTabClosed, callback) {
                var self = this;
                var params = self.contents[tabid];

                // Check if absolute path was not defined then use SaveAs dialog
                if (params != undefined && params.absPath == null) {
                    params.repoId = self.getActiveRepository();
                    params.viewid = self.getActiveView();
                    params.branch = self.getActiveBranch();

                    if (params.repoId == undefined || params.repoId == "none") {
                        alert("You need to select a repository to store this content!");
                        return;
                    }

                    if (params.branch == undefined || params.branch == "none") {
                        alert("You need to select a branch to store this content!");
                        return;
                    }

                    dm.dm.dialogs['Activate']("save-as-dialog", function (result) {
                        self.contents[tabid].absPath = result;
                        self.contents[tabid].title = result.split('/').pop();
                        self._saveContentHelper(tabid, isTabClosed);
                        if (callback != undefined)
                            callback();
                    });
                }
                else {
                    self._saveContentHelper(tabid, isTabClosed);
                    if (callback != undefined)
                        callback();
                }
            },
            _saveContentHelper: function (tabid, isTabClosed) {
                var self = this;

                if (!self.contents[tabid]) {
                    return;
                }
                var params = self.contents[tabid];

                if (!self.views || !self.views[params.viewid] || !self.views[params.viewid].view) {
                    alert("View: " + params.viewid + " was not initialize.");
                    return;
                }

                var params = self.contents[tabid];
                if (params && params.contentType) {
                    var data = self.formatHandlers[params.contentType].getDescription(tabid, isTabClosed); // isTabClosed == updateCache ?
                    //
                    // data is null/undefined if there is no changes
                    // but framework should not request SAVE in no changes available
                    //
                    if (data) {
                        self.views[params.viewid].view.saveContent(params, data, params.isNewOne);
                    }

                    // Modify the framework state for the saved content
                    if (!isTabClosed) {
                        // change the state of content
                        self.onContentModifiedStateChanged(tabid, false);
                    }
                    return;
                }

                // Saved the diagram description:
                if (self.contents[tabid].contentType == "dm") { // Diagram
                    if (!self.diagrams[tabid])
                        return;
                    var data = self.diagrams[tabid].getDescription();
                    self.views[params.viewid].view.saveContent(params, data, params.isNewOne);

                    // Keep the current state as saved to prevent changes on Ctrl-Z/Y
                    self.diagrams[tabid].saveState();
                }
                else if (self.contents[tabid].contentType == "md") { // Markdown
                    var $md = $(tabid + " #markdown")
                    if ($md.length > 0) {
                        self.markdown[tabid] = $md.val();
                    }

                    // Save the markdown content
                    self.views[params.viewid].view.saveContent(params, self.markdown[tabid], params.isNewOne);

                    // Diagram has listener on destroy,
                    // but there is no destroy listener for markdown
                    if (isTabClosed) {
                        self.views[params.viewid].view.releaseContent(params);
                    }
                }
            },
            //
            // Toolbox for each content type: markdown or diagram.
            // Contains edit/view, getLink and full-screen optional
            // @param selector - CSS selector of content area
            // @param params - content description params
            //
            appendContentToolbox: function (selector, params) {
                var self = this,
                    absPath = "http://umlsync.org/github/" + params.repoId + "/" + params.branch + "/" + params.absPath;

                //
                // Not embedded content use-case
                //
                if (params.selector == undefined) {
                    var edit = (params.editable == true) || (params.editable == "true"),
                        editBullet = '<a id="us-link"><span id="us-diagram-edit">' + (edit ? "View" : "Edit") + '</span></a>';

                    var $selrt = $(selector);
                    // switch elements to the view mode
                    if (!edit)
                        $selrt.addClass("us-view-mode");

                    $selrt.append('<span class="us-diagram-toolbox">\
                                <a id="us-link"><span id="us-getlink">Get link</span></a>\
                                ' + editBullet + '\
                                <br>\
                                <div id="us-getlink-content"><label>Absolute path:</label><p><input value="' + absPath + '"/></p>\
                                </div>\
                        </span>');

                    // It is not possible to edit file if it is defined by sha (and path unknown)
                    // or if user is not owner/commiter of repository
                    if ((!params.isOwner || params.absPath == undefined || params.absPath == null) && !params.isNewOne) {
                        $(selector + " #us-diagram-edit").parent().hide();
                    }

                    // No path defined
                    if (params.isNewOne) {
                        $(selector + " #us-getlink").parent().hide();
                    }

                    //
                    // Edit/View switcher
                    //
                    $(selector + " #us-diagram-edit").click(function () {
                        //
                        // Handle the UI button elements
                        //
                        var text = $(this).text(),
                            editFlag = false;
                        if (text == "Edit") {
                            $(this).text("View");
                            editFlag = true
                        }
                        else {
                            $(this).text("Edit");
                        }

                        //
                        // Handle the content modes
                        //
                        self.formatHandlers[params.contentType].switchMode(selector, editFlag);
                        return;

                        /* If content is diagram
                         if (params.contentType == "dm") {
                         var did = self.diagrams[self.selectedContentId];
                         if (did != undefined) {
                         did._setWidgetsOption("editable", editFlag);
                         // Handle the diagram menu status
                         var $selrt = $(selector).attr("edm", editFlag);
                         if (editFlag) {
                         $(".diagram-menu").show();
                         // Show the refernces close-icons
                         $selrt.removeClass("us-view-mode");
                         $(selector + " div#us-references .ui-icon-close").show();
                         self['ActivateDiagramMenu'](did.options['type']);
                         } else {
                         $(".diagram-menu").hide();
                         // Hide the refernces close-icons
                         $selrt.addClass("us-view-mode");
                         }
                         }
                         }
                         // if content is markdown code
                         else if (params.contentType == "md") {
                         self.editMarkdown(selector, params);
                         }*/
                    });

                }
                // EMBEDDED CONTENT
                else {
                    $(selector).append('<span class="us-diagram-toolbox">\
                                <a id="us-link"><span id="us-getlink">Get link</span></a>\
                                <a id="us-link"><span class="us-diagram-edit">Open</span></a>\
                                <br>\
                                <div id="us-getlink-content"><label>Absolute path:</label><p><input value="' + absPath + '"/></p>\
                                </p></div>\
                        </span>');

                    $(selector + " .us-diagram-edit").click(params, function (event) {
                        var params = event.data;
                        var clonedParams = $.extend(true, {}, params);
                        delete clonedParams['selector'];

                        clonedParams.editable = params.isOwner && params.editable;
                        self.loadContent(clonedParams);
                    });
                }

                $(selector + " #us-getlink").click(params, function (event) {
                    self.cachedLink = event.data;
                    $(selector + " #us-getlink-content").toggle();
                });
            },
            //
            // Simple editor of markdown,
            // Switch markdown to edit mode
            // @param selector - CSS content selector
            // @param params - content description params
            // @param editMode - the direction of edit OR view
            //
            editMarkdown: function (selector, params, editMode) {
                var isEditMode = ($(selector + " div#readme").length == 0),
                    self = this;

                if (isEditMode == editMode)
                    return;

                if (isEditMode) {
                    // get entered text
                    var data = $(selector + " #markdown").val();

                    // Save content in storage cache
                    //self.views[params.viewid].view.saveContent(params, data);

                    // remove edit UI elements
                    $(selector + " #markdown").hide();
                    $(selector + " span.us-toolbox-header").hide();

                    // Load an updated markdown
                    this.loadMarkdown(selector, params, data);
                }
                else {
                    $(selector + " div#readme").remove();

                    // Hide/Show editor menu
                    if ($(selector + " #markdown").length > 0) {
                        $(selector + " span.us-toolbox-header").show();
                        $(selector + " #markdown").show();
                        return;
                    }

                    function getSelection() {
                        return (!!document.getSelection) ? document.getSelection() :
                            (!!window.getSelection) ? window.getSelection() :
                                document.selection.createRange().text;
                    }


                    // toolbox descriptor
                    var rrrr = '<span class="us-toolbox-header"><ul style="list-style:none outside none;">\
                                <li class="us-toolbox-button us-toolbox-h1"><a title="Heading 1 [Ctrl+1]" accesskey="1" postfix="\n========\n">First Level Heading</a></li>\
                                <li class="us-toolbox-button us-toolbox-h2"><a title="Heading 2 [Ctrl+2]" accesskey="2" postfix="\n--------\n" href="">Second Level Heading</a></li>\
                                <li class="us-toolbox-button us-toolbox-h3"><a title="Heading 3 [Ctrl+3]" accesskey="3" prefix="### " href="">Heading 3</a></li>\
                                <li class="us-toolbox-button us-toolbox-h4"><a title="Heading 4 [Ctrl+4]" accesskey="4" prefix="#### " href="">Heading 4</a></li>\
                                <li class="us-toolbox-button us-toolbox-h5"><a title="Heading 5 [Ctrl+5]" accesskey="5" prefix="##### " href="">Heading 5</a></li>\
                                <li class="us-toolbox-button us-toolbox-h6"><a title="Heading 6 [Ctrl+6]" accesskey="6" prefix="###### " href="">Heading 6</a>\
                                </li><li class="us-toolbox-separator">&nbsp</li>\
                                <li class="us-toolbox-button us-toolbox-bold"><a title="Bold [Ctrl+B]" accesskey="B" prefix="**" postfix="**">Bold</a></li>\
                                <li class="us-toolbox-button us-toolbox-italic"><a title="Italic [Ctrl+I]" accesskey="I" prefix="_" postfix="_">Italic</a></li>\
                                <li class="us-toolbox-separator">&nbsp</li>\
                                <li class="us-toolbox-button us-toolbox-bullet "><a title="Bulleted List" prefix="- ">Bulleted List</a></li>\
                                <li class="us-toolbox-button us-toolbox-numlist"><a title="Numeric List" prefix="1. ">Numeric List</a></li>\
                                <li class="us-toolbox-separator">&nbsp</li>\
                                <li class="us-toolbox-button us-toolbox-pic"><a title="Picture [Ctrl+P]" accesskey="P" prefix="">Picture</a></li>\
                                <li class="us-toolbox-button us-toolbox-link"><a title="Link [Ctrl+L]" accesskey="L" prefix="">Link</a></li>\
                                <li class="us-toolbox-separator">&nbsp</li>\
                                <li class="us-toolbox-button us-toolbox-quotes"><a title="Quotes" prefix="> ">Quotes</a></li>\
                                <li class="us-toolbox-button us-toolbox-code"><a title="Code Block / Code" prefix="<code>" postfix="</code>">Code Block / Code</a></li>\
                                <li class="us-toolbox-separator">&nbsp</li>\
                                <li class="us-toolbox-button us-toolbox-diagram"><a title="Insert diagram reference" prefix="diagram">Diagram reference / Diagram</a></li>\
                                <li class="us-toolbox-separator">&nbsp</li>\
                                </ul></span><textarea rows="20" cols="80" id="markdown" class="us-markdown-editor"></textarea>';

                    $(rrrr).appendTo(selector);

                    self._helperUpdateFrameWork(true); // Make text area to fit size of content

                    $(selector + " span.us-toolbox-header ul li.us-toolbox-button a")
                        .click(params, function (e) {
                            var params = e.data;
                            var sel = $(selector + " #markdown").getSelection();
                            //$(selector + " #markdown").getSelection();
                            //alert("CLICKED !!! " + sel.text);
                            var prefix = $(this).attr("prefix") || "",
                                postfix = $(this).attr("postfix") || "";

                            if (prefix == "diagram") {
                                prefix = "";
                                if (self.cachedLink && self.cachedLink.title.split(".").pop() == "umlsync") {
                                    var params2 = self.cachedLink;
                                    var path;
                                    // Use relative paths inside repository
                                    if (params2.repoId == params.repoId
                                        && params2.viewid == params.viewid
                                        && params2.branch == params.branch) {
                                        var p1 = params.absPath.split("/"),
                                            p2 = params2.absPath.split("/"),
                                            p3 = "",
                                            idx = 0,
                                            idx2 = 0;
                                        while (p2[idx] == p1[idx]) {
                                            ++idx;
                                        }
                                        idx2 = idx;
                                        for (; idx < p1.length - 1; ++idx) {
                                            p3 = "../" + p3;
                                        }
                                        if (p3 == "") {
                                            p3 = "."
                                        } else {
                                            p3 = p3.substring(0, p3.length - 1);
                                        }
                                        for (; idx2 < p2.length; ++idx2) {
                                            p3 = p3 + "/" + p2[idx2];
                                        }
                                        path = "?path=" + p3;
                                    }
                                    // and absolute path for external references
                                    else {
                                        path = "/" + params2.repoId + "/" + params2.branch + "/" + params2.absPath;
                                    }
                                    prefix = '![Diagram: ] (http://umlsync.org/github' + path + ' "';
                                    postfix = '")';
                                }
                                else {
                                    prefix = '![Diagram: ] (http://umlsync.org/github/%repo%/%branch%/%path% "';
                                    postfix = '")';
                                }
                            }

                            $(selector + " #markdown").wrapSelection(prefix, postfix);

                            e.preventDefault();
                            e.stopPropagation();
                        });

                    var viewid = params.viewid;

                    var data = self.markdown[selector];

                    $(selector + " #markdown")
                        .text(data)
                        .bind("keyup paste", selector, function (e) {
                            var selector = e.data;

                            var text2 = self.markdown[selector];
                            var text1 = $(this).val();
                            if ($(this).val() != self.markdown[selector]) {
                                self.onContentModifiedStateChanged(selector, true);
                            }
                            else {
                                self.onContentModifiedStateChanged(selector, false);
                            }
                        });

                    // Update the framework sizes
                    self._helperUpdateFrameWork(true);
                }
            },
            saveMarkdownContent: function (params) {
                if (!params.isModified) {
                    return;
                }


                this.saveContent();
            },
            //
            // Get the content type by extension
            // Return undefined if content not supported
            //
            getContentType: function (title) {
                //var tt = title.split(".");
                //var ext = (tt.length > 1) ? tt[tt.length-1].toUpperCase() : "";
                var ext = title.toUpperCase(),
                    snip = ".US.SNIPPET";
                if (ext.indexOf(snip) == ext.length - snip.length) {
                    return "snippet";
                }

                for (var t in this.formatHandlers) {
                    // Check if view functionality supported
                    if (this.formatHandlers[t].options.view) {
                        var hr = this.formatHandlers[t].getExtensionList();
                        for (var r in hr) {
                            if (ext.indexOf(hr[r]) == ext.length - hr[r].length) {
                                return this.formatHandlers[t].getUid();
                            }
                        }
                    }
                }
                return null;
            },

            //
            // open snippet content and show bubble
            //
            openSnippet: function(snippetParams, snippet){
                snippet.params = $.extend({}, snippetParams, snippet.params ?  snippet.params : snippet.content);

                // Show a snippets bubble on load complete
                this.snippetsQueue.push(snippet);

                // open the content item
                this.loadContent(snippet.params, snippetParams);
            },

            //
            // Show snippet on load complete
            //
            onLoadComplete: function(selector, flag) {
                if (this.snippetsQueue && this.snippetsQueue.length > 0) {
                    var params = this.contents[selector];
                    var snippet = this.snippetsQueue.pop();

                    if (snippet.params.absPath == params.absPath) {
                        // Show bubble
                        this.snippetsHandler.showSnippetBubble(snippet.position, selector, snippet.msg);
                        // Splice handler
                        this.snippetsQueue.splice(0,this.snippetsQueue.length);
                    }
                }
            },

            //
            // Load content by internal reference
            // Uses to navigate through the diagrams and markdown
            // @param ahref - jquery.ui.tabs reference on content
            // @param path - path to load
            //
            // TODO: How to load handle reference on diagram inside markdown ?
            //
            loadContent2: function (ahref, path) {
                var title = path.split("/").pop();
                var contentType = this.getContentType(title);
                // Nothing to load
                if (contentType == undefined) {
                    return;
                }

                var params = this.contents[ahref] || this.embeddedContents[ahref],
                    clone = {
                        relativePath: path,
                        viewid: params.viewid,
                        repoId: params.repoId,
                        branch: params.branch,
                        contentType: contentType,
                        title: title
                    };
                this.loadContent(clone, params);
            },
            //
            // Universal method to load diagram, code or markdown
            // Unique content id: {ViewId, repository, branch, path from root}.
            // It is not possible to restore path by blob therefore we can't use blobs for wiki-like solutions
            //
            loadContent: function (params, parentParams) {
                var viewid = params.viewid,
                    self = this;

                // Check if view is really exists: fox example if some diagram contain
                //                         reference on sourceforge or googlecode
                if (!self.views || !self.views[viewid] || !self.views[viewid].view) {
                    alert("View: " + viewid + " was not initialize.");
                    return;
                }

                if ((params.absPath == undefined || params.absPath == null) && params.relativePath == undefined && params.sha == undefined) {
                    alert("Not enough information about loadble content.");
                    return;
                }

                // Handle the relative path use-case:
                if (parentParams != undefined && (params.absPath == undefined || params.absPath == null) && params.relativePath != undefined) {
                    params.absPath = self.views[viewid].view.getContentPath(params, parentParams);
                }

                var uniqueContentId = params.viewid + "/" + params.repoId + "/" + params.branch + "/" + params.absPath;
                params.cuid = uniqueContentId;



                // Check if content is snippet
                if (params.contentType != 'snippet') {

                    // work-around for the first content load
                    // to prevent diagram menu open over markdown
                    this.openDiagramMenuOnFirstInit = params.editable;

                    // Check if content was loaded before
                    // and select corresponding tab
                    // But if diagram should be embedded into markdown
                    // then skip this step
                    if (self.contents && params.selector == undefined) {
                        for (var r in self.contents) {
                            var d = self.contents[r];
                            if ((d.viewid == params.viewid)  // Github
                                && (d.repoId == params.repoId)   // userid/repo
                                && (d.branch == params.branch) // tree/master
                                && (d.absPath == params.absPath) // path from root
                                ) {
                                $("#tabs").tabs('select', r);
                                self.onLoadComplete(r, true);
                                return;
                            }
                        }
                    }

                    // Create tab or use an existing selector
                    var tabname = params.selector || self.options.tabRight + "-" + self.counter;
                    self.counter++;

                    // create new tab
                    if (params.selector == undefined) {
                        tabname = "#" + tabname;
                        $("#" + self.options.tabs).tabs("add", tabname, params.title);
                        $("#" + self.options.tabs).append('<div id="' + tabname + '"></div>');

                        // Hide diagram menu
                        if (params.editable == true || params.editable == "true") {
                            $(".diagram-menu").show();
                        } else {
                            $(".diagram-menu").hide();
                        }
                    }

                    // Add gif which shows that content is loading
                    $('<img id="puh" src="images/Puh.gif"/>').appendTo(tabname);
                }

                if (self.views[viewid]) {
                    self.views[viewid].view.loadContent(params, {
                        'success': function (msg, data) {
                            if (params.contentType == 'snippet') {
                              self.addNewSnippets(params, data);
                              return;
                            }

                            if (params.selector == undefined) {
                                params.hasModification = true;
                                self.contents[tabname] = params;
                            }
                            else {
                                self.embeddedContents[params.selector] = params;
                            }

                            // Simple toolbox for each diagram
                            self.appendContentToolbox(tabname, params);

                            // Remove puh after JSON load completion
                            $(tabname + " #puh").remove();

                            var ct = params.contentType;
                            if (params.contentType && self.formatHandlers[params.contentType]) {
                                self.formatHandlers[params.contentType].open(tabname, params, data);
                                // Update the framework sizes
                                self._helperUpdateFrameWork(true);
                                return;
                            }
                            else {
                                alert("Cant find the corresponding handler for the " + params.contentType);
                            }

                            // Update the framework sizes
                            self._helperUpdateFrameWork(true);
                        },
                        'error': function (msg) {
                            if (params.contentType == 'snippet') {
                                alert('Failed to load snippet');
                                return;
                            }
                            self.loadError("content", msg, tabname, params);
                        }
                    });
                }
            },
            //
            // Load diagram from data:
            //
            // tabname: tab selector
            //
            // params: {
            //   viewid - IView.euid
            //   title - the name of file
            //   repo - file's repository
            //   branch - file's branch
            //   absPath - repo + branch + absolute path
            //   node - dynatree node
            //   selector - jQuery selector to insert diagram
            // }
            //
            // data: diagram data
            //
            loadDiagram: function (tabname, params, data) {
                var jsonData = (typeof data === "string") ? $.parseJSON(data) : data,
                    viewid = params.viewid,
                    self = this;

                jsonData.multicanvas = (params.selector != undefined);

                // enable diagram menu
                if (params.selector == undefined) {
                    $(tabname).attr("edm", params.editable)
                }
                else {
                    self.embeddedContents[tabname] = params;
                }

                jsonData['fullname'] = params.absPath;
                jsonData['editable'] = true;

                dm.dm.loader.Diagram(
                    jsonData.type,
                        jsonData.base_type || "base",
                    jsonData,
                    tabname,
                    function (obj) {
                        self.diagrams[tabname] = obj; // Keep diagram name

                        obj.onDestroy(function () {
                            self.views[params.viewid].view.releaseContent(params);
                            delete self.diagrams[tabname];
                        });

                        if (obj.options.multicanvas) {
                            self['ActivateDiagramMenu'](obj.options['type']);
                            obj.draw();
                        }
                        obj.options['viewid'] = viewid;
                        dm.dm.loader.OnLoadComplete(
                            function () {
                                obj._setWidgetsOption("editable", params.editable);
                            }
                        );
                    });
            },
            //
            // Load markdown
            //
            loadMarkdown: function (tabname, params, data) {
                var innerHtml = '<div class="us-diagram announce instapaper_body md" data-path="/" id="readme"><span class="name">\
                            <span class="mini-icon mini-icon-readme"></span> ' + params.absPath + '</span>\
                            <article class="markdown-body entry-content" itemprop="mainContentOfPage">\
                            ' + converter.makeHtml(data) + '\
                            </article></div>';

                this.markdown[tabname] = data;

                $(tabname).append(innerHtml); // Markdown loaded
                $(tabname).attr("edm", false);//enable diagram menu is always false for markdown

                var self = this;
                $(tabname + " article.markdown-body .umlsync-embedded-diagram").each(function () {
                    var newId = self.options.embedded + "-" + self.counter;
                    self.counter++;

                    var relativePath = $(this).attr("path"),
                        sum = $(this).attr("sha"),
                        loadParams;

                    // Initialize load parameter from content or inherit them from parent document
                    loadParams = {
                        sha: sum,
                        relativePath: relativePath,
                        repoId: $(this).attr("repo") || params.repoId,
                        branch: $(this).attr("branch") || params.branch,
                        viewid: $(this).attr("source") || params.viewid,
                        title: (relativePath == undefined) ? sum : relativePath.split("/").pop(), // title is the last word separated by slash

                        // extra options for content handler
                        contentType: "dm", // means diagram
                        editable: false,
                        selector: tabname + " #" + newId
                    };

                    // TODO: What is this string for ?
                    $(this).css('padding', '20px').width("1200px").height("600px").css("overflow", "none").css("text-align", "center");
                    // replace the default id by unique ID
                    $(this).attr("id", newId);

                    // all these contents should be embedded
                    // diagrams
                    dm.dm.fw.loadContent(loadParams, params);
                }); // jQuery.each
            },
            //
            // Load source code and run google prettify on it
            //
            loadCode: function (tabname, params, data) {
                $(tabname).append("<div class='us-sourcecode'><pre class='prettyprint linenums:1'>" + data + "</pre></div>");
                $(tabname).attr("edm", false);//enable diagram menu is always false for code

                prettyPrint();

                this._helperUpdateFrameWork(true);
            },
            //
            // Load the error message and picture
            //
            loadError: function (type, err, tabname, params) {
                // parse the error code and text
                var errcode = "";
                var errtext = "";
                // Error happens for the not loged in users
                if (err && err.error == 403) {
                    window.location.href = "/login";
                    return;
                }

                if (type == "content") {
                    $(tabname).append("<div class='us-sourcecode'><img src='/images/loadfailed.jpg' style='align:center;'/>" + errcode + "<br>" + errtext + "</div>");
                    $(tabname).attr("edm", false);//enable diagram menu is always false for error window
                    this._helperUpdateFrameWork(true);
                }
                else if (type == "repos") {
                    // reload page in case of internal server error
                    if (err && err.error == 500) {
                        window.location.href = "/editor/";
                        return;
                    }
                }
                else {
                    alert("unknown issue !" + "\n" + errcode + " : " + errtext);
                }

            },
            //
            // Return an active diagram
            // Diagrams could be embedded into markdown
            // therefore we have two arrays: contents & diagrams
            //
            getActiveDiagram: function () {
                if (this.contents && this.selectedContentId) {
                    var params = this.contents[this.selectedContentId];
                    if (params && params.contentType) {
                        if (this.formatHandlers[params.contentType]._getContentObject) {
                            return  this.formatHandlers[params.contentType]._getContentObject(this.selectedContentId);
                        }
                        else {
                            alert('Timesheet happens !!!');
                        }
                    }
                }
                return null;
            },
            //
            // Close or save modified files for an active repository
            // @param oldRepoId - previous repo unique id
            // @return bool - true handled all items, false - operation skiped
            //
            // Steps:
            //   1. go through the opened contents
            //   1.1. Activate content tab
            //   1.2. Open Save/Skip/Cancel dialog
            //   1.3 if not "Cancel" then continue
            //
            handleModifiedContentOnRepoChange: function (oldRepoId, callback) {
                // There is no opened contents
                if (!this.contents || Object.keys(this.contents).length == 0) {
                    callback(true);
                    return;
                }

                var self = this;

                function keepContent(ahref, saveIt) {
                    if (self.contents && self.contents[ahref]) {
                        if (saveIt) {
                            self.saveContent(ahref, true);
                        }
                        else {
                            $(".diagram-menu").hide();
                            delete self.contents[ahref];
                            $("#tabs").tabs('remove', ahref);
                            $(ahref).remove();
                        }
                    }

                }

                var contents = this.contents;

                function visitModified(list) {
                    var item = list.shift();

                    while (item && (contents[item].repoId != oldRepoId || !contents[item].isModified)) {
                        item = list.shift();
                    }
                    if (item) {
                        $("#tabs").tabs('select', item);
                        dm.dm.dialogs['ConfirmationDialog'](
                            {
                                title: "Save",
                                description: 'Save file "' + contents[item].title + '" ?',
                                buttons: {
                                    "Yes": function () {
                                        $(this).dialog("close");
                                        keepContent(item, true);
                                        visitModified(list);
                                    },
                                    "No": function () {
                                        $(this).dialog("close");
                                        keepContent(item, false);
                                        visitModified(list);
                                    },
                                    "Cancel": function () {
                                        $(this).dialog("close");
                                        callback(false);
                                    }
                                }
                            });
                    }
                    else {
                        callback(true);
                    }
                }

                var contentList = new Array();
                for (var r in this.contents) {
                    contentList.push(r);
                }
                visitModified(contentList);
            },
            //
            // Callback method to report modification of diagram state
            // @param selector - the diagram selector
            // @param state - "true" content was modified
            //            "false" content was not modified
            //
            onContentModifiedStateChanged: function (selector, state) {
                if (this.contents[selector].isModified != state) {
                    var $item = $('a[href$="' + selector + '"]').children("span");
                    var text = $item.text();
                    if (text[0] != "*" && state) {
                        text = "* " + text;
                    }
                    else if (text[0] == "*" && !state) {
                        text = text.substring(2);
                    }
                    $item.text(text);
                    this.contents[selector].isModified = state;
                }
            },
            //////////////////////////////////////////////////////////////
            //      Framework: keys, toolbox, re-size
            //////////////////////////////////////////////////////////////
            //
            // update framework sizes
            //
            _helperUpdateFrameWork: function (resizeAll, ui) {
                if (resizeAll) {
                    // setup height for content and left - resize -right conent DIV's
                    // header border 1px => total 2px (border top, border-bottom)
                    // content border 1px => total 2px (border top, border-bottom)
                    // and -1 to get real height
                    var hhh = $(window).height() - $(this.options.top).outerHeight(true) - 5 - $("#" + this.options.content + "-bottom").outerHeight(true);

                    var $ch1 = $("#" + this.options.content).height(hhh)  // set height of middle:  #content
                        .children("DIV").height(hhh)          // #content-left; #content-right; #content-left-right-resize;  No border for this items available
                        .children(".ui-scrollable-tabs").height(hhh - 2)    // 1px solid border defined for .ui-scrollable-tabs
                        .children(".ui-tabs").height(hhh - 8);        // 3px border defined for .ui-tabs BUT if we will shift it than it is possible to observe cool effect

                    // content left maximize treetabs area
                    var repoH = $("#switcher #us-repo-select").height(),
                        toolboxH = $("#switcher #us-toolbox").height(),
                        vmH = $("#switcher #us-viewmanager").height();
                    $("#switcher #us-treetabs").height(hhh - repoH - toolboxH - vmH - 2);

                    var $ch, $md;
                    if ($ch1.children(".ui-tabs-panel").filter(':visible').length) {
                        // Check that is it no full screen mode for printing
                        // Or if it is first-start page !!!
                        if (this.options.notabs == undefined || !this.options.notabs)
                            hhh = hhh - $ch1.children("ul").height() - 8; //  8 from above and 1 is top padding of ul (which is tabs navigator)

                        // Could be only because of wrong in-visible elements !!!
                        $ch = $ch1.children(".ui-tabs-panel").filter(':visible').height(hhh)
                            .children("div").height(hhh - 24); // Border 1px + padding 11
                        hhh -= 24;

                        // Update the markdown text area
                        $md = $(".us-markdown-editor");
                        if ($md.length != 0) {
                            $md.height(hhh - $("span.us-toolbox-header ul li a").height() - 35);
                        }
                    }

                    // recalculate the content
                    var wd = $("#" + this.options.content).width() - $("#" + this.options.content + "-left").width() - 6;
                    $("#" + this.options.content + "-right").width(wd);

                    // Update the markdown text area
                    if ($md && $md.length != 0) {
                        $md.width(wd - 37 * 2);
                    }

                    var canvas = window.document.getElementById('SingleCanvas');
                    if (canvas) {
                        if ($ch) {
                            var s = $ch.offset();
                            if (s) {
                                $(canvas).offset(s);
                            }
                        }
                        canvas.height = hhh - 11; // 11-is scroll element size
                        if ($(".us-diagram").length) {
                            canvas.width = ($(".us-diagram").width() - 12);
                        } else {
                            canvas.width = wd - 40 - 12;
                        }
                    }
                }

                // change width on drag the resize div
                else if (ui != undefined) {
                    $("#content-left-right-resize").css("left", ui.pageX);
                    $("#content-left").css("width", ui.pageX);

                    var wd = $("#content").width() - $("#content-left").width() - 6;
                    $("#content-right").css("left", ui.pageX + 7).width(wd);

                    var canvas = window.document.getElementById('SingleCanvas');
                    if (canvas) {
                        canvas.width = $("#content").width() - $("#content-left").width() - 40;
                        if ($(".us-diagram").length) {
                            canvas.width = ($(".us-diagram").width() - 12);
                        } else {
                            canvas.width = wd - 40 - 12;
                        }
                    }

                    // Update the markdown text area
                    var $md = $(".us-markdown-editor");
                    if ($md.length != 0) {
                        $md.width(wd - 37 * 2);
                    }

                }
                var tabsHeight = $(window).height() - $(this.options.top).outerHeight(true) - 8 - $(this.options.bottom).outerHeight(true);

                $("#tabs").width($("#content").width() - $("#content-left").width() - 13);//.height(tabsHeight);
                $("#tabs .ui-tabs-panel") //.height(tabsHeight-45)
                    .children("DIV")
                    .width($("#content").width() - $("#content-left").width() - 32);
                //.height($(window).height() - $("#content").position().top - 55 -  $(this.options.bottom).height());
                //$("#us-treetabs .ui-tabs-panel").height(tabsHeight-45);

            },
            //
            // Initialize key handler
            //
            _helperInitializeKeyHandler: function (Loader) {
                //@ifdef EDITOR
                var fw = this;
                $(window).keydown(function (e) {
                        var params = null;
                        if (!fw.selectedContentId) {
                            return;
                        }

                        params = fw.contents[fw.selectedContentId];
                        var handler = null;
                        if (params && params.contentType) {
                            handler = fw.formatHandlers[params.contentType];
                        }

                        var sendToHandler = false;

                        if (e.ctrlKey && e.keyCode == 17) {
                            fw.CtrlDown = true;
                        } else if (e.keyCode == 46) { // Del
                            //
                            // Prevent element remove on edit fields
                            // TODO: check for dialog open
                            //
                            if ($(".editablefield input").length == 0) {
                                sendToHandler = true;
                            }
                        }
                        if (e.keyCode == 27) { // Esc
                            var e1 = jQuery.Event("blur");
                            e1.apply = false;      // Do not apply changes
                            $(".editablefield input").trigger(e1);
                        } else if (e.keyCode == 13) { // Enter
                            $(".editablefield input").trigger('blur');
                        }

                        if (e.ctrlKey) {
                            switch (e.keyCode) {
                                case 65:// Handle Ctrl-A
                                    sendToHandler = true;
                                    break;
                                case 67: // Handle Ctrl-C
                                    sendToHandler = true;
                                    break;
                                case 88:
                                    sendToHandler = true;
                                    break;
                                case 86:// Handle Ctrl-V
                                    sendToHandler = true;
                                    break;
                                case 90:// Handle Ctrl-Z
                                    sendToHandler = true;
                                    break;
                                case 89:// Handle Ctrl-Y
                                    sendToHandler = true;
                                    break;
                                case 83:// Handle Ctrl-S
                                    //
                                    // STOP event propagation first, and then handle it
                                    //
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.stopImmediatePropagation();

                                    if (fw.selectedContentId)
                                        fw.saveContent(fw.selectedContentId);
                                    //
                                    // Send to handler to mark the current position as default
                                    //
                                    sendToHandler = true;
                                    break;
                                default:
                                    break;
                            }
                        }
                        //
                        // Check if editor could handle event itself
                        //
                        if (handler && sendToHandler) {
                            handler.onKeyPressed(fw.selectedContentId, e);
                        }
                    }
                )
                    .keyup(function (e) {
                        if (e.keyCode == 17) {
                            fw.CtrlDown = false;
                        }
                    }
                );
            },
            //
            // Initialize toolbox for context menu
            //
            _helperInitializeToolBox: function (Loader) {
                var fw = this;
                // Place for logo !!!
                //$("body").append('<img src="/images/logo.png" style="position:fixed;top:0;left:0;"/>');
                $("body").append('<div id="context-toolbox" class="us-context-toolbox">\
                            <select name="speedAa" id="speedAa" style="border: 1px solid #B3C7E1;width:60px;"></select>\
                            <select name="borderWidth" id="borderWidth" style="border: 1px solid #B3C7E1;"></select>\
                            <button class="ui-button"><span class="ui-icon ui-icon-font-big"/></button>\
                            <button class="ui-button"><span class="ui-icon ui-icon-font-italic"/></button>\
                            <button id="vatop" title="Bring Front" class="ui-button"><span class="ui-icon ui-icon-valign-top"/></button>\
                            <button id="vacenter" class="ui-button"><span class="ui-icon ui-icon-valign-center"/></button>\
                            <button id="vabottom" title="Bring Back" class="ui-button"><span class="ui-icon ui-icon-valign-bottom"/></button>\
                            <button class="ui-button"><span class="ui-icon ui-icon-font-underline"/></button>\
                            <button class="ui-button"><span class="ui-icon ui-icon-font-underline"/></button>\
                            <button id="color5" title="Color Picker"><span class="color5"/></button>\
                    <button id="color6" title="Color Picker Fonts"><span class="color5"/></button></div>');

                $("#context-toolbox").click(function () {
                    $(".context-menu").hide();
                });
                var allFonts = ["arial", "san serif", "serif", "wide", "narrow", "comic sans ms", "Courier New", "Geramond", "Georgia", "Tahoma", "Trebuchet MS", "Verdana"];
                for (var loop = 0; loop < allFonts.length; loop++) {
                    var rrr = "<option value=\"" + allFonts[loop] + "\">" + allFonts[loop] + "</font></option>";
                    $(rrr).css("font-family", allFonts[loop]).appendTo('select#speedAa');
                }

                for (var i = 1; i < 11; ++i) {
                    $("#borderWidth").append("<option value='" + i + "'>" + i + "px</option>");
                }

                $('button#color5').simpleColorPicker({ 'onChangeColor': function (color) {
                    if (fw.selectedContentId) {
                        var params = fw.contents[fw.selectedContentId];
                        var handler = null;
                        if (params && params.contentType) {
                            handler = fw.formatHandlers[params.contentType];
                            handler._setWidgetsOption(fw.selectedContentId, "color", color);
                        }
                    }
                } }).click(function () {
                    $(".context-menu").hide();
                });

                $('button#color6').simpleColorPicker({ 'onChangeColor': function (color) {
                    if (fw.selectedContentId) {
                        var params = fw.contents[fw.selectedContentId];
                        var handler = null;
                        if (params && params.contentType) {
                            handler = fw.formatHandlers[params.contentType];
                            handler._setWidgetsOption(fw.selectedContentId, "font-color", color);
                        }
                    }
                } }).click(function () {
                    $(".context-menu").hide();
                });

                $('button#vatop').click(function () {
                    if (fw.selectedContentId) {
                        var params = fw.contents[fw.selectedContentId];
                        var handler = null;
                        if (params && params.contentType) {
                            handler = fw.formatHandlers[params.contentType];
                            handler._setWidgetsOption(fw.selectedContentId, "z-index", "front");
                        }
                    }
                });
                $('button#vabottom').click(function () {
                    if (fw.selectedContentId) {
                        var params = fw.contents[fw.selectedContentId];
                        var handler = null;
                        if (params && params.contentType) {
                            handler = fw.formatHandlers[params.contentType];
                            handler._setWidgetsOption(fw.selectedContentId, "z-index", "back");
                        }
                    }
                });

                $("#borderWidth").change(function () {
                    if (fw.diagrams[fw.selectedContentId]) {
                        $.log("diagram ok");
                        fw.diagrams[fw.selectedContentId]._setWidgetsOption("borderwidth", $(this).val() + "px");
                    }
                });

                $("select#speedAa").change(function () {
                    $.log("diagram ok");
                    if (fw.diagrams[fw.selectedContentId]) {
                        fw.diagrams[fw.selectedContentId]._setWidgetsOption("font-family", $(this).val());
                    }
                });


            },
            //
            // Clean up SingleCanvas
            //
            _helperCleanUpCanvas: function () {
                this.canvas = window.document.getElementById('SingleCanvas');
                if (!this.canvas)
                    return;
                var ctx = this.canvas.getContext("2d");
                ctx.fillStyle = "#EEEEEE";
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        };
        return getInstance(options);
    };
})(jQuery, dm);

/*
 * Class: LocalhostView
 * 
 * Copyright:
 *   Copyright (c) 2012 UMLSync Inc. All rights reserved.
 * 
 * URL:
 *  umlsync.org/about
 * 
 * Version:
 *   2.0.0 (2013-02-28)
 */
(function($, dm, undefined) {

    //////////////////////////////////////////////////////////////
    //           IViewManager
    //////////////////////////////////////////////////////////////
    //
    // Localhost view manager is an abstraction which allow
    // to extract information about available plugin-views
    // and switch between them
    // For example: Eclipse has Project Navigator/Package view/C++ View etc
    //
    dm.base.LocalhostViewsManager = function() {
        this.activeView = null;
        this.id = "us-eclipse";
        this.title = "Eclipse";
        this.activated = false;
        var secretKey = null,
          hostUrl = "http://localhost:8000/";

        //
        // IViewManager::getId for the div#reponav element insertion
        // ------
        //
        this.getId = function() {return this.id;};
        
        //
        // IViewManager::getTitle for the div#reponav element insertion
        // ------
        //
        this.getTitle = function() {return this.title;};

        //
        // IViewManager::getIcon for the div#reponav element insertion
        // ------
        //
        this.getIcon = function() {return "%path to icon%";};

        //
        // Create a secret key initialize dialog
        // ----
        //
        this.init = function() {
            if (dm.dm.dialogs) {
                dm.dm.dialogs['ConfigureLocalhost']("Offline plug-in connection...", this);
            }
            dm.dm.fw.registerViewManager(this);
        };

        //
        // ILocalhostConfigListener::OnConfigSetup(host, secret_key)
        // @param - host+port like http://localhost:8000
        // @param - secret key for 
        // ----
        //
        this.OnConfigSetup = function(host, secret) {
          hostUrl = host; // host URI
          secretKey = secret; // magic seqeunce to identify the client
          var self = this;

          // Drop the existing tree
          $("#us-treetabs").children().remove();
          $('<img id="puh" src="images/Puh.gif"/>').appendTo("#us-treetabs");

          $.ajax({
            'url': host + "/vm/getviews",
            'dataType': 'jsonp',
            'success':  function(json) {
              $("#us-treetabs #puh").remove();
              self._activateViewSelectWidget(json);
			  self._activateToolboxWidget("#us-toolbox", true);
            },
            'error': function(err) {
              self.activated = false;
              $("#us-treetabs #puh").remove();
              self._handleError(err);
			  self._activateToolboxWidget("#us-toolbox", false);
            }
          });
        };

        //
        // IViewManager::onViewManagerChange for the div#reponav element insertion
        // @return - true  - on success change completion
        //           false - on cancel change procedure
        // ------
        //
        this.onViewManagerChange = function(id, callback) {
            // is similar to close all content and commit for the
            // opened repository
            if (this.id != id) {
                // Drop all content because there is no commit for localhost
                $("#us-treetabs").children().remove();
                $("#us-toolbox").children().remove();
                $("#us-repo-select").children().remove();
                if (callback) {
                  callback(true);
                }
                return;
            }

            if (dm.dm.dialogs) {
              dm.dm.dialogs.Activate("configure-localhost-dialog");
            }

            // Do nothing if already active
            if (this.activated) {
                return;
            }

            // A lot of initialization stuff is here !
            this.activated = true;
        };

        //
        // Helper method to create view select widget
        // Note: not active while we have single view mode
        // ----
        //
        this._activateViewSelectWidget = function(json) {
          // do not add view select dialog if it is single view mode
          if (Object.keys(json).length < 10) {
		    for (var t in json) {
			  if (json[t].isdefault) {
			    this.activeView = new dm.base.LocalhostView("http://localhost:8000/vm/" + json[t].id);
			    dm.dm.fw.addView2(this.id, this.activeView);
				return;
			  }
			}
			this.activeView = new dm.base.LocalhostView("http://localhost:8000/vm/un");
			dm.dm.fw.addView2(this.id, this.activeView);
            return
          }
          var self = this,
            innerHtml = "",
            selectHtml = "";
          for (i in json) {
            innerHtml += "<li><a href='#'>" + json[i]['title']+ "</a></li>";
            selectHtml += "<option>" + json[i]['title'] + "</option>";
            $('#us-repo-select').append($("<option></option>")
                                .attr("value",json[i]['id'])
                                .text(json[i]['title']));
          }

          if ($('#header-menu #Views ul').length == 0) {
            $('#header-menu').append("<li id='Views'><a href='#'>Views</a><ul>" + innerHtml+"</ul></li>").jqsimplemenu();
          }
          else {
            $('#header-menu #Views ul').append(innerHtml);
            $('#header-menu').jqsimplemenu();
          }

          // Complete menu update first.
          // And open the default views than.
          for (i in json) {
            if (json[i]['isdefault']) {
              var IView = new dm.base.LocalhostView(self.options.viewmanager + json[i]['id']);
              IView.euid = json[i]['id'];
              self.addView2(json[i]['title'], IView);
            }
          }
        };

        //
        // IViewManager::onViewManagerChange - activate the toolbox area helper
        // ------
        //
        this._activateToolboxWidget = function(selector, flag) {
            var item = $(selector + " #us-localhost-list");
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
            $(selector).append('<ul id="us-localhost-list" style="list-style:none;">\
                    <li id="us-localhost-reload" class="us-left" title="Reload tree"><img src="http://umlsync.org/static/images/reload.png" class="ui-icon"></li>\
                    <li id="us-localhost-newdoc" title="New diagram"><img src="http://umlsync.org/static/images/newdoc.png" class="ui-icon"></li>\
                    <li id="us-localhost-revertdoc" title="Revert diagram"><img src="http://umlsync.org/static/images/revertdoc.png" class="ui-icon"></li>\
                    <li id="us-localhost-removedoc" title="Remove diagram"><img src="http://umlsync.org/static/images/deldoc.png" class="ui-icon"></li>\
            </ul>');
            // Initialize handlers
            $("#us-localhost-newdoc").click(function() {
                $(document).trigger("us-dialog-newdiagram", {view:self.activeView, path:"/"});
            });

            $("#us-localhost-reload").click(function() {
                if (self.activeView != null) {
                    self.activeView.reloadTree();
                }
            });

        };
        //
        // Helper method to decode a "base64" content
        // @param data - data to decode
        // @return - the decoded content
        //
        function decodeMDContent(data, textStatus, jqXHR, callback) {
            for (d in data) {
                if (d == 'data') {
                    var splitted = data[d].split('\n');
                    var decoded = "";
                    for (s in splitted) {
                        decoded += $.base64.decode(splitted[s]);
                    }
                    if (callback) {
                        callback(decoded);
                    }
                    return;
                }
            }
        };

        dm.base.LocalhostView = function(urlArg) {

            var self = {
                    euid:"lh",
                    initBranches: function() {},
                    //
                    // Initialize view
                    //
                    init: function() {
                        // Check localhost availability and select port
                    },
                    //
                    // Extract application capabilities
                    //
                    info: function(callback) {
                        $.ajax({
                            url: urlArg + "/getcapabilities",
                            dataType: "jsonp",
                            success: function (data) {
                                if (callback)
                                    callback(data);
                            }
                        });
                    },
                    //
                    // Active branch of repository
                    //
                    activeBranch: "master",
                    //
                    // Active repository "user/repository"
                    //
                    activeRepo: "Eclipse",
                    //
                    // Return the active repository
                    //
                    getActiveRepository: function() { return self.activeRepo;},
                    //
                    // Return the active repository
                    //
                    getActiveBranch: function() { return self.activeBranch;},
                    //
                    // Remove content
                    //
                    remove: function(path, callback) {
                        //TODO: check path
                        $.ajax({
                            dataType: 'jsonp',
                            url: urlArg + '/remove?path=' + path,
                            success: function() {
                                if (callback)
                                    callback.call();
                            }
                        });
                    },
                    activePath: "/",
                    //
                    // Get active tree path
                    //
                    getActivePath: function() {
                        return self.activePath || "/";
                    },
                    //
                    // Get content path
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
                    // return the list of subfolders for a given path
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
                    //
                    // Load content from eclipse plugin
                    //
                    loadContent: function(params, callback) {
                        var fullPath = params.absPath;

                        if (params.parentPath != undefined) {
                            // absolute path from root
                            if (params.absPath[0] == "/") {
                                var g = (params.parentPath[0] == "/") ? params.parentPath.substring(1):params.parentPath,
                                        li = g.indexOf("/"),
                                        g = (li == -1) ? "": g.substring(0, li);
                                fullPath = "/" + g + params.absPath;
                            }
                            else {
                                var g = (params.parentPath[0] == "/") ? params.parentPath: "/" + params.parentPath,
                                        abbb = (params.absPath[0] == ".") ? params.absPath.substring(1): params.absPath;
                                fullPath = g + abbb;
                            }
                        }

                        if (params.contentType == "umlsync" || params.contentType == "markdown" || params.contentType == "codeview") {
                            $.ajax({
                                url: urlArg + '/open?path='+ fullPath,
                                dataType: 'jsonp',
                                success: function(x,y,z) {
                                    if (x.data != undefined) {
                                        decodeMDContent(x,y,z,function(data) { callback.success(null, data)});
                                    }
                                    else {
                                        callback.success(y, x);
                                    }
                                },
                                error:function(x,y,z) {
                                    callback.error(x);
                                }
                            });
                        }
                        else {  // Open file in Eclipse
                            $.ajax({
                                url: urlArg + '/file?path='+ fullPath,
                                dataType: 'jsonp',
                                success: function(x,y,z) {
                                },
                                error:function(x,y,z) {
                                }
                            });
                        }
                    },
                    //
                    // Save content to eclipse plugin
                    //
                    saveContent: function(params, data, isNewContent) {
					    var self = this;
                        var path = params.absPath;
                        $.ajax({
                            'type': 'GET',
                            'url': urlArg +'/save',
                            'dataType': 'jsonp',
                            'data': {'diagram':data, 'path': path, 'description':"update"},
                            'success': function(ddd) {
                                var dt = $(self.treeParentSelector).dynatree("getTree");
                                dt.loadKeyPath(path, function(t,c,s) {}, "title");
                            }
                        });
                    },
                    //
                    // New folder creation API
                    //
                    newfolder:function(path,callback) {
                        dm.dm.dialogs['Activate']("new-project-dialog", function(name) {
                            $.ajax({
                                type: 'GET',
                                url: urlArg + '/newfolder?path=' + path +'&key='+ name,
                                dataType: 'jsonp',
                                success: function(data) {
                                    if (callback) callback(data);
                                }
                            });
                        });
                    },
                    //
                    // Tree context menu
                    //
                    'ctx_menu':
                    [
                     {
                        title: "Reload",
                        click : function(node) {
                            node.reloadChildren();
                        }
                     },
                     {
                             title: "Open",
                             click: function(node) {
                                 // TODO: REMOVE THIS COPY_PAST OF tree.onActivate !!!
                                 if (!node.data.isFolder) {
                                     if ($("#tab-" + node.data.key).length == 0) {
                                         var title = node.data.title;
                                         var contentType = dm.dm.fw.getContentType(title);

                                         if (contentType != undefined) {
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
                                             //                    if (params.contentType == "md" || params.contentType == "dm") {
                                             dm.dm.fw.loadContent(params);
                                             /*                    }
                        else {
                          self.loadContent(params);
                        }*/
                                         }
                                     }
                                 }
                             },
                     },
                     {
                             title: "Save",
                             click:  function(node) {
                             },
                     },
                     {
                             title: "New folder",
                             click: function(node) {
                                 self.newfolder(node.getAbsolutePath(), function(desc) {node.addChild(desc);});
                             },
                     },
                     {
                             title: "New diagram",
                             click: function(node) {
                                 dm.dm.dialogs['Activate']("new-diagram-dialog");
                             },
                     },
                     {
                             title:"Remove",
                             click: function(node) {
                                 self.remove(node.getAbsolutePath(), function() {node.remove();});
                             }
                     }
                     ],
                     //
                     // Extension of element menu
                     //
                     "element_menu": {
                        "package": [
                          {
                            title: "Internal packages",
                            click : function(element) {
                                alert("Not implemented!!!");
                            }
						  },
						  {
								  title:"Dependency",
								  click: function(element)    {
									  alert("Not implemented!!!");
								  }
						  },
						  {
								  title:"Usage",
								  click: function(element) {
									  alert("Not implemented!!!");
								  }
						  }
						  ],
						  "class,objinstance": [
															  {
							title:'Open',
                            click: function(element) {
                                if (element.options.filepath) {
                                    var title = element.options.filepath.split("/").pop();
                                    var contentType = dm.dm.fw.getContentType(title);

                                    if (contentType != undefined) {
                                        var params =
                                        {
                                                viewid:self.euid,
                                                title:title,
                                                absPath:element.options.filepath,
                                                branch:self.activeBranch,
                                                isOwner:true,
                                                repoId:self.activeRepo,
                                                contentType:contentType,
                                                editable:false
                                        };
                                        if (params.contentType == "umlsync" || params.contentType == "markdown" || params.contentType == "code") {
                                            dm.dm.fw.loadContent(params);
                                        }
                                        else {
                                            self.loadContent(params);
                                        }
                                    }
                                }
                            },
                            klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
                                                                                  },
                                                                                  {
                                                                                          title: 'Update',
                                                                                          click: function(element) {  // element is the jquery obj clicked on when context menu launched
                                                                                              if (!element.options.viewid
                                                                                                      && !element.parrent.options.viewid) {
                                                                                                  return;
                                                                                              }

                                                                                              if (!element.options.viewid)
                                                                                                  element.options.viewid = element.parrent.options.viewid;

                                                                                              // Check if the information about file available
                                                                                              // or identify the file
                                                                                              if (!element.options.filepath
                                                                                                      || element.options.filepath == "") {
                                                                                                  $.ajax({
                                                                                                      url: urlArg + "/db/class/methods?key="+ element.getName(),
                                                                                                              dataType: "jsonp",
                                                                                                              success: function(data) {
                                                                                                          if (data && data.filepath) {
                                                                                                              element.options.filepath = data.filepath;
                                                                                                          }
                                                                                                      }
                                                                                                  }).fail(function(x,y,z) {alert("FAILED TO LOAD !!!" + x + y + z);});
                                                                                                  return;
                                                                                              }

                                                                                              var fpath = element.options.filepath;
                                                                                              fpath = (fpath) ? "&path="+fpath : "";
                                                                                              // Check if the information about file available
                                                                                              $.ajax({
                                                                                                  url: urlArg + "/db/class/methods?key="+ element.getName() + fpath,
                                                                                                          dataType: "jsonp",
                                                                                                          success: function(data) {
                                                                                                      var items = [];
                                                                                                      if (element.addOperation != undefined)  {
                                                                                                          var items = [];
                                                                                                          if (data.length == 0)
                                                                                                              return;
                                                                                                          //http://sourcenav.svn.sourceforge.net/viewvc/sourcenav/trunk/snavigator/hyper/sn.h?revision=240&view=markup
                                                                                                          // see ./snavigator/hyper/sn.h for values analysis
                                                                                                          var mapVisibility = function(vis, vs, sstr) { // s - is short writing
                                                                                                              var out = "";
                                                                                                              if (vis & 0x0001) {
                                                                                                                  out = (sstr)?"(-)":"private";
                                                                                                              } else if (vis & 0x0002) {
                                                                                                                  out = (sstr)?"(#)":"protected";
                                                                                                              } else if (vis & 0x0004) {
                                                                                                                  out = (sstr)?"(+)":"public";
                                                                                                              }
                                                                                                              if (vis & 0x1000) {
                                                                                                                  out = (sstr)?out:"virtual " + out;
                                                                                                              } else if (vis & 0x0008) {
                                                                                                                  out = (sstr)?out:"static " + out;
                                                                                                              }
                                                                                                              return (sstr)? out : out + "(" + vs + ")";
                                                                                                          };

                                                                                                          $.each(data, function(k, d) {
                                                                                                              items.push('<tr><td>' + mapVisibility(parseInt(d.attr), d.attr) + '</td><td>' + d.md + '</td><td>'+ d.ret + '</td><td>'+ d.args +'</td></tr>');
                                                                                                          }); 

                                                                                                          var innerHtml = items.join('');
                                                                                                          innerHtml = "<div id='vp_main_menu2'><div><div class='scrollable' style='scroll:auto;'>\
                        <table id='SearchResultTable' class='tablesorter'><thead><tr class='header'><th>Visibility</th><th>Class</th><th>Return type</th><th>Arguments</th></tr></thead><tbody>\
                        " + innerHtml + "</tbody></table></div>" +
                        "<p><input type='checkbox' id='us-public' value='public' />Public\
                         <input type='checkbox' id='us-private' value='private' />Private\
                         <input type='checkbox' id='us-protected' value='protected' />Protected</br>\
                         <input type='checkbox' name='us-static' value='static' />Static\
                         <input type='checkbox' name='us-not-static' value='not-static' />Not Static</br>\
                         <input type='checkbox' name='us-constructor' value='constructor' />Constructor\
                         <input type='checkbox' name='us-destructor' value='destructor' />Destructor</br>\
                         <br>\
                         <input type='checkbox' name='us-filter-arguments' value='arguments' />Show arguments ?</br>\
                         <label>Name filter: </label><input id='us-filter-methods' type='text' maxlength='30' pattern='[a-zA-Z ]{5,}' name='name'></p>" +
                         "</div></div>";

                                                                                                          $('body').append(innerHtml);

                                                                                                          $("#vp_main_menu2").dialog({
                                                                                                              autoOpen: true,
                                                                                                              width: 550,
                                                                                                              modal: true,
                                                                                                              buttons: {
                                                                                                                  "Accept": function() {
                                                                                                                      var reg = $("#vp_main_menu2 input#us-filter-methods").val();
                                                                                                                      var showArguments = $('#vp_main_menu2 input#us-filter-arguments').attr('checked');
                                                                                                                      var attributesFlag = 0x0000;
                                                                                                                      attributesFlag |= ($('#vp_main_menu2 input#us-public').attr('checked') ? 0x0004 : 0x0000);
                                                                                                                      attributesFlag |= ($('#vp_main_menu2 input#us-private').attr('checked') ? 0x0001 : 0x0000);
                                                                                                                      attributesFlag |= ($('#vp_main_menu2 input#us-protected').attr('checked') ? 0x0002 : 0x0000);
                                                                                                                      $.each(data, function(k, d) {
                                                                                                                          // Visibility filter
                                                                                                                          if (attributesFlag & parseInt(d.attr)) {
                                                                                                                              if (reg != '') {
                                                                                                                                  if (d.md.match(reg))
                                                                                                                                      element.addOperation({text:mapVisibility(parseInt(d.attr), d.attr, true) + " " + d.ret + " " +d.md + "("+ (showArguments ? d.args : "") +")"});
                                                                                                                              } else {
                                                                                                                                  element.addOperation({text:mapVisibility(parseInt(d.attr), d.attr, true) + " " + d.ret + " " +d.md + "("+ (showArguments ? d.args : "") +")"});
                                                                                                                              }
                                                                                                                          }
                                                                                                                      });
                                                                                                                      $( this ).dialog( "close" );
                                                                                                                      $( this ).remove();
                                                                                                                  },
                                                                                                                  Cancel: function() {
                                                                                                                      $( this ).dialog( "close" );
                                                                                                                      $( this ).remove();
                                                                                                                  }
                                                                                                              },
                                                                                                              close: function() {
                                                                                                              }
                                                                                                          }); // $.dialog({});

                                                                                                          $("#SearchResultTable").tablesorter({sortList: [[0,0], [1,0]]});
                                                                                                      }

                                                                                                      else {
                                                                                                          element.options.methods = new Array();
                                                                                                          $.each(data, function(k, d) {
                                                                                                              element.options.methods.push(d.md + "()");
                                                                                                          });
                                                                                                      }
                                                                                                  }
                                                                                              }
                                                                                              ).fail(function(x,y,z) {alert("FAILED TO LOAD !!!" + x + y + z);}); // getJSON
                                                                                          },
                                                                                          klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
                                                                                  },
                                                                                  {
                                                                                          title:'Get base class',
                                                                                          click: function(element){
                                                                                              if (!element.options.viewid
                                                                                                      || !element.options.filepath) {
                                                                                                  return;
                                                                                              }
                                                                                              var fpath = element.options.filepath;
                                                                                              fpath = (fpath) ? "&path="+fpath : "";
                                                                                              $.ajax({
                                                                                                  url: urlArg + "/db/class/base/?key="+ element.getName() + fpath,
                                                                                                          dataType: "jsonp",
                                                                                                          success : function(data) {
                                                                                                      var items = [];
                                                                                                      var e2 = $.extend({}, element.parrent.menuIcon.dmb.getElementById("Class"), {'viewid':element.options.viewid});
                                                                                                      if (e2 != undefined) {
                                                                                                          $.each(data,function(k, d) {
                                                                                                              $.each(d, function(key, val) {
                                                                                                                  e2.pageX = 200;
                                                                                                                  e2.pageY = 200;
                                                                                                                  e2.name = val;
                                                                                                                  e2.filepath = val['filepath'];
                                                                                                                  var ename = element.parrent.Element(e2.type, e2);
                                                                                                                  //menuBuilder.loader.Connector("generalization", {selected: element.id, temporary: ename});
                                                                                                              });
                                                                                                          });
                                                                                                      }
                                                                                                  }
                                                                                              });
                                                                                          },
                                                                                          klass: "second-menu-item"
                                                                                  },
                                                                                  {
                                                                                          title:'Get realization class',
                                                                                          click: function(element){
                                                                                              if (!element.options.viewid) {
                                                                                                  return;
                                                                                              }
                                                                                              var fpath = element.options.filepath;
                                                                                              fpath = (fpath) ? "&path="+fpath : "";
                                                                                              $.ajax({
                                                                                                  url: urlArg +"/db/class/realization?key="+ element.getName() + fpath,
                                                                                                          dataType: "jsonp",
                                                                                                          success:function(data) {
                                                                                                      var items = [];
                                                                                                      var e2 = $.extend({}, element.parrent.menuIcon.dmb.getElementById("Class"), {'viewid':element.options.viewid});
                                                                                                      if (e2 != undefined) {

                                                                                                          var items = [];

                                                                                                          $.each(data, function(k, d) {
                                                                                                              items.push('<tr><td>' + d['filepath'] + '</td><td>' + d['title'] + '</td></tr>');
                                                                                                          }); 

                                                                                                          var innerHtml = items.join('');
                                                                                                          innerHtml = "<div id='vp_main_menu2'><div><div class='scrollable' style='scroll:auto;'>\
                            <table id='SearchResultTable' class='tablesorter'><thead><tr class='header'><th>Path</th><th>Class</th></tr></thead><tbody>\
                            " + innerHtml + "</tbody></table></div>" +
                            "<p><label>Search result: </label><input type='text' maxlength='30' pattern='[a-zA-Z ]{5,}' name='name'></p>" +
                            "</div></div>";



                                                                                                          $('body').append(innerHtml);
                                                                                                          $("#vp_main_menu2").dialog({
                                                                                                              autoOpen: true,
                                                                                                              width: 550,
                                                                                                              modal: true,
                                                                                                              buttons: {
                                                                                                                  "Accept": function() {
                                                                                                                      var reg = $("#vp_main_menu2 input").val();
                                                                                                                      var posInc = 200;
                                                                                                                      $.each(data,function(k, d) {
                                                                                                                          if (reg == '' || d.md.match(reg)) {
                                                                                                                              e2.pageX = posInc;
                                                                                                                              e2.pageY = 200;
                                                                                                                              posInc+=200;
                                                                                                                              e2.left = e2.pageX;
                                                                                                                              e2.top = e2.pageY;
                                                                                                                              e2.name = d['title'];
                                                                                                                              e2.filepath = d['filepath'];

                                                                                                                              var ename = element.parrent.Element(e2.type, e2, function(loadedElement) {
                                                                                                                                  // Create the connector
                                                                                                                                  element.parrent.Connector("generalization", {fromId: loadedElement.euid, toId: element.euid});
                                                                                                                              }
                                                                                                                              );
                                                                                                                          }
                                                                                                                      });
                                                                                                                      $( this ).dialog( "close" );
                                                                                                                      $( this ).remove();
                                                                                                                  },
                                                                                                                  Cancel: function() {
                                                                                                                      $( this ).dialog( "close" );
                                                                                                                      $( this ).remove();
                                                                                                                  }
                                                                                                              },
                                                                                                              close: function() {
                                                                                                              }
                                                                                                          }); // $.dialog({});

                                                                                                          $("#SearchResultTable").tablesorter({sortList: [[0,0], [1,0]]});
                                                                                                      }
                                                                                                  }
                                                                                              }); // ajax
                                                                                          },
                                                                                          klass: "second-menu-item"
                                                                                  },
                                                                                  {
                                                                                          title:'Get nested class',
                                                                                          click: function(element){
                                                                                              if (!element.options.viewid
                                                                                                      || !element.options.filepath) {
                                                                                                  return;
                                                                                              }
                                                                                              var fpath = element.options.filepath;
                                                                                              fpath = (fpath) ? fpath.substr(0, fpath.length - element.options.name.length - 1):"";
                                                                                              fpath = (fpath) ? "&path="+fpath : "";
                                                                                              $.ajax({
                                                                                                  url: urlArg + "/db/class/nested?key="+ element.getName() + fpath,
                                                                                                          dataType: "jsonp",
                                                                                                          success : function(data) {
                                                                                                      var items = [];
                                                                                                      var e2 = $.extend({}, element.parrent.menuIcon.dmb.getElementById("Class"), {'viewid':element.options.viewid});
                                                                                                      if (e2 != undefined) {
                                                                                                          $.each(data,function(k, d) {
                                                                                                              $.each(d, function(key, val) {
                                                                                                                  e2.pageX = 200;
                                                                                                                  e2.pageY = 200;
                                                                                                                  e2.name = val;
                                                                                                                  var ename = element.parrent.Element(e2.type, e2);
                                                                                                                  //menuBuilder.loader.Connector("generalization", {selected: element.id, temporary: ename});
                                                                                                              });
                                                                                                          });
                                                                                                      }
                                                                                                  }
                                                                                              });
                                                                                          },
                                                                                          klass: "second-menu-item"
                                                                                  },
                                                                                  {
                                                                                          title:'Get association class',
                                                                                          click: function(element){ alert('second clicked' + element.getAux()); },
                                                                                          klass: "second-menu-item"
                                                                                  },
                                                                                  {
                                                                                          title:'Get aggregation class',
                                                                                          click: function(element){ alert('second clicked' + element.getAux()); },
                                                                                          klass: "second-menu-item"
                                                                                  },
                                                                                  {
                                                                                          title:'Get composition class',
                                                                                          click: function(element){ alert('second clicked' + element.getAux()); },
                                                                                          klass: "second-menu-item"
                                                                                  },
                                                                                  ]

                    },
					
					// Setup the contex menus selector
					setTeeContextMenu: function(selector) {
					  this.treeCtxMenuSelector = "#" + selector;
					},

                    //
                    // Tree initialization
                    //
                    initTree: function (parentSelector) {
                        this.treeParentSelector = parentSelector;
                        $(parentSelector)
                        .dynatree({
                            title:name,
                            autoFocus: false,
                            initAjax: {
                                url: urlArg + "/getlist",
                                dataType: 'JSONP',
                                data: {path: "/"}
                            },
                            onLazyRead: function(node){
                                var key = "",
                                        separator = "",
                                        filenode = node;

                                while ((filenode.data.addClass == 'iconclass')
                                        || (filenode.data.addClass == 'namespace')) {
                                    key = filenode.data.title + separator + key;
                                    separator = "::";
                                    filenode = filenode.parent;
                                }
                                if (key == "") {
                                    key = undefined;
                                }
                                node.appendAjax({
                                    url: urlArg + "/getlist",
                                    dataType: "JSONP",
                                    data: {path: filenode.getAbsolutePath(false), key:key}
                                });
                            }, // onLazyRead
                            onActivate: function(node) {
								$(".context-menu").hide();
                                // Nothing to load for folder
                                if (node.data.isFolder) {
                                    self.active =  node.getAbsolutePath();
                                    return;
                                } else {
                                    var par = node.parent;
                                    while (!par.data.isFolder) {
                                        par = par.parent;
                                    }
                                    self.active =  (par && par != null) ? par.getAbsolutePath() : "/";
                                }

                                var title = node.data.title;
                                var contentType = dm.dm.fw.getContentType(title);

                                if (contentType != undefined) {
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

                                    if (params.contentType == "md" || params.contentType == "dm"|| params.contentType == "code") {
                                        dm.dm.fw.loadContent(params);
                                    }
                                    else {
                                        self.loadContent(params);
                                    }
                                }
                            }, // onActivate
                            onFocus: function(node) {
								  $(".context-menu").hide();
                                  if (node.data.isFolder) {
                                    self.active = node.getAbsolutePath();
                                  }
                                  else {
								    self.active = node.parent.getAbsolutePath();
                                  }
                                },
                            onCreate: function(node, span){
                                $(span).bind('contextmenu',
                                        function(e) {
                                    var node = $.ui.dynatree.getNode(e.currentTarget);
                                    dm.dm.fw.ShowContextMenu(self.treeCtxMenuSelector, e, node);
                                    e.preventDefault();
                                });
                            },
                            dnd: {
                                onDragStart: function(node) {
                                    node.data.viewid = self.euid;
                                    return true;
                                },
                                onDragStop: function(node) {
                                    return true;
                                }
                            }
                        });//dynatree
                    }
            }; //self= {...}
            return self;
        };
    }; // ILocalhostViewManager
})(jQuery, dm);

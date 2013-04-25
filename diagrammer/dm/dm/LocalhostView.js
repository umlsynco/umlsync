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

  dm.base.LocalhostView = function(urlArg) {
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
          self.activeStorageNode = null;

          var $tree = $(self.treeParentSelector).dynatree("getTree");

          $tree.loadKeyPath(path, function(node, result) {
            if (result == "ok") {
              self.activeStorageNode = node;
              var tmp = node.getChildren();
              var res = new Array();
              for (var r in tmp) {
                if (tmp[r].data.isFolder)
                  res.push(tmp[r].data.title);
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
        },
        //
        // Save content to eclipse plugin
        //
        saveContent: function(params, data, isNewContent) {
          var path = params.absPath;
          $.ajax({
            'type': 'GET',
            'url': urlArg +'/save',
            'dataType': 'jsonp',
            'data': {'diagram':data, 'path': path, 'description':"update"},
            'success': function(ddd) {
              var dt = $("#view-2 #tree").dynatree("getTree");
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
              if ('diagramclass' == node.data.addClass)
                dm.dm.fw.loadDiagram({viewid:self.euid, node:node, title:node.data.title, absPath:node.getAbsolutePath()}); // Create tab first and load content later

              if ('cfile' == node.data.addClass)
                dm.dm.fw.loadCode(urlArg + '/openfile?path=' + node.getAbsolutePath(), node.data.title);
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
          "Package,Subsystem": [
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
          "Class,Interface,Object Instance": [
            {
              title:'Open',
              click: function(element) {
                var name = element.option("name");
                if ($("#tab-" + name).length == 0) {
                  $("#tabs").tabs('add', '#tab-' + name, name);
                  if (element.options.filepath) {
                    $("#tab-" + name).load('http://localhost:8000/editor/?key=' + element.options.filepath.substr(0, element.options.filepath.length - name.length - 1) +'&project=storageman');
                  }
                }
                $("#tabs").tabs('select', '#tab-' + element.option("name"));
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
                        element.options.filepath = data.filepath + "/" + data.title;
                      }
                    }
                  }).fail(function(x,y,z) {alert("FAILED TO LOAD !!!" + x + y + z);});
                  return;
                }

              var fpath = element.options.filepath;
                fpath = (fpath) ? fpath.substr(0, fpath.length - element.options.name.length - 1):"";
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
                    "<p><label>Search result: </label><input type='text' maxlength='30' pattern='[a-zA-Z ]{5,}' name='name'></p>" +
                    "<p style='margin: 10px 0; align: middle;'><button class='finish' type='submit' style='background-color:#7FAEFF;cursor:default;'>Finish</button>&nbsp;&nbsp;&nbsp;" +
                    "<button type='submit' class='close'>Cancel</button></p>" +
                    "</div></div>";

                    $('body').append(innerHtml);
                    //$("#vp_main_menu2").draggable({cancel: '.scrollable'});
                    $("#vp_main_menu2").dialog({
                        autoOpen: true,
                        width: 550,
                        modal: true,
                        buttons: {
                          "Accept": function() {
                              var reg = $("#vp_main_menu2 input").val();
                              $.each(data, function(k, d) {
                                if (reg != '') {
                                  if (d.md.match(reg))
                                    element.addOperation({text:mapVisibility(parseInt(d.attr), d.attr, true) + " " + d.ret + " " +d.md + "("+ d.args +")"});
                                } else {
                                  element.addOperation({text:mapVisibility(parseInt(d.attr), d.attr, true) + " " + d.ret + " " +d.md + "("+ d.args +")"});
                                }
                              });

                          },
                          Cancel: function() {
                            $( this ).dialog( "close" );
                          }
                        },
                        close: function() {
                        }
                    }); // $.dialog({});

                    $("#SearchResultTable").tablesorter({sortList: [[0,0], [1,0]]});
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
          fpath = (fpath) ? fpath.substr(0, fpath.length - element.options.name.length - 1):"";
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
          fpath = (fpath) ? fpath.substr(0, fpath.length - element.options.name.length - 1):"";
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
                "<p style='margin: 10px 0; align: middle;'><button class='finish' type='submit' style='background-color:#7FAEFF;cursor:default;'>Finish</button>&nbsp;&nbsp;&nbsp;" +
                "<button type='submit' class='close'>Cancel</button></p>" +
                "</div></div>";



                $('body').append(innerHtml);
                $("#vp_main_menu2").draggable({cancel: '.scrollable'});
                $("#vp_main_menu2").overlay({
                  // custom top position
                  top: 150,
                  // some mask tweaks suitable for facebox-looking dialogs
                  mask: {
                  // you might also consider a "transparent" color for the mask
                  color: '#',
                  // load mask a little faster
                  loadSpeed: 200,
                  // very transparent
                  opacity: 0.5
                },
                // disable this for modal dialog-type of overlayoverlays
                closeOnClick: true,
                // load it immediately after the construction
                load: true
                });
                $("#vp_main_menu2 .close").click(function() { $("#vp_main_menu2").remove();});
                $("#vp_main_menu2 .finish").click(function() { $("#vp_main_menu2").remove();});
                $("#SearchResultTable").tablesorter({sortList: [[0,0], [1,0]]});
                $.each(data,function(k, d) {

                  e2.pageX = 200;
                  e2.pageY = 200;
                  e2.name = d['title'];
                  e2.filename = d['filename'];

                  var ename = element.parrent.Element(e2.type, e2);
                  //    menuBuilder.loader.Connector("generalization", {selected: ename, temporary: element.euid});
                });
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
        //
        // Tree initialization
        //
        initTree: function (parentSelector) {
           this.treeParentSelector = parentSelector;
           $(parentSelector)
           .dynatree(
             {
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
            // Nothing to load for folder
            if (node.data.isFolder) {
                return;
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

                dm.dm.fw.loadContent(params);
            }
          }, // onActivate
          onCreate: function(node, span){
            $(span).bind('contextmenu',
              function(e) {
                var node = $.ui.dynatree.getNode(e.currentTarget);
                dm.dm.fw.ShowContextMenu(self.euid, e, node);
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
             }
           );
        }
    }; //self= {...}
    return self;
  };
})(jQuery, dm);


/*
Class: LocalhostView

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2012 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  umlsync.org/about

Version:
  2.0.0 (2012-07-22)
 */
//@aspect
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
		init: function() {
			// Check localhost availability and select port
		},
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
		getActivePath: function() {
			return self.activePath || "/";
		},
		'loadDiagram':function(node, repo, callback) {
           var parentPath = node.data.parentPath,
               prefix = (parentPath && parentPath.getAbsolutePath) ? parentPath.getAbsolutePath() : "",
		       path = node.getAbsolutePath ? node.getAbsolutePath(): prefix.split("/")[1] + "/" + node.data.path;
		
		   $.ajax({
		     url: urlArg + '/open?path='+ path,
			 dataType: 'jsonp',
			 async: false,
			 success: function(data, status) {
                if (status == "success")
                  callback.success(null, data)
                else 
                  callback.success(status)
             },
			 error:callback.error
		   });
		},
		'loadMarkdown':function(node, repo, callback) {
		   var path = node.getAbsolutePath ? node.getAbsolutePath():node.data.path;
		
		   function markdownHandler(data) {
		      callback.success(data['data']);
		   }

		   $.ajax({
		     url: urlArg + '/open?path='+ node.getAbsolutePath(),
			 dataType: 'jsonp',
			 success: function(x, y, z) {
			    decodeMDContent(x,y,z,function(data) { callback.success(null, data)});
			 },
			 error:callback.error
		   });
		},
		'loadCode':function(node, repo, callback) {
		   var path = node.getAbsolutePath ? node.getAbsolutePath():node.data.path;
		
		   $.ajax({
		     url: urlArg + '/open?path='+ node.getAbsolutePath(),
			 dataType: 'jsonp',
			 success: callback.success,
			 error:callback.error
		   });
		},
		save: function(path, data, description) {
		    
			if (path.indexOf(".umlsync") <= 0) {
			  path += ".umlsync";
			}
            $.ajax({
                'type': 'GET',
                'url': urlArg +'/save',
                'dataType': 'jsonp',
                'data': {'diagram':data, 'path': path, 'description':description},
                'success': function(ddd) {
					var dt = $("#view-2 #tree").dynatree("getTree");
						dt.loadKeyPath(path, function(t,c,s) {}, "title");
				}
            });
		},
		newfolder:function(path,callback) {
		   dm.dm.dialogs['Activate']("new-project-dialog", function(name) {
			  $.ajax({
				type: 'GET',
				url: urlArg + '/newfolder?path=' + path +'&key='+ name,
				dataType: 'jsonp',
				success: function(data) {if (callback) callback(data);}
			  });
			
			});
		},
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
						dm.dm.fw.loadDiagram(self.euid, node); // Create tab first and load content later

					if ('cfile' == node.data.addClass)
						dm.dm.fw.loadCode(urlArg + '/openfile?path=' + node.getAbsolutePath(), node.data.title);
				}
			}
		},
		},
		{
			title: "Save",
			click:	function(node) {
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
		"element_menu":	{
		  "Package,Subsystem": {
			"Internal packages": function(element) {
			  alert("Not implemented!!!");
		    },
		    "Dependency": function(element)    {
			  alert("Not implemented!!!");
		    },
		    "Usage": function(element) {
			  alert("Not implemented!!!");
		    }
		  },
		  "Class,Interface,Object Instance": {
            'Open': {
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
		    'Update': {
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
					url: loadUrl + "vm/"+element.options.viewid+"/db/class/methods?key="+ element.getName(),
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
				  url: loadUrl + "vm/"+element.options.viewid+"/db/class/methods?key="+ element.getName() + fpath,
				  dataType: "jsonp",
				  success: function(data) {
				    var items = [];
				    if (element.addMethod != undefined)  {
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
					}
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

						$("#SearchResultTable").tablesorter({sortList: [[0,0], [1,0]]});

						$("#vp_main_menu2 .finish").click(function() {
							var reg = $("#vp_main_menu2 input").val();
							$.each(data, function(k, d) {
								if (reg != '') {
									if (d.md.match(reg))
										element.addMethod(mapVisibility(parseInt(d.attr), d.attr, true) + " " + d.ret + " " +d.md + "("+ d.args +")");
								} else {
									element.addMethod(mapVisibility(parseInt(d.attr), d.attr, true) + " " + d.ret + " " +d.md + "("+ d.args +")");
								}
							});
							$("#vp_main_menu2").remove();
						});

						$("#vp_main_menu2 .close").click(function() { $("#vp_main_menu2").remove();});

				} // element.addmethod
			}
			}).fail(function(x,y,z) {alert("FAILED TO LOAD !!!" + x + y + z);}); // getJSON

		},
		klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
		},
		'Get base class': {
			click: function(element){
			if (!element.options.viewid
					|| !element.options.filepath) {
				return;
			}
			var fpath = element.options.filepath;
			fpath = (fpath) ? fpath.substr(0, fpath.length - element.options.name.length - 1):"";
			fpath = (fpath) ? "&path="+fpath : "";
			$.ajax({
				url: loadUrl + "vm/"+element.options.viewid+"/db/class/base/?key="+ element.getName() + fpath,
				dataType: "jsonp",
				success : function(data) {
				var items = [];
				var e2 = $.extend({}, menuBuilder.dmb.getElementById("Class"), {'viewid':element.options.viewid});
				if (e2 != undefined) {
					$.each(data,function(k, d) {
						$.each(d, function(key, val) {
							e2.pageX = 200;
							e2.pageY = 200;
							e2.name = val;
							var ename = menuBuilder.diagram.Element(e2.type, e2);
							//menuBuilder.loader.Connector("generalization", {selected: element.id, temporary: ename});
						});
					});
				}
			}
			});
		},
		klass: "second-menu-item"
		},
		'Get realization class': {
			click: function(element){
			if (!element.options.viewid) {
				return;
			}
			var fpath = element.options.filepath;
			fpath = (fpath) ? fpath.substr(0, fpath.length - element.options.name.length - 1):"";
			fpath = (fpath) ? "&path="+fpath : "";
			$.ajax({
				url: loadUrl + "vm/"+element.options.viewid+"/db/class/realization?key="+ element.getName() + fpath,
				dataType: "jsonp",
				success:function(data) {
				var items = [];
				var e2 = $.extend({}, menuBuilder.dmb.getElementById("Class"), {'viewid':element.options.viewid});
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

							var ename = menuBuilder.diagram.Element(e2.type, e2);
							//    menuBuilder.loader.Connector("generalization", {selected: ename, temporary: element.euid});
						});
				}
			}
			}); // ajax
		},
		klass: "second-menu-item"
		},
		'Get nested class': {
			click: function(element){
			if (!element.options.viewid
					|| !element.options.filepath) {
				return;
			}
			var fpath = element.options.filepath;
			fpath = (fpath) ? fpath.substr(0, fpath.length - element.options.name.length - 1):"";
			fpath = (fpath) ? "&path="+fpath : "";
			$.ajax({
				url: loadUrl + "vm/"+element.options.viewid+"/db/class/nested?key="+ element.getName() + fpath,
				dataType: "jsonp",
				success : function(data) {
				var items = [];
				var e2 = $.extend({}, menuBuilder.dmb.getElementById("Class"), {'viewid':element.options.viewid});
				if (e2 != undefined) {
					$.each(data,function(k, d) {
						$.each(d, function(key, val) {
							e2.pageX = 200;
							e2.pageY = 200;
							e2.name = val;
							var ename = menuBuilder.diagram.Element(e2.type, e2);
							//menuBuilder.loader.Connector("generalization", {selected: element.id, temporary: ename});
						});
					});
				}
			}
			});
		},
		klass: "second-menu-item"
		},
		'Get association class': {
			click: function(element){ alert('second clicked' + element.getAux()); },
			klass: "second-menu-item"
		},
		'Get aggregation class': {
			click: function(element){ alert('second clicked' + element.getAux()); },
			klass: "second-menu-item"
		},
		'Get composition class': {
			click: function(element){ alert('second clicked' + element.getAux()); },
			klass: "second-menu-item"
		},
		}
		},
		initTree: function(parentSelector) {
		
		$(parentSelector).dynatree(
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
			if (!node.data.isFolder) {
			        var tt = node.data.title.split(".");
					var title = tt[0].toUpperCase(), ext = (tt.length > 1) ? tt[tt.length-1].toUpperCase() : "";
					var repo="pe";
                    if (ext == "JSON" || ext == "UMLSYNC") {
          			  dm.dm.fw.loadDiagram(self.euid, repo, node);
					} else if (title == "README" ||  ext == "MD" || ext == "rdoc") {
						  dm.dm.fw.loadMarkdown(self.euid, repo, node);
						} else if ((["C", "CPP", "H", "HPP", "PY", "HS", "JS", "CSS", "JAVA", "RB", "PL", "PHP"]).indexOf(ext) >= 0){
						  dm.dm.fw.loadCode(self.euid, repo, node);
						}
					if ('diagramclass' == node.data.addClass)
						dm.dm.fw.loadDiagram(self.euid, "pe",node);

					//if ('cfile' == node.data.addClass)
						//dm.dm.fw.loadCode(urlArg + '/openfile?path=' + node.getAbsolutePath(), node.data.title);
			} else {
			    self.activePath = node.getAbsolutePath();
			}
		}, // onActivate
        onCreate: function(node, span){
          $(span).bind('contextmenu', function(e) {
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
			//logMsg("tree.onDragStop(%o)", node);
		}
		}
		});
		
		}, //tree

		};
		return self;
	};
//	@aspect
})(jQuery, dm);


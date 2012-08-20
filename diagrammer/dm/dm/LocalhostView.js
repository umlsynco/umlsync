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
		return {
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
			save: function(data, path, callback) {
				//TODO: check path
				$.ajax({
					type: 'GET',
					url: urlArg +'/save',
					dataType: 'jsonp',
					data: {'diagram':data, 'path': path, 'description':'Test diagram'},
					success: function(ddd) {alert("DONE COOL !!!!" + ddd);}
				});
			},
			newfolder:function(path,name,callback) {
				$.ajax({
					type: 'GET',
					url: urlArg + '/newfolder?' + path +'key='+ name,
					dataType: 'jsonp',
					success: function(data) {if (callback) callback(data);}
				});
			},
			tree: {
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
						if ($("#tab-" + node.data.key).length == 0) {
							if ('diagramclass' == node.data.addClass)
								self.loadDiagram(urlArg + '/open?path='+node.getAbsolutePath(), "jsonp");

							if ('cfile' == node.data.addClass)
								self.loadCode(urlArg + '/openfile?path=' + node.getAbsolutePath(), node.data.title);

							// Urgly hack for diagram selection menu
							var val = $("#vp_main_menu input").val();
							val.substr(val.lastIndexOf('/'))
							$("#vp_main_menu input").val(node.parent.getAbsolutePath() + '/' + val.substr(val.lastIndexOf('/')));
						}
					} else {
						// Ugly hack for diagram selection menu
						var val = $("#vp_main_menu input").val();
						val.substr(val.lastIndexOf('/'))
						self.views[uid].active = node.getAbsolutePath();
						$("#vp_main_menu input").val(node.getAbsolutePath() + val.substr(val.lastIndexOf('/')));
					}
				}, // onActivate
				onCreate: function(node, span){
					$(span).bind('contextmenu', function(e) {
						self.views[uid].ctxmenunode = node;
						self.views[uid].ctxmenu.css({"left":e.pageX - 20, "top":e.pageY - 20}).show();
						e.preventDefault();
					});
				}, // onCreate
				dnd: {
					onDragStart: function(node) {
						node.data.viewid = uid;
						return true;
					},
					onDragStop: function(node) {
						//logMsg("tree.onDragStop(%o)", node);
					}
				}
			}, //tree
			elements: {
				'class': {
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
				}
			}
			
		};
	};
//	@aspect
})(jQuery, dm);


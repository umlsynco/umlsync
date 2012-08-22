/*
Class: LocalFilesView

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

	dm.base.SelfAnalysisView = function(urlArg) {
	  this.urlArg = urlArg;
    };
	dm.base.SelfAnalysisView.prototype = 
		    {
			'init': function() {
			  return (window.dm != undefined); 
			},
			'info': function(callback) {
				if (callback)
					callback(null);
			},
			'remove': function(path, callback) {
				if (callback)
					callback.call();
			},
			'save': function(data, path, callback) {
				
			},
			'newfolder':function(path,name,callback) {
				if (callback) callback({'isFolder':true,'isLazy':true,'title':name, 'addClass':"package"});
			},
			'ctx_menu': {
			   "Reload": function(node) {
			      node.reloadChildren();
			   },
			   "Open": function(node) {
			   },
			   "Save": function(node) {
			   },
			   "New folder": function(node) {
			     this.newfolder(node.getAbsolutePath(), "newFolder", function(desc) {node.addChild(desc);});
			   },
			   "Remove": function(node) {
			     this.remove(node.getAbsolutePath(), function() {node.remove();});
			   }
			},
			"ctx_element": {
			  "class": {
			    "Update": function(element) {
			    },
			    "Hide inherited": function(element) {
			    }
			  }
			},
			'tree': {
				persist: true,
				children: {title: 'dm', isLazy:true, isFolder:true, key:"root"}, 
                onCreate: function(node, span){
                   $(span).bind('contextmenu', function(e) {
				     var node = $.ui.dynatree.getNode(e.currentTarget);
					 alert("Show context menu for: " + node.data.title);
					 e.preventDefault();
				   });
                },
				onLazyRead: function(node){
					if (node.data.isFolder) {
		              var ch = new Array();
					  if (node.data.title == "dm" && node.data.key == "root") {
					     for (r in dm) {
							ch.push({title: r, isLazy:true, isFolder:true, addClass:"package"}); 
					     }
					  } else {
					    function GetNode(n) {
						   if (n.data.key != "root") {
						     var elem = GetNode(n.parent);
							 if (elem.prototype) {
							   return elem.prototype[n.data.title];
							 }
							 return elem[n.data.title];
						   } else {
						     return dm;
						   }						   
						}
						var element = GetNode(node);
						if (element.prototype) {
						  for (r in element.prototype) {
                            var isObject = (element.prototype[r].prototype != undefined)|| $.isPlainObject(element);;
							var isFunction = $.isFunction(element.prototype[r]);
							isFunction = (!isFunction || isObject);
						    var addClass = (isObject) ? "iconclass":"package";
							ch.push({title: r, isLazy:isFunction, isFolder:isFunction, addClass:addClass}); 
						  }
						} else {
						  for (r in element) {
                            var isObject = (element[r].prototype != undefined)|| $.isPlainObject(element);
							var isFunction = $.isFunction(element[r]);
							isFunction = (!isFunction || isObject);
						    var addClass = (isObject) ? "iconclass":"package";
							ch.push({title: r, isLazy:isFunction, isFolder:isFunction, addClass:addClass}); 
						  }
						}
						/*	
					    if (node.parent.data.key != "root") {
						  
						  var par = node.parent.data.title;
						  var isObject = (dm[par][node.data.title].prototype != undefined);
						  var pro = (isObject) ? dm[par][node.data.title].prototype : dm[par][node.data.title];
						  var addClass = (isObject) ? "iconclass":"package";
						  for (r in pro) {
							ch.push({title: r, isLazy:true, isFolder:true, addClass:addClass}); 
					      }
						} else {
					      for (r in dm[node.data.title]) {
						    var isObject = (dm[node.data.title][r].prototype != undefined);
						    var addClass = (isObject) ? "iconclass":"package";
							ch.push({title: r, isLazy:true, isFolder:true, addClass:addClass}); 
					     }
						}
					  
					  */} 
					node.addChild(ch);
                   }
					node.setLazyNodeStatus(DTNodeStatus_Ok);
				},
				onActivate: function(node) {
					if (!node.data.isFolder)
					  dm.dm.fw.loadDiagram(this.urlArg + node.getAbsolutePath() + ".json");
				},
				dnd: {
					onDragStart: function(node) {
						return true;
					},
					onDragStop: function(node) {
						//logMsg("tree.onDragStop(%o)", node);
					}
				}
			} //tree
		};

//	@aspect
})(jQuery, dm);


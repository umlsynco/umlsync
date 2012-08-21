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
	
		return {
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
							ch.push({title: r, isLazy:true, isFolder:true, addClass:addClass}); 
					     }
						}
					  } 
					node.addChild(ch);
                   }
					node.setLazyNodeStatus(DTNodeStatus_Ok);
				},
				onActivate: function(node) {
					if (!node.data.isFolder)
					  dm.dm.fw.loadDiagram(urlArg + node.getAbsolutePath() + ".json");
				},
			} //tree
		};
	};
//	@aspect
})(jQuery, dm);


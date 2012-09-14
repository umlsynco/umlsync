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

	dm.base.LocalFilesView = function(urlArg) {
	
		var self = {
		    euid: 'LocalFiles',
			init: function() {
				// Check localhost availability and select port
			},
			info: function(callback) {
				if (callback)
					callback(null);
			},
			remove: function(path, callback) {
			    // All remove method could success
				if (callback)
					callback.call();
			},
			save: function(data, path, callback) {
				
			},
			loadDiagram: function(node, callback) {
			    $.log("LOADING: " + urlArg + node.getAbsolutePath() + ".json");
				$.ajax({
		          url: urlArg + node.getAbsolutePath() + ".json",
				  dataType: 'json',
				  success: callback.success,
				  error:callback.error
		           });
			},
			newfolder:function(path,name,callback) {
				if (callback) callback({isFolder:true,isLazy:true,title:name});
			},
			tree: {
				persist: true,
				initAjax: { url: urlArg + "base.json"}, 
				onLazyRead: function(node){
					if (node.data.isFolder) {
					  node.appendAjax({url: urlArg + node.getAbsolutePath() + ".json"});
                    }
				},
				onActivate: function(node) {
					if (!node.data.isFolder)
					  dm.dm.fw.loadDiagram(self.euid, node);
				},
			} //tree
		};
		return self;
	};
//	@aspect
})(jQuery, dm);


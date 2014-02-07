/*
Class: editor and viewer functionality for diagrams

View and edit diagrams

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2014 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com).

URL:
  http://umlsync.org
 */

(function($, dm, undefined) {
	dm.hs.umlsync = function() {

	    // singleton
		function getInstance() {
			dm.dm = dm.dm || {};
			if (!dm.dm['umlsync']) {
				// create a instance
				dm.dm['umlsync'] = new umlsync();
			}

			// return the instance of the singletonClass
			return dm.dm['umlsync'];
		}

		var umlsync = function() {
		}

		umlsync.prototype = {
		options: {
			mime_types:"application/vnd.umlsync.uml+json",
			extensions:"UMLSYNC",
			uid: "umlsync",
			edit:true,
			view:true
		},
		getUid: function() {
		  return this.options.uid;
		},
		getExtensionList: function() {
			return this.options.extensions.split(";");
		},
		getMimeTypeList: function() {
			return this.options.mime_types.split(";");
		},
		open: function(parent, contentInfo, contentData) {
			var jsonData = (typeof contentData === "string") ? $.parseJSON(contentData) : contentData,
					viewid = contentInfo.viewid,
					self = this;

			jsonData.multicanvas = (contentInfo.selector != undefined);

			// enable diagram menu
			if (contentInfo.selector == undefined) {
				$(parent).attr("edm", contentInfo.editable)
			}
			else {
				self.embeddedContents[parent] = contentInfo;
			}

			jsonData['fullname'] = contentInfo.absPath;
			jsonData['editable'] = true;

			dm.dm.loader.Diagram(
					jsonData.type,
					jsonData.base_type || "base",
					jsonData,
					parent,
					function(obj) {
					    // TODO: Keep diagram info in a framework ?
						//self.diagrams[parent] = obj; 

						obj.onDestroy(function() {
						    // TODO: release content in the IView
							// self.views[contentInfo.viewid].view.releaseContent(contentInfo);
							
							// Drop diagram from the list
							//delete self.diagrams[parent];
						});

						if (obj.options.multicanvas) {
							self['ActivateDiagramMenu'](obj.options['type']);
							obj.draw();
						}
						obj.options['viewid'] = viewid;
						dm.dm.loader.OnLoadComplete(
								function() {
									obj._setWidgetsOption("editable", contentInfo.editable);
								}
						);
					});
		},
		hasModification: function(parent) {
		  return true;
		},
		getDescription: function(parent) {
		  return null;
		},
		close: function(parent) {
		  $(parent).destroy();
		}
		};

		return getInstance();

	};

})(jQuery, dm);

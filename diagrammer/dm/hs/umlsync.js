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
		//
		// The cached content values for a corresponding tabs
		//
		contentCache: {},
		//
		// Unique id of this editor/viewer
		//
		getUid: function() {
		  return this.options.uid;
		},
		//
		// List of supported extensions
		//
		getExtensionList: function() {
			return this.options.extensions.split(";");
		},
		//
		// List of supported mime types
		//
		getMimeTypeList: function() {
			return this.options.mime_types.split(";");
		},
		//
		// Open method, works in view mode by default (if view supported)
		// parentSelector - selector of parent frame
		// contentInfo    - information about content
		// contentData    - raw or JSON data
		//
		open: function(parent, contentInfo, contentData) {
			var jsonData = (typeof contentData === "string") ? $.parseJSON(contentData) : contentData,
					viewid = contentInfo.viewid,
					self = this;

			jsonData.multicanvas = (contentInfo.selector != undefined);

			// enable diagram menu
			if (contentInfo.selector == undefined) {
				$(parent).attr("edm", contentInfo.editable)
				this.contentCache[parent] = {data:contentData};
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
							//self['ActivateDiagramMenu'](obj.options['type']);
							obj.draw();
						}

						// keep the object reference in cache
						self.contentCache[parent]["diagram"] = obj;

						obj.options['viewid'] = viewid;
						dm.dm.loader.OnLoadComplete(
								function() {
									obj._setWidgetsOption("editable", contentInfo.editable);
								}
						);
					});
		},
		//
		// Switch between edit and view mode
		// mode - boolean flag:  true - edit; false - view;
		//
		switchMode: function(parentSelector, mode) {
  	      if (this.contentCache[parentSelector]) {
		    var did = this.contentCache[parentSelector]["diagram"];
			did._setWidgetsOption("editable", mode);

			// Handle the diagram menu status
			var $selrt = $(parentSelector).attr("edm", mode);
			if (mode) {
				$(".diagram-menu").show();
				// Show the refernces close-icons
				$selrt.removeClass("us-view-mode");
				$(parentSelector + " div#us-references .ui-icon-close").show();
				//self['ActivateDiagramMenu'](did.options['type']);
			} else {
				$(".diagram-menu").hide();
				// Hide the refernces close-icons
				$selrt.addClass("us-view-mode");
			}
		  }
		},
		//
		// Get the cached value of current content
		//
		getDescription: function(parent) {
		  return null;
		},
		//
		// Destroy the content edit/view area,
		// before the corresponding tab closing
		//
		close: function(parent) {
		  $(parent).destroy();
		}
		};

		return getInstance();

	};

})(jQuery, dm);

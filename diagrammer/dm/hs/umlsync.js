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
				this.contentCache[parent] = {data:contentData, mode:false};
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
						// keep the object reference in cache
						self.contentCache[parent]["diagram"] = obj;

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

            if (this.contentCache[parentSelector]["mode"] == mode)
			  return;
			
			this.contentCache[parentSelector]["mode"] = mode;

			// Handle the diagram menu status
			var $selrt = $(parentSelector).attr("edm", mode);
			if (mode) {
				$(".diagram-menu").show();
				// Show the refernces close-icons
				$selrt.removeClass("us-view-mode");
				$(parentSelector + " div#us-references .ui-icon-close").show();

                // Enable diagram for menu the corresponding item
				this.ActivateDiagramMenu(did.options['type']);
			} else {
				$(".diagram-menu").hide();
				// Hide the refernces close-icons
				$selrt.addClass("us-view-mode");
			}
		  }
		},
		//
		// Notify on tab in focus, when we need to re-draw picture
		//
		// parentSelector - CSS selector of parent id
		// isInFocus      - in focus(true) or focus left(false)
		//
		onFocus: function(parentSelector, isInFocus) {
          if (this.contentCache[parentSelector]) {
		    var did = this.contentCache[parentSelector]["diagram"];
			// Diagram is loading
			// do nothing
			if (!did) {
			  return;
			}
			// diagram was loaded
			if (isInFocus) {
			  // enable  diagram menu if item is editable
			  // and switch to the corresponding elements
			  if (this.contentCache[parentSelector]["mode"]) {
			    $(".diagram-menu").show();
			    this.ActivateDiagramMenu(did.options['type']);
			  }
			}
			else {
			  $(".diagram-menu").hide();
			}

		    // redraw
            did.onFocus(isInFocus);
		  }
		},
		//
		//  Switch to the corresponding
		//  menu item
		//
		ActivateDiagramMenu:function(type) {
			var menuIsActive = false;
			var len = $("#accordion").length;
			if (len) {
				var idx = -1;
				len = 0; // Wrong length earlier, have to re-calculate it again
				$("#accordion").find("h3").each(function(index) {
					++len;
					if ($(this).attr("aux") == type) {
						idx = index;
						menuIsActive = true;
					}
				});

				if (idx >=0) {
					$("#accordion").accordion({'active': idx});
				}
			}
			$("#accordion").children("DIV").css("width", "");
			return menuIsActive;
		},
		//
		// Work around for a while
		//
		_getContentObject: function(parentSelector) {
          if (this.contentCache[parentSelector]) {
		    return this.contentCache[parentSelector]["diagram"];
		  }
		},
		//
		// Get the cached value of current content
		//
		getDescription: function(parentSelector) {
          if (this.contentCache[parentSelector] && this.contentCache[parentSelector]["diagram"]) {
		    return this.contentCache[parentSelector]["diagram"].getDescription();
		  }
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

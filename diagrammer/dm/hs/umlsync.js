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
	dm.hs.umlsync = function(options) {

	    // singleton
		function getInstance(options) {
			dm.dm = dm.dm || {};
			if (!dm.dm['umlsync']) {
				// create a instance
				dm.dm['umlsync'] = new umlsync();
			}

			// extend the default options
            dm.dm['umlsync'].options = $.extend({}, dm.dm['umlsync'].options, options);

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
		// Cache for embedded content
		//
		embeddedContents: {},
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
					    // Embedded content, no handlers required
					    if (!self.contentCache[parent]) {
						  return;
						}

						// keep the object reference in cache
						self.contentCache[parent]["diagram"] = obj;

						obj.onModified = function(selector, flag) {
						  	if (self.options.onModified)
						       self.options.onModified(selector, flag);
						};

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
			  // hide the diagram menu
			  $(".diagram-menu").hide();
			  // hide all context menus
			  $(".context-menu").hide();
			  // hide the color picker's menu
			  $(".us-context-toolbox").hide();
			  
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
		getDescription: function(parentSelector, flag) {
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
		},
		//
		// Handler of custom keys Ctrl-Z/Y/C/V/X,Del
		// Some of the the sequence should handle framework itself (Ctrl-S and Del)
		//
		onKeyPressed: function (parent, e) {
		  if (!this.contentCache[parent] || !this.contentCache[parent]["diagram"])
		    return;
		  // diagram object
		  var did = this.contentCache[parent]["diagram"];
		  
  		  if (e.ctrlKey) {
			switch (e.keyCode) {
			case 65:// Handle Ctrl-A
				if (did) {
					did._setWidgetsOption("selected", true);
				}
				e.preventDefault();
				break;

			case 67: // Handle Ctrl-C
				// 1. Get focus manager
				// 2. if element ? => copy it on clipboard
				//          stop propagate
				if (did)  {
					this.clippy = did.getDescription("selected", true);
				} else {
					this.clippy = undefined;
				}
				break;
			case 88:
				// Handle Ctrl-X
				// 1. Get focus manager
				// 2. if element ? => copy it on clipboard
				//          stop propagate
				// 3. Remove element
				if (did)  {
					if (did.clickedElement != undefined) {
						did.clickedElement._update();
						this.clippy = did.clickedElement.getDescription();
						$("#" + did.clickedElement.euid + "_Border").remove();
					} else {
						this.clippy = undefined;
					}
				} else {
					this.clippy = undefined;
				}
				break;
			case 86:// Handle Ctrl-V
				// 1. Get focus manager
				// 2. if diagram ? => try copy element from clipboard
				//          stop propagate if success
				if ((this.clippy)  && (did)) {
					// Make selected only inserter items
					did._setWidgetsOption("selected", false);
					did.multipleSelection = true;
					var obj = $.parseJSON(this.clippy),
							es = obj["elements"],
							cs = obj["connectors"];
					for (var j in es) {
						es[j].pageX = parseInt(es[j].pageX) + 10;
						$.log("pzgeX: " + es[j].pageX);
						es[j].pageY = parseInt(es[j].pageY) + 10;
						did.Element(es[j].type, es[j], function(obj) {
							es[j].euid = obj.euid;
						});
					}

					dm.dm.loader.OnLoadComplete(function() {
						for (var c in cs) {
							for (var j in es) {
								if (es[j].id == cs[c].fromId) {
									cs[c].fromId = es[j].euid;
								}
								// Can not use else because of selfassociation connector
								if (es[j].id == cs[c].toId) {
									cs[c].toId = es[j].euid;
								}

							}
							did.Connector(cs[c].type, cs[c]);
						}
					});

					//for (j in cs)
					//did.Connector(cs[j].type, cs[j]);
					this.clippy = undefined;
				}
				break;
			case 90:// Handle Ctrl-Z
				// 1. Get focus manager
				// 2. if diagram => get operation sequence manager
				//         -> goBack()
				if (did)  {
					did.opman.revertOperation();
				}
				break;
			case 89:// Handle Ctrl-Y
				// 1. Get focus manager
				// 2. if diagram => get operation sequence manager
				//         -> goForward()
				if (did)  {
					did.opman.repeatOperation();
				}
				break;
			case 83:// Handle Ctrl-S
                // TODO: Save the current status as default
				break;
			default:
				break;
			}
		  }
		  return true;
		}
		};

		return getInstance(options);

	};

})(jQuery, dm);

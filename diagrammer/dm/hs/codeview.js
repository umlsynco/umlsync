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
	dm.hs.codeview = function() {

	    // singleton
		function getInstance() {
			dm.dm = dm.dm || {};
			if (!dm.dm['codeview']) {
				// create a instance
				dm.dm['codeview'] = new codeview();
			}

			// return the instance of the singletonClass
			return dm.dm['codeview'];
		}

		var codeview = function() {
		}

		codeview.prototype = {
		options: {
			mime_types:"application/vnd.umlsync.code",
			extensions:"C,CPP,H,HPP,PY,HS,JS,CSS,JAVA,RB,PL,PHP",
			uid: "codeview",
			edit:false,
			view:true
		},
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
			return this.options.extensions.split(",");
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
			$(parent).append("<div class='us-sourcecode'><pre class='prettyprint linenums:1'>" + contentData + "</pre></div>");
            prettyPrint();
		},

		//
		// Switch between edit and view mode
		// mode - boolean flag:  true - edit; false - view;
		//
		switchMode: function(parentSelector, mode) {
		},

		//
		// Notify on tab in focus, when we need to re-draw picture
		//
		// @param parentSelector - CSS selector of parent id
		// @param isInFocus      - in focus(true) or focus left(false)
		//
		onFocus: function(parentSelector, isInFocus) {
            // There is a specific behavior for snippets mode only
            if (!this.snippetHandler)
                return;

            this._helperSetSnippetMode(parentSelector, isInFocus);
		},

		//
		// Handler of custom keys Ctrl-Z/Y/C/V/X,Del
		// Some of the the sequence should handle framework itself (Ctrl-S and Del)
		//
		onKeyPressed: function (parent, e) {
		  // Empty for a while
		},

		//
		// Get the cached value of current content
		//
		getDescription: function(parent, updateCache) {
		  // only view mode supported
		  return null;
		},

		//
		// Destroy the content edit/view area,
		// before the corresponding tab closing
		//
		close: function(parent) {
		  $(parent).destroy();
        },

        // Helper method to enable/disable snippet mode
        // There is no need to support snippet mode for the content which is not in focus
        // and content should not be in editable mode too
        //
        // @param parentSelector - content's tab selector
        // @param isInForcus - in focus flag true/false
        //
        _helperSetSnippetMode: function(parentSelector, isInFocus) {
            var self = this;
            if (isInFocus) {
                $(parentSelector + ' ol.linenums>li').bind('click', function(e) {
                    if (self.snippetHandler) {
                        var position = {top:e.clientY, left: e.clientX};
                        self.snippetHandler.showSnippetBubble(position, parentSelector);
                    }
                });
            }
            else {
                $(parentSelector + ' ol.linenums>li').unbind('click');
            }
        },

        //
        // Switch diagram to the snippet mode
        // @param handler - snippet handler, if null then disable snippets
        //
        snippetMode: function(parentSelector, handler) {
            var flag = (handler != null);
            // Keep handler in cache
            this.snippetHandler = handler;
            this._helperSetSnippetMode(parentSelector, true);
        }
		};

		return getInstance();

	};

})(jQuery, dm);

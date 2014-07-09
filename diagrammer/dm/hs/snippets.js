/*
Class: snippets handler

View and edit snippets for all types of handler

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2014 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com).

URL:
  http://umlsync.org
 */

(function($, dm, undefined) {
	dm.hs.snippets = function() {

	    // singleton
		function getInstance() {
			dm.dm = dm.dm || {};
			if (!dm.dm['snippets']) {
				// create a instance
				dm.dm['snippets'] = new snippets();
			}

			// return the instance of the singletonClass
			return dm.dm['snippets'];
		}

		var snippets = function() {
		}

		snippets.prototype = {
		options: {
			mime_types:"application/vnd.umlsync.snippets",
			extensions:"us.snippet",
			uid: "snippet"
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
		// Show snippet bubble for the corresponding conent view
		//
		showSnippetBubble: function(p, uid) {
          var params = dm.dm.fw.contents[uid];
		  var update = $(uid + " #snippet_bubbble").length != 0;
 		  if (!update) {
			  $(uid).append('<div id="snippet_bubble" class="us-snippet"><p class="triangle-border top" id="vrrrrrrrrrrrrrr">&lt;p&gt;[text]&lt;/p&gt;.</p>\
				<span style="position:absolute;right:50px;top:15px;" class="ui-icon ui-icon-check"></span>\
				<span style="position:absolute;right:30px;top:15px;" class="ui-icon ui-icon-cancel"></span>\
				<span style="position:absolute;right:10px;top:15px;" class="ui-icon ui-icon-trash"></span>\
				</div>');
			  $("#snippet_bubble p").editable({type:'textarea'});
			  $("#snippet_bubble").css({left:p.left,top:p.top}).draggable({'containment': "#" + this.euid}).resizable().children("SPAN")
			  .click({params:params, position:p}, function(e) {
                 var info = e.data;
				 var $this = $(this);
				 var message= $("#vrrrrrrrrrrrrrr").text();

				 if ($this.hasClass("ui-icon-trash")) {
					$this.parent().remove();
			     }
				 else if ($this.hasClass("ui-icon-cancel")) {
	  			  // Send nothing, just cancel-revert changes
				 }
				 else if ($this.hasClass("ui-icon-check")) {
                   // Extend a snippet information with Text Message
                   info['msg'] = message;
				   $.event.trigger({
					type: "snippet.add",
                    info: info,
					time: new Date()
				  });
				 }
			  });
			  

			  
			}
			else {
			  // Change the position of existing bubble
			  $(uid + "#snippet_bubbble").css({left:p.left,top:p.top});
			}
		},

		//
		// Get the cached value of current content
		//
		getDescription: function(parent, updateCache) {
		  // only view mode supported
		  return null;
		}
      };

	  return getInstance();
	};
})(jQuery, dm);

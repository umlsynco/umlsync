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
		// Show snippet bubble for the corresponding content view
        // @param p - position, size, and custom information which depends on Viewer
        // @param uid - tabid
        // @param msg - message inside snippet
		//
		showSnippetBubble: function(p, uid, msg, force) {
          // Get the content description from the framework
          var params = dm.dm.fw.contents[uid];

          // Check if it is update of position of existing bubble
		  var update = $(uid + ">DIV>#snippet_bubble").length != 0;

 		  if (!update || force) {
              // Drop all existing bubble to prevent some kind of mess
              $("#snippet_bubble").remove();
              // Create a new SnippetBubble
			  $(uid + ">DIV").append('<div id="snippet_bubble" class="us-snippet"><p class="triangle-border top" id="vrrrrrrrrrrrrrr">&lt;p&gt;[text]&lt;/p&gt;.</p>\
				<span style="position:absolute;right:50px;top:15px;" class="ui-icon ui-icon-check"></span>\
				<span style="position:absolute;right:30px;top:15px;" class="ui-icon ui-icon-cancel"></span>\
				<span style="position:absolute;right:10px;top:15px;" class="ui-icon ui-icon-trash"></span>\
				</div>');
			  $(uid + ">DIV>#snippet_bubble p").editable({type:'textarea'});
			  $(uid + ">DIV>#snippet_bubble")
              .css({left:p.left,top:p.top, width:(p.width ? p.width: 250),height:(p.height ? p.height: 100)})
              .draggable()
              .resizable()
              .children("SPAN")
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
                   var $par = $this.parent();
                   var p1 = $par.position();

                   // Correct position and size of snippet bubble
                   // TODO: Add an information about reference element etc...
                   info.position.left = p1.left;
                   info.position.top = p1.top;
                   info.position.width = $par.width();
                   info.position.height = $par.height();

				   $.event.trigger({
					type: "snippet.add",
                    info: info,
					time: new Date()
				  });

                  // drop element after save
                  $par.remove();
				 }
			  });
			}
		  else {
			  // Change the position of existing bubble
			  $(uid + ">DIV>#snippet_bubbble")
              .css({left:p.left,top:p.top,
                    width:(p.width ? p.width:250),
                    height:(p.height ? p.height:100)});
		  }

          // Update snippet text for existing snippet
		  if (msg) {
              var mmm = (msg == "") ? "_" : msg;
              $("#vrrrrrrrrrrrrrr").text(mmm);
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

/*
Class: viewer functionality for the markdown

View markdown

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2014 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com).

URL:
  http://umlsync.org
 */

(function($, dm, undefined) {
	dm.hs.mdviewer = function() {
        var converter = new Showdown.converter({ extensions: ['umlsync'] });

		// singleton
		function getInstance() {
			dm.dm = dm.dm || {};
			if (!dm.dm['mdviewer']) {
				// create a instance
				dm.dm['mdviewer'] = new mdviewer();
			}

			// return the instance of the singletonClass
			return dm.dm['mdviewer'];
		}

		var mdviewer = function() {
		}

		mdviewer.prototype = {
		options: {
			mime_types:"application/vnd.umlsync.md",
			extensions:"MD",
			uid:"mdviewer",
			edit:false,
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
		open: function(tabname, params, data) {
			var innerHtml = '<div class="us-diagram announce instapaper_body md" data-path="/" id="readme"><span class="name">\
					<span class="mini-icon mini-icon-readme"></span> '+params.absPath+'</span>\
					<article class="markdown-body entry-content" itemprop="mainContentOfPage">\
					'+converter.makeHtml(data)+'\
					</article></div>';
			$(tabname).append(innerHtml); // Markdown loaded
		},
		close: function(parent) {
		  $(parent + " div#readme").remove();
		}
		};

		return getInstance();

	};

})(jQuery, dm);

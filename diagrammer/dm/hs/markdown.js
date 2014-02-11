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
	dm.hs.markdown = function() {
        var converter = new Showdown.converter({ extensions: ['umlsync'] });

		// singleton
		function getInstance() {
			dm.dm = dm.dm || {};
			if (!dm.dm['markdown']) {
				// create a instance
				dm.dm['markdown'] = new markdown();
			}

			// return the instance of the singletonClass
			return dm.dm['markdown'];
		}

		var markdown = function() {
		}

		markdown.prototype = {
		options: {
			mime_types:"application/vnd.umlsync.md",
			extensions:"MD",
			uid:"markdown",
			edit:true,
			view:true
		},
		//
		// The cached content values for a corresponding tabs
		//
		contentCache: {},
		//
		// Unique id for this editor/viewer
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
		open: function(parentSelector, contentInfo, contentData) {
		    this.contentCache[parentSelector] = {info: contentInfo, data:contentData};
			this._viewMarkdown(parentSelector, contentInfo, contentData);
		},
		//
		// Destroy the content edit/view area,
		// before the corresponding tab closing
		//
		close: function(parentSelector) {
		  delete this.contentCache[parentSelector];
		  $(parentSelector + " div#readme").remove();
		},
		//
		// Helper method to open  markdown in view mode
		//
		_viewMarkdown: function(parentSelector, contentInfo, contentData) {
			var innerHtml = '<div class="us-diagram announce instapaper_body md" data-path="/" id="readme"><span class="name">\
					<span class="mini-icon mini-icon-readme"></span> '+contentInfo.absPath+'</span>\
					<article class="markdown-body entry-content" itemprop="mainContentOfPage">\
					'+converter.makeHtml(contentData)+'\
					</article></div>';
			$(parentSelector).append(innerHtml); // Markdown loaded
		},
		//
		// Helper method to open  markdown in edit mode
		//
		_editMarkdown: function(parentSelector, contentInfo, contentData) {
			// Hide/Show editor menu
			if ($(parentSelector + " #markdown").length > 0) {
				$(parentSelector + " span.us-toolbox-header").show();
				$(parentSelector + " #markdown").show();
				return;
			}

			//
			// Helper method to get selected items
			//
			function getSelection() {
				return (!!document.getSelection) ? document.getSelection() :
					(!!window.getSelection) ? window.getSelection() :
						document.selection.createRange().text;
			}

			// toolbox descriptor
			var rrrr = '<span class="us-toolbox-header"><ul style="list-style:none outside none;">\
					<li class="us-toolbox-button us-toolbox-h1"><a title="Heading 1 [Ctrl+1]" accesskey="1" postfix="\n========\n">First Level Heading</a></li>\
					<li class="us-toolbox-button us-toolbox-h2"><a title="Heading 2 [Ctrl+2]" accesskey="2" postfix="\n--------\n" href="">Second Level Heading</a></li>\
					<li class="us-toolbox-button us-toolbox-h3"><a title="Heading 3 [Ctrl+3]" accesskey="3" prefix="### " href="">Heading 3</a></li>\
					<li class="us-toolbox-button us-toolbox-h4"><a title="Heading 4 [Ctrl+4]" accesskey="4" prefix="#### " href="">Heading 4</a></li>\
					<li class="us-toolbox-button us-toolbox-h5"><a title="Heading 5 [Ctrl+5]" accesskey="5" prefix="##### " href="">Heading 5</a></li>\
					<li class="us-toolbox-button us-toolbox-h6"><a title="Heading 6 [Ctrl+6]" accesskey="6" prefix="###### " href="">Heading 6</a>\
					</li><li class="us-toolbox-separator">&nbsp</li>\
					<li class="us-toolbox-button us-toolbox-bold"><a title="Bold [Ctrl+B]" accesskey="B" prefix="**" postfix="**">Bold</a></li>\
					<li class="us-toolbox-button us-toolbox-italic"><a title="Italic [Ctrl+I]" accesskey="I" prefix="_" postfix="_">Italic</a></li>\
					<li class="us-toolbox-separator">&nbsp</li>\
					<li class="us-toolbox-button us-toolbox-bullet "><a title="Bulleted List" prefix="- ">Bulleted List</a></li>\
					<li class="us-toolbox-button us-toolbox-numlist"><a title="Numeric List" prefix="1. ">Numeric List</a></li>\
					<li class="us-toolbox-separator">&nbsp</li>\
					<li class="us-toolbox-button us-toolbox-pic"><a title="Picture [Ctrl+P]" accesskey="P" prefix="">Picture</a></li>\
					<li class="us-toolbox-button us-toolbox-link"><a title="Link [Ctrl+L]" accesskey="L" prefix="">Link</a></li>\
					<li class="us-toolbox-separator">&nbsp</li>\
					<li class="us-toolbox-button us-toolbox-quotes"><a title="Quotes" prefix="> ">Quotes</a></li>\
					<li class="us-toolbox-button us-toolbox-code"><a title="Code Block / Code" prefix="<code>" postfix="</code>">Code Block / Code</a></li>\
					<li class="us-toolbox-separator">&nbsp</li>\
					<li class="us-toolbox-button us-toolbox-diagram"><a title="Insert diagram reference" prefix="diagram">Diagram reference / Diagram</a></li>\
					<li class="us-toolbox-separator">&nbsp</li>\
					</ul></span><textarea rows="20" cols="80" id="markdown" class="us-markdown-editor"></textarea>';

					$(rrrr).appendTo(parentSelector);

					//self._helperUpdateFrameWork(true); // Make text area to fit size of content

					$(parentSelector + " span.us-toolbox-header ul li.us-toolbox-button a")
					.click(contentInfo, function(e) {
						var contentInfo = e.data;
						var sel = $(parentSelector + " #markdown").getSelection();
						//$(parentSelector + " #markdown").getSelection();
						//alert("CLICKED !!! " + sel.text);
						var prefix = $(this).attr("prefix") || "",
								postfix = $(this).attr("postfix") || "";

						if (prefix == "diagram") {
							prefix = "";
							if (self.cachedLink && self.cachedLink.title.split(".").pop() == "umlsync") {
								var contentInfo2 = self.cachedLink;
								var path;
								// Use relative paths inside repository
								if (contentInfo2.repoId == contentInfo.repoId
										&& contentInfo2.viewid == contentInfo.viewid
										&& contentInfo2.branch == contentInfo.branch) {
									var p1 = contentInfo.absPath.split("/"),
											p2 = contentInfo2.absPath.split("/"),
											p3 = "",
											idx = 0,
											idx2 = 0;
									while (p2[idx] == p1[idx]) {
										++idx;
									}
									idx2 = idx;
									for (;idx<p1.length-1; ++idx) {
										p3 = "../" + p3;
									}
									if (p3 == "") {
										p3 = "."
									} else {
										p3 = p3.substring(0, p3.length -1);
									}
									for (;idx2<p2.length; ++idx2) {
										p3 = p3 + "/" + p2[idx2];
									}
									path = "?path=" + p3;
								}
								// and absolute path for external references
								else {
									path = "/" + contentInfo2.repoId + "/" + contentInfo2.branch + "/" + contentInfo2.absPath;
								}
								prefix = '![Diagram: ] (http://umlsync.org/github' + path + ' "';
								postfix = '")';
							}
							else {
								prefix = '![Diagram: ] (http://umlsync.org/github/%repo%/%branch%/%path% "';
								postfix = '")';
							}
						}

						$(parentSelector + " #markdown").wrapSelection(prefix, postfix);

						e.preventDefault();
						e.stopPropagation();
					});

                    // Insert test into the editable area
					$(parentSelector + " #markdown")
					.text(contentData)
					.bind("keyup paste", parentSelector, function(e) {
					// TODO: HANDLE modification state
					
						//var parent = e.data;

						//var text2 = self.markdown[parent];
						//var text1 = $(this).val();
						//if ($(this).val() != self.markdown[parent]) {
						//	self.onContentModifiedStateChanged(parent, true);
						//}
						//else {
//							self.onContentModifiedStateChanged(parent, false);
	//					}
					});
		},
		//
		// Switch between edit and view mode
		// mode - boolean flag:  true - edit; false - view;
		//
		switchMode: function(parentSelector, mode) {
  	      if (this.contentCache[parentSelector]) {
		    if (mode) {
			  // Remove the view part, because it could change anyway
			  $(parentSelector + " div#readme").remove();
			  // Open/Show edit part. There is no need to destroy edit part because it could be reusable
			  this._editMarkdown(parentSelector, this.contentCache[parentSelector]["info"], this.contentCache[parentSelector]["data"]);
			}
			else {
			  // Cache could be changed in editor and could not in view mode
			  this.contentCache[parentSelector]["data"] = $(parentSelector + " #markdown").val();
			  // Hide the edit part if available
			  $(parentSelector + " #markdown").hide();
              $(parentSelector + " span.us-toolbox-header").hide();
			  // Construct a new view
			  this._viewMarkdown(parentSelector, this.contentCache[parentSelector]["info"], this.contentCache[parentSelector]["data"]);
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
		  // Empty
		}
		};

		// return a singletone object in the dm.dm.markdown
		return getInstance();

	};

})(jQuery, dm);

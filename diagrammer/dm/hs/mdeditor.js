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
	dm.hs.mdeditor = function() {

		// singleton
		function getInstance() {
			dm.dm = dm.dm || {};
			if (!dm.dm['mdeditor']) {
				// create a instance
				dm.dm['mdeditor'] = new mdeditor();
			}

			// return the instance of the singletonClass
			return dm.dm['mdeditor'];
		}

		var mdeditor = function() {
		}

		mdeditor.prototype = {
				options: {
			mime_types:"application/vnd.umlsync.md",
			extensions:"MD",
			uid:"mdeditor",
			edit:true,
			view:false
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
		open: function(parent, params, contentData) {
			// Hide/Show editor menu
			if ($(parent + " #markdown").length > 0) {
				$(parent + " span.us-toolbox-header").show();
				$(parent + " #markdown").show();
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

					$(rrrr).appendTo(parent);

					//self._helperUpdateFrameWork(true); // Make text area to fit size of content

					$(parent + " span.us-toolbox-header ul li.us-toolbox-button a")
					.click(params, function(e) {
						var params = e.data;
						var sel = $(parent + " #markdown").getSelection();
						//$(parent + " #markdown").getSelection();
						//alert("CLICKED !!! " + sel.text);
						var prefix = $(this).attr("prefix") || "",
								postfix = $(this).attr("postfix") || "";

						if (prefix == "diagram") {
							prefix = "";
							if (self.cachedLink && self.cachedLink.title.split(".").pop() == "umlsync") {
								var params2 = self.cachedLink;
								var path;
								// Use relative paths inside repository
								if (params2.repoId == params.repoId
										&& params2.viewid == params.viewid
										&& params2.branch == params.branch) {
									var p1 = params.absPath.split("/"),
											p2 = params2.absPath.split("/"),
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
									path = "/" + params2.repoId + "/" + params2.branch + "/" + params2.absPath;
								}
								prefix = '![Diagram: ] (http://umlsync.org/github' + path + ' "';
								postfix = '")';
							}
							else {
								prefix = '![Diagram: ] (http://umlsync.org/github/%repo%/%branch%/%path% "';
								postfix = '")';
							}
						}

						$(parent + " #markdown").wrapSelection(prefix, postfix);

						e.preventDefault();
						e.stopPropagation();
					});

                    // Insert test into the editable area
					$(parent + " #markdown")
					.text(contentData)
					.bind("keyup paste", parent, function(e) {
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

					// Update the framework sizes
					self._helperUpdateFrameWork(true);
		}
		},
		hasModification: function(parent) {
			return true;
		},
		getDescription: function(parent) {
			return $(parent + " #markdown").val();
		},
		close: function(parent) {
		}
	};

	return getInstance();

};

})(jQuery, dm);

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
    dm.hs.markdown = function(options) {
        var converter = new Showdown.converter({ extensions: ['umlsync'] });

        // singleton
        function getInstance(options) {
            dm.dm = dm.dm || {};
            if (!dm.dm['markdown']) {
                // create a instance
                dm.dm['markdown'] = new markdown(options);
            }
            // extend the default options
            dm.dm['markdown'].options = $.extend({}, dm.dm['markdown'].options, options);

            // return the instance of the singletonClass
            return dm.dm['markdown'];
        }

        var markdown = function() {
        };

        markdown.prototype = {
        options: {
            mime_types:"application/vnd.umlsync.md",
            extensions:"MD",
            uid:"markdown",
            edit:true,
            view:true
        },

        //
        // Embedded content counter
        //
        counter:0,

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
        // Get the cached value of current content
        //
        getDescription: function(parentSelector, updateCache) {
          var text =  $(parentSelector + " #markdown").val();

          // Do nothing if not modified
          if (this.contentCache[parentSelector].data == text) {
            return null;
          }

          // Update cache, because content was saved in the IView
          if (updateCache) {
            this.contentCache[parentSelector].data = text;
          }
          return text;
          
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
            //
            // Handle an embedded content
            //
            if (this.options.onEmbeddedContentHandler) {
                    var self = this;
                    $(parentSelector + " article.markdown-body .umlsync-embedded-diagram").each(function() {
                        var newId = self.options.embedded + "-" + self.counter;
                        self.counter++;

                        var relativePath = $(this).attr("path"),
                                sum = $(this).attr("sha"),
								width = $(this).attr("width"),
								height = $(this).attr("height"),
                                loadParams;

                        // Initialize load parameter from content or inherit them from parent document
                        loadParams = {
                                sha:sum,
                                relativePath:relativePath,
                                repoId:$(this).attr("repo") || contentInfo.repoId,
                                branch:$(this).attr("branch") || contentInfo.branch,
                                viewid:$(this).attr("source") || contentInfo.viewid,
                                title: (relativePath == undefined) ? sum : relativePath.split("/").pop(), // title is the last word separated by slash
                                editable:false,
                                // extra options for content handler
                                contentType:"umlsync", // means diagram
                                selector:parentSelector + " #" +  newId,
								options: {
								   editable:false,
								   width:width,
								   height:height
								}
                        };

                        // TODO: What is this string for ?
                        $(this).css('padding', '40px').css("overflow", "none").css("text-align", "center");
                        // replace the default id by unique ID
                        $(this).attr("id", newId);

                        // all these contents should be embedded
                        // diagrams
                        self.options.onEmbeddedContentHandler(loadParams, contentInfo);
                    });
            }
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

////////////////////////////////////////////////////////////////////
// WORK AROUND FOR DIAGRAM INSERTION BY BUTTON CLICK
                        if (prefix == "diagram") {
                            prefix = "";
                            if (dm.dm.fw.cachedLink && dm.dm.fw.cachedLink.title.split(".").pop() == "umlsync") {
                                var contentInfo2 = dm.dm.fw.cachedLink;
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
                                prefix = '![mime-type:application/vnd.umlsync.json] (http://umlsync.org/github' + path + ' "';
                                postfix = '")';
                            }
                            else {
                                prefix = '![mime-type:application/vnd.umlsync.json] (http://umlsync.org/github/%repo%/%branch%/%path% "';
                                postfix = '")';
                            }
                        }
// END OF WORK-AROUND
////////////////////////////////////////////////////////////////////

                        $(parentSelector + " #markdown").wrapSelection(prefix, postfix);

                        e.preventDefault();
                        e.stopPropagation();
                    });

                    var self = this;

                    // Insert test into the editable area
                    $(parentSelector + " #markdown")
                    .text(contentData)
                    .bind("keyup paste", parentSelector, function(e) {
                       // TODO: Check for Ctrl-Z & Ctrl-Y & Ctrl-S
                        var parent = e.data;
                        if ($(this).val() != self.contentCache[parent].data) {
                           if (self.options.onModified)
                               self.options.onModified(parent, true);
                        }
                        else {
                            if (self.options.onModified)
                                self.options.onModified(parent, false);
                        }
                    });
        },

        //
        // Switch between edit and view mode
        // mode - boolean flag:  true - edit; false - view;
        //
        switchMode: function(parentSelector, mode) {
            //
            // Check that mode was changed
            // There is no cached state for each view, therefore we have to get it manually
            //
            var activeMode = !($(parentSelector + " div#readme").length > 0);
            if (activeMode == mode) {
                return;
            }

            // Start to switch mode
			var self = this;
			if (this.contentCache[parentSelector]) {
			  if (mode) {
			    // Notify framework about embedded content closing
				if (this.options.onEmbeddedContentHandler) {
					$(parentSelector + " article.markdown-body .umlsync-embedded-diagram").each(function() {
						var newId = this.id;

						var relativePath = $(this).attr("path"),
							sum = $(this).attr("sha"),
							loadParams;
						var contentInfo = self.contentCache[parentSelector].info;

						// Initialize load parameter from content or inherit them from parent document
						loadParams = {
								sha:sum,
								relativePath:relativePath,
								repoId:$(this).attr("repo") || contentInfo.repoId,
								branch:$(this).attr("branch") || contentInfo.branch,
								viewid:$(this).attr("source") || contentInfo.viewid,
								title: (relativePath == undefined) ? sum : relativePath.split("/").pop(), // title is the last word separated by slash

								// extra options for content handler
								contentType:"umlsync", // means diagram
								editable:false,
								selector:parentSelector + " #" +  newId
						};

						// free an embedded content cache
						self.options.onEmbeddedContentHandler(loadParams, contentInfo, true);
					});
				}
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
        // parentSelector - CSS selector of parent element
        // isInFocus      - in focus(true) or focus left(false)
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

        // Helper method to enable/disable snippet mode
        // There is no need to support snippet mode for the content which is not in focus
        // and content should not be in editable mode too
        //
        // @param parentSelector - content's tab selector
        // @param isInForcus - in focus flag true/false
        //
        _helperSetSnippetMode: function(parentSelector, isInFocus) {
            var self = this;

            if (this.snippetHandler) {
                // There is no way to handle snippets in edit mode of markdown
                // but it doesn't matter for exit from snippet mode
                this.switchMode(parentSelector, false);
            }

            if (isInFocus) {
                $(parentSelector + ' article.markdown-body').bind('click', function(e) {
                    if (self.snippetHandler) {
                        var position = {top:e.clientY, left: e.clientX};
                        self.snippetHandler.showSnippetBubble(position, parentSelector);
                    }
                });
            }
            else {
                $(parentSelector + ' article.markdown-body').unbind('click');
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

        // return a singletone object in the dm.dm.markdown
        return getInstance(options);
    };

})(jQuery, dm);

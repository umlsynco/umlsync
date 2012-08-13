/*
Class: LocalhostView

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2012 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  umlsync.org/about

Version:
  2.0.0 (2012-07-22)
 */
//@aspect
(function($, dm, undefined) {

	// RuntimeAnalysis view was introduced for runtime self analysis of project
	dm.base.RuntimeAnalysisView = function(url) {
		var pUrl = url;
		return {
		   init: function() { return {title:"dm", isLazy:true, isFolder:true}},
		   append: function(path) {
			// analyse the path and get dm[ds][diagram] for example
		   }
			
		};
	};
//	@aspect
})(jQuery, dm);


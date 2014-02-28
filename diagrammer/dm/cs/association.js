/*
Class: association

Association connector creates a connection beween two elements of diagram

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2011 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  umlsync.org/about

Version:
  2.0.0 (2012-07-12)
*/
//@aspect
(function($, dm, undefined) {

dm.base.diagram("cs.association", dm.cs['connector'], {
    'draw': function(context2, points, color, isSvg) {
            if ((points == null) || (points.length < 2)) {
               return;
            }
            var ep = points.length-1;
			if (isSvg) {
				var desc = '<polyline points="';
				var comma = '';
				for (var t=0; t < ep; ++t) {
				  desc += comma + this.points[t][0] + ' ' + this.points[t][1];
				  comma = ', ';
				}
				desc += '"/>';
				desc += '<polyline points="' + points[ep-1][0] + ' ' + points[ep-1][1] + ','+  points[ep][0] + ' ' + points[ep][1] + '"/>';
				return desc;
			}
            context2.beginPath();
            context2.fillStyle = color;
            context2.strokeStyle = color;
            context2.moveTo(points[0][0], points[0][1]);
            for (var i=1; i<=ep; ++i) {
              context2.lineTo(points[i][0], points[i][1]);
            }
            context2.stroke();
            context2.closePath();
    }
    });
//@aspect
})(jQuery, dm);

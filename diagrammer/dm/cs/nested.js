/*
Class:  nested

UML nested  connector creates a connection beween two elements of diagram

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

dm.base.diagram("cs.nested", dm.cs['connector'], {
    'draw': function(context2, points, color, isSvg) {
            if ((points == null) || (points.length < 2)) {
               return;
            }

            var ep = points.length-1;
            var x = 15,
                dx = points[ep][0] - points[ep-1][0],
                dy = points[ep][1] - points[ep-1][1],
                gip = Math.sqrt(dx*dx + dy*dy);

            
            var sina = dy/gip,
            cosa = dx/gip,
            z = x-3,
            x3 = points[ep][0] - Math.sqrt(x*x*3/4)*cosa,
            y3 = points[ep][1] - Math.sqrt(x*x*3/4)*sina,
            x6 = points[ep][0] - Math.sqrt(x*x*3)*cosa,
            y6 = points[ep][1] - Math.sqrt(x*x*3)*sina,
            x4 = x3 + z * sina/2,
            y4 = y3 - z * cosa/2,
            x5 = x3 - z * sina/2,
            y5 = y3 + z * cosa/2,
            x31 = points[ep][0] - Math.sqrt(z*z*3/4)*cosa,
            y31 = points[ep][1] - Math.sqrt(z*z*3/4)*sina,
            x61 = points[ep][0] - Math.sqrt(z*z*3)*cosa,
            y61 = points[ep][1] - Math.sqrt(z*z*3)*sina;
			
			// Return SVG connector's group
			if (isSvg) {
				var desc = '<polyline points="';
				var comma = '';
				for (var t=0; t < ep; ++t) {
				  desc += comma + points[t][0] + ' ' + points[t][1];
				  comma = ', ';
				}
				desc += '"/>';
				desc += '<polyline points="' + points[ep-1][0] + ' ' + points[ep-1][1] + ','
				        + points[ep][0] + ' ' + points[ep][1] + '"/>';
                desc += '<circle fill="white" cx="' + x3 + '" cy="' + y3 + '" r="15"/>';
                desc += '<polyline  points="' + x4 + ' ' +y4 + ',' + x5 + ' ' +y5 + ',' + x31 + ' ' +y31+ ','  + x61 + ' ' +y61 +'"/>';
				return desc;
			}
            
            context2.beginPath();
            context2.fillStyle = color;
            context2.strokeStyle = color;
            context2.moveTo(points[0][0], points[0][1]);
            for (i=1; i<ep; ++i) {
              context2.lineTo(points[i][0], points[i][1]);
            }

            if (gip<x)
               return;

            context2.moveTo(points[ep-1][0], points[ep-1][1]);
            context2.lineTo(x6, y6);
            context2.stroke();
            context2.moveTo(x3, y3);
            context2.arc(x3,y3, x/2, 0, Math.PI * 2, true);
            
            context2.moveTo(x4, y4);
            context2.lineTo(x5, y5);
            
            context2.moveTo(x31, y31);
            context2.lineTo(x61, y61);
            //context2.lineTo(x6, y6);

            context2.stroke();
            context2.closePath();
        
    }
    });
//@aspect
})(jQuery, dm);

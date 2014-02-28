/*
Class: composition

UML composition connector creates a connection beween two elements of diagram

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

dm.base.diagram("cs.composition", dm.cs['connector'], {
    'draw': function(context2, points, color, isSvg) {
            if ((points == null) || (points.length < 2)) {
               return;
            }

            var ep = points.length-1;
            var x = 10,
                dx = points[ep][0] - points[ep-1][0],
                dy = points[ep][1] - points[ep-1][1],
                gip = Math.sqrt(dx*dx + dy*dy);

            if (gip<x)
               return;
            
            var sina = dy/gip,
            cosa = dx/gip,
            x3 = points[ep][0] - Math.sqrt(x*x*3/4)*cosa,
            y3 = points[ep][1] - Math.sqrt(x*x*3/4)*sina,
            x6 = points[ep][0] - Math.sqrt(x*x*3)*cosa,
            y6 = points[ep][1] - Math.sqrt(x*x*3)*sina,
            x4 = x3 + x * sina/2,
            y4 = y3 - x * cosa/2,
            x5 = x3 - x * sina/2,
            y5 = y3 + x * cosa/2;
			
			// Return SVG descriptor
			if (isSvg) {
				var desc = '<polyline points="';
				var comma = '';
				for (var t=0; t < ep; ++t) {
				  desc += comma + points[t][0] + ' ' + points[t][1];
				  comma = ', ';
				}
				desc += '"/>';
				desc += '<polyline fill="black" points="' + points[ep-1][0] + ' ' + points[ep-1][1] + ',' + x6 + ' ' +y6 
                        + ',' + x4 + ' '+ y4 + ','  + points[ep][0] + ' ' + points[ep][1] + ',' + x5 + ' ' +y5 + ',' + x6 + ' ' +y6 + '"/>';
				return desc;
			}

            context2.beginPath();
            context2.fillStyle = color;
            context2.strokeStyle = color;
            context2.moveTo(points[0][0], points[0][1]);
            for (i=1; i<ep; ++i) {
              context2.lineTo(points[i][0], points[i][1]);
            }
            context2.stroke();
            context2.closePath();

            context2.beginPath();
            context2.fillStyle = color;
            context2.strokeStyle = color;
            context2.moveTo(points[ep-1][0], points[ep-1][1]);
            context2.lineTo(x6, y6);
            context2.lineTo(x4, y4);
            context2.lineTo(points[ep][0], points[ep][1]);
            context2.lineTo(x5, y5);
            context2.lineTo(x6, y6);
            context2.fill();
            context2.stroke();
            context2.closePath();




            
    }
    });
//@aspect
})(jQuery, dm);

/*
Class: realization

Realization connector creates a connection beween two elements of diagram

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

dm.base.diagram("cs.realization", dm.cs['connector'], {
    dashedLine: function(p1,p2, c) {
      var x2 = p2[0],
      x1 = p1[0],
      y2 = p2[1],
      y1 = p1[1];

      var x = 10, // dash length
      dashf = 5,
      dashe = 3,
      dx = x2 -x1,
      dy = y2 -y1,
      gip = Math.sqrt(dx*dx + dy*dy);

      if (gip<x) // Nothing to draw
         return;

      var sina = dy/gip,
      cosa = dx/gip,
      fx = dashf * cosa,
      fy = dashf * sina,
      ex = dashe * cosa,
      ey = dashe * sina;

      for (i=0; i<(gip/(dashf + dashe)); ++i) {
        c.moveTo(x1, y1);
        c.lineTo(x1+fx, y1+fy);
        x1+= (ex + fx);
        y1+= (ey + fy);
      }
    
    },
    'draw': function(c, points, color, isSvg) {
            if ((points == null) || (points.length < 2)) {
               return;
            }

            var ep = points.length-1;
            var x2 = points[ep][0],
            x1 = points[ep-1][0],
            y2 = points[ep][1],
            y1 = points[ep-1][1];

            var x = 10,
                dx = x2 -x1,
                dy = y2 -y1,
                gip = Math.sqrt(dx*dx + dy*dy);

            var sina = dy/gip,
            cosa = dx/gip,
            x3 = x2 - Math.sqrt(x*x*3/4)*cosa,
            y3 = y2 - Math.sqrt(x*x*3/4)*sina,
            x6 = x1 - Math.sqrt(x*x*3)*cosa,
            y6 = y1 - Math.sqrt(x*x*3)*sina,
            x4 = x3 + x * sina/2,
            y4 = y3 - x * cosa/2,
            x5 = x3 - x * sina/2,
            y5 = y3 + x * cosa/2;
			// Return SVG connector's group
			if (isSvg) {
				var desc = '<polyline stroke-dasharray="7 3" points="';
				var comma = '';
				for (var t=0; t < ep; ++t) {
				  desc += comma + points[t][0] + ' ' + points[t][1];
				  comma = ', ';
				}
				desc += '"/>';
				desc += '<polyline stroke-dasharray="7 3" points="' + points[ep-1][0] + ' ' + points[ep-1][1] + ','
				        + points[ep][0] + ' ' + points[ep][1] + '"/>';
                desc += '<polyline fill="white" points="' + x4 + ' ' +y4 + ',' + x2 + ' ' +y2 + ',' + x5 + ' ' +y5+ ','  + x4 + ' ' +y4 +'"/>';
				return desc;
			}

            c.beginPath();
            c.fillStyle = color;
            c.strokeStyle = color;

            for (var i=0; i<points.length-1; ++i) {
              this.dashedLine(points[i], points[i+1], c);
            }
            if (gip<x) {
                 c.stroke();
              c.closePath();
              return;
            }

            c.moveTo(x3, y3);
            c.lineTo(x4, y4);
            c.lineTo(x2, y2);
            c.lineTo(x5, y5);
            c.lineTo(x3, y3);
            c.stroke();
            c.closePath();
    }
    });
//@aspect
})(jQuery, dm);

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

dm.base.diagram("cs.arc", dm.cs['connector'], {
    'draw': function(context2, points, color) {
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
            x3 = points[ep][0], // - Math.sqrt(x*x*3/4)*cosa,
            y3 = points[ep][1], // - Math.sqrt(x*x*3/4)*sina,
            x6 = points[ep][0] - x*cosa,
            y6 = points[ep][1] - x*sina;
            
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

			context2.beginPath();            
			asin = Math.acos(sina);
			if (cosa > 0) asin = -asin; // Keep the direction !!!
			context2.arc(x3, y3, x, asin, asin + Math.PI , true);

            context2.stroke();
            //context2.closePath();
        
    }
    });
//@aspect
})(jQuery, dm);

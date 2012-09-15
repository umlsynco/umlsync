/*
Class: dependency

Dependency connector creates a connection beween two elements of diagram

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

dm.base.diagram("cs.onetoone", dm.cs.connector, {
    'draw': function(c, points, color) {
            if ((points == null) || (points.length < 2)) {
               return;
            }

            var col = "rgba(0,0,0,1)";
            if (color != undefined)
               col = color;

            var x2 = points[1][0],
            x1 = points[0][0],
            y2 = points[1][1],
            y1 = points[0][1];

            var x = 10,
                dashf = 5,
                dashe = 3,
                dx = x2 -x1,
                dy = y2 -y1,
                gip = Math.sqrt(dx*dx + dy*dy);

            if (gip<x)
               return;

            var sina = dy/gip,
            cosa = dx/gip,
            x3 = x2 - Math.sqrt(x*x*3/4)*cosa,
            y3 = y2 - Math.sqrt(x*x*3/4)*sina,
            x6 = x1 - Math.sqrt(x*x*3)*cosa,
            y6 = y1 - Math.sqrt(x*x*3)*sina,
            x4 = x3 + x * sina/2,
            y4 = y3 - x * cosa/2,
            x5 = x3 - x * sina/2,
            y5 = y3 + x * cosa/2,
            x6 = x1 + Math.sqrt(x*x*3/4)*cosa - x * sina/2,
            y6 = y1 + Math.sqrt(x*x*3/4)*sina + x * cosa/2,
            x7 = x1 + Math.sqrt(x*x*3/4)*cosa + x * sina/2,
            y7 = y1 + Math.sqrt(x*x*3/4)*sina - x * cosa/2,
            fx = dashf * cosa,
            fy = dashf * sina,
            ex = dashe * cosa,
            ey = dashe * sina;
            
            
            c.beginPath();
            c.fillStyle = col;
            c.strokeStyle = col;

            for (i=0; i<(gip/(dashf + dashe)); ++i) {
              c.moveTo(x1, y1);
              c.lineTo(x1+fx, y1+fy);
              x1+= (ex + fx);
              y1+= (ey + fy);
            }
            c.moveTo(x4, y4);
            c.lineTo(x5, y5);
            c.moveTo(x6, y6);
            c.lineTo(x7, y7);
            c.stroke();
            c.closePath();            
    }
    });
//@aspect
})(jQuery, dm);

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

dm.base.diagram("cs.manytomany", dm.cs.connector, {
    'dashedLine': function(p1,p2, c) {
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

            var x = 15,
                dx = x2 -x1,
                dy = y2 -y1,
                gip = Math.sqrt(dx*dx + dy*dy);

            if (gip<x)
               return;

            var sina = dy/gip,
            cosa = dx/gip,
            x3 = x2 - Math.sqrt(x*x*3/4)*cosa,
            y3 = y2 - Math.sqrt(x*x*3/4)*sina,

            x31 = x2 - Math.sqrt(x*x/3)*cosa,
            y31 = y2 - Math.sqrt(x*x/3)*sina,
            x32 = x2 - Math.sqrt(x*x*4/3)*cosa,
            y32 = y2 - Math.sqrt(x*x*4/3)*sina,

            x4 = x2 + x * sina/2,
            y4 = y2 - x * cosa/2,
            x5 = x2 - x * sina/2,
            y5 = y2 + x * cosa/2,

            x6 = x1 + Math.sqrt(x*x*3/4)*cosa - x * sina/2,
            y6 = y1 + Math.sqrt(x*x*3/4)*sina + x * cosa/2,
            x7 = x1 + Math.sqrt(x*x*3/4)*cosa + x * sina/2,
            y7 = y1 + Math.sqrt(x*x*3/4)*sina - x * cosa/2;
            
            c.beginPath();
            c.fillStyle = "rgba(255,255,255,1)";
            c.strokeStyle = col;


            c.moveTo(x1, y1);
            c.lineTo(x32,y32);

            c.moveTo(x31, y31);
            c.lineTo(x2, y2);
            c.moveTo(x31, y31);
            c.lineTo(x4, y4);
            c.moveTo(x31, y31);
            c.lineTo(x5, y5);
            c.moveTo(x3, y3);
            c.arc(x3,y3, x/3, 0, Math.PI * 2, true);
            c.fill();
            c.moveTo(x6, y6);
            c.lineTo(x7, y7);
            c.stroke();
            c.closePath();
    }
    });
//@aspect
})(jQuery, dm);

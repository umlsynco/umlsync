/*
Class: Anchor

Anchor  connector creates a connection between two elements of diagram

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2011 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  umlsync.org/about

Version:
  2.0.0 (2012-07-12)
 */

(function($, dm, undefined) {
    dm = dm || {};
    dm.cs = dm.cs || {};

    dm.base.diagram("cs.anchor", dm.cs.connector, {
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
    draw: function(c, points, color) {
        if ((points == null) || (points.length < 2)) {
            return;
        }


        for (var i=0; i<points.length-1; ++i) {
            c.beginPath();
            c.fillStyle = color;
            c.strokeStyle = color;

            this.dashedLine(points[i], points[i+1], c);
            c.stroke();
            c.closePath();      
            //c.arc(points[i][0], points[i][1], 3, 0, Math.PI * 2, true);
        }
    }
    });

})(jQuery, dm);

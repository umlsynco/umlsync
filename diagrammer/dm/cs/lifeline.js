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

(function($, dm, undefined) {
dm = dm || {};
dm.cs = dm.cs || {};

dm.base.diagram("cs.lifeline", dm.cs.connector, {
    draw: function(context2, points, color) {
            if ((points == null) || (points.length < 2)) {
               return;
            }
            var ep = points.length-1;
            context2.beginPath();
            context2.fillStyle = color;
            context2.strokeStyle = color;
            context2.moveTo(points[0][0], points[0][1]);
            for (var i=1; i<=ep; ++i) {
              context2.lineTo(points[i][0], points[i][1]);
            }
            context2.stroke();
            context2.closePath();
    },
    _init: function() {

      var p11 = $('#'+ this.options.fromId + "_Border").position();
      if (!p11) {
         alert("Not found " + this.options.fromId);
         return;
      }

      var w = $('#'+ this.options.fromId + "_Border").width(),
          h = $('#'+ this.options.fromId + "_Border").height();
      this.epoints[0] = [];
      this.epoints[0][0] = p11.left + w/2; //this.dleft;
      this.epoints[0][1] = p11.top + h; //this.dtop;
      
    },
    _getConnectionPoints: function(fromId, toId, epoints) {
       if (fromId != toId)
         alert("SELF-CONNECTION suppose the same source and destination element");
       //alert(" Get connection points: " + fromId + "  " + toId);

      var p11 = $('#'+ fromId + "_Border").position();
      if (!p11) {
        // alert("Not found " + fromId);
         return;
      }

      var w = $('#'+ fromId + "_Border").width(),
          h = $('#'+ this.options.fromId + "_Border").height();
      this.epoints[0] = [];
      this.epoints[0][0] = p11.left + w/2; //this.dleft;
      this.epoints[0][1] = p11.top + h; //this.dtop;

      for (i=0;i<epoints.length;++i) {
         this.epoints[i][0] = p11.left + w/2 + 13;
      }
      

       var p1 = $('#'+ fromId).position();
       var p2 = p1;
       
       var p11 = $('#'+ fromId + "_Border").position();
       var p21 = p11;
       var scrollTop = $("#" + this.parrent.id).scrollTop(),
           scrollLeft = $("#" + this.parrent.id).scrollLeft();

       if ((epoints == undefined) || (epoints.length ==0)) {
         var x1 = this._getRValue(p1.left + p11.left, p2.left + p21.left, $('#'+ fromId).width()) ;
         var y1 = this._getRValue(p1.top + p11.top, p2.top + p21.top, $('#'+ fromId + "_NEXT").height()) ;
         var x2 = this._getRValue(p2.left + p21.left, p1.left + p11.left, $('#' + toId).width());
         var y2 = this._getRValue(p2.top + p21.top, p1.top + p11.top,  $('#' + toId + "_NEXT").height());
         var newpoints = [[x1 + scrollLeft,y1 + scrollTop], [x2 + scrollLeft,y2 + scrollTop]];
        return newpoints;
       }
       else {
         var lln = epoints.length -1;
         var x1 = this._getRValue(p1.left + p11.left, epoints[0][0], $('#'+ fromId).width()) ;
         var y1 = this._getRValue(p1.top + p11.top, epoints[0][1], $('#'+ fromId+"_NEXT").height()) ;

         var x2 = this._getRValue(p2.left + p21.left, epoints[lln][0], $('#' + toId).width());
         var y2 = this._getRValue(p2.top + p21.top, epoints[lln][1], $('#' + toId + "_NEXT").height());

/*         var x1 = p1.left + p11.left;
         var y1 = p1.top + p11.top;

         var x2 = p2.left + p21.left;
         var y2 = p2.top + p21.top;
*/      
        var newpoints = [];
        newpoints[0] = [x1 + scrollLeft,y1 + scrollTop];
        for (i=1;i<=epoints.length;++i) {
          newpoints[i] = epoints[i-1];          
        }
        newpoints[epoints.length + 1] = [x2 + scrollLeft,y2 + scrollTop];
        return newpoints;
       }
    },
    _showMenu: function(x,y, flag, c) {
       if (flag) {
         this.parrent.menuIcon.Show(this.from, x, y);
       } else {
        // this.parrent.menuIcon.Hide(this.from, x, y);
       }
    },
    isPointOnLine: function() {
        return false;
    }
    });
})(jQuery, dm);

/*
Class: self call of port element on sequence diagram

Generalization connector creates a connection beween two elements of diagram

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

dm.base.diagram("cs.llselfcall", dm.cs.connector, {
    'draw': function(c, points, color) {
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

            if (gip<x) {
               return;
            }

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
            
            c.beginPath();
            c.fillStyle = color;
            c.strokeStyle = color;
            c.moveTo(points[0][0], points[0][1]);
            for (i=1; i<ep; ++i) {
              c.lineTo(points[i][0], points[i][1]);
            }
            c.moveTo(x1, y1);
            c.lineTo(x3, y3);
            c.lineTo(x4, y4);
            c.lineTo(x2, y2);
            c.lineTo(x5, y5);
            c.lineTo(x3, y3);
            /*if ((this.epoints != undefined) && (this.epoints.length >0)) {
              for (i=0; i<this.epoints.length;++i)
              c.arc(this.epoints[i][0], this.epoints[i][1], 3, 0, Math.PI * 2, true);
            }*/
            c.stroke();
            c.closePath();            
    },
    '_init': function() {
      var p11 = $('#'+ this.from + "_Border").position();
      if (!p11) {
         alert("Not found " + this.from);
         return;
      }
      var self = this, con = this, par = this.parrent;

      /*this.parrent.Element("llport",
             {left: p11.left + 10, top: p11.top + 20, "menu":this.options["menu"], level:this.parrent.elements[this.from].options.level+1},
                function(element) {
                  var ui = {};
                  element.drop_parent = self.euid;
                  ui.position = $("#" + element.euid+"_Border").position();
                  par._dropElement(element, ui);
                  // perform some action on completion
                   con.toId = element.euid;
                  con.options.toId = element.euid;
                  self.parrent.draw();
             });
      */

      this.dleft = 40;
      this.dtop = 20;
      this.dright = 20;
      
      if (this.toId == "ConnectionHelper") {
        $.log("POS1");
        var pos = $("#ConnectionHelper_Border").position();
        $.log("POS IS 2: " + pos );
        this.epoints[0] = [[pos.left,pos.top]];
      } else {
        var el = $("#"+this.toId+"_Border");
        var pos = el.position();
        this.epoints[0] = [[pos.left+el.width()*3,pos.top-20]];
      }
    },
    '_getConnectionPoints': function(fromId, toId, epoints) {
      var $el = $('#'+ fromId + "_Border");
      var $el2 = $('#'+ toId + "_Border");
      var p11 = $el.position(),
          p21 = $el2.position(),
          ew = $el.width(),
          eh = $el.height();

      if (!p11) {
         alert("Not found " + this.from);
         return;
      }

      var newpoints = [];
      if (toId == "ConnectionHelper") {
        var pos = $("#ConnectionHelper_Border").position();
        newpoints[0] = [p11.left + ew, pos.top];
        newpoints[1] = [pos.left, pos.top];
        newpoints[2] = [pos.left, pos.top+10];
        newpoints[3] = [p11.left + ew, pos.top+10];
        return newpoints;
      } else {
	    var scrollLeft = $("#" + this.parrent.euid).scrollLeft();
		var scrollTop = $("#" + this.parrent.euid).scrollTop();
        var top = (this.epoints[0][1] - scrollTop > p21.top-10) ? p21.top-10: this.epoints[0][1] - scrollTop;
        newpoints[0] = [p11.left + ew + 3, top];
        newpoints[1] = [this.epoints[0][0] - scrollLeft, top];
        newpoints[2] = [this.epoints[0][0] - scrollLeft, p21.top+5];
        newpoints[3] = [p21.left + $el2.width() + 6, p21.top+5];
        return newpoints;
      }
    },
    'getAutocomplete': function() {
        if (this.parrent == undefined)
          return null;

        if (this.parrent.elements[this.toId]
         && this.parrent.elements[this.toId].getAutocomplete)
         return this.parrent.elements[this.toId].getAutocomplete();
        return null;
    },
    '_updateEPoints': function(ui) {
      if (this.epoints && this.epoints.legth > 0)
        this.epoints = [[ui.position.left, ui.position.top]];
      else 
        this.epoints = [[ui.position.left, ui.position.top+5]]; // LLPort should be created on the same ui position threfore we have to shift extra point. But it is required for a first time only !!!
      this.cleanOnNextTransform = true;
      this.eppos = 0; // extra point position. Uses for temporary points which should be removed on next transform.
    },
    'addLable': function(text, x, y) {
      var self = this;
      this.lables.push($("<div style=\"position:absolute;z-index:99999;\">" + text + "</div>").appendTo("#" + this.parrent.euid)
      .css("left", x).css("top", y)
      .draggable().editable({onAutocomplete:function() { return self.getAutocomplete() }}));
    }
    });

//@aspect
})(jQuery, dm);

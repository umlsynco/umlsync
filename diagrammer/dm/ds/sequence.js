/*
Class: Extension for sequence diagrams specific.

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2012 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  umlsync.org/about

Version:
  2.0.0 (2012-07-12)
*/
//@aspect
(function( $, dm, undefined ) {
dm.base.diagram("ds.sequence", dm.ds.base, {
    'onDragStart': function(el, ui, isConnector) {
     if (isConnector) {
         $.log("onDragStart");
         // If from has only one connector
         var single = true;
         for (i in this.connectors)
           if ((this.connectors[i] != el) &&
             ((this.connectors[i].from == el.from)
               || (this.connectors[i].toId == el.from))) {
                   single = false;
               $.log("FOUND: " + this.connectors[i].euid);
               break; // element has one more connector. Could not be moved.
               }

         if (single) {
             $.log("also: " + el.from);
           this.elements[el.from].onDragStart(ui);
         }
           
         // if to element has only one connector
         single = true;
         for (i in this.connectors)
           if ((this.connectors[i] != el) &&
             ((this.connectors[i].from == el.toId)
               || (this.connectors[i].toId == el.toId))) {
                   single = false;
               break; // element has one more connector. Could not be moved.
               }
         if (single)
           this.elements[el.toId].onDragStart(ui);
         $.log("onDragStart end");
     }
     else {
         var skip_objects = false;
         if (el.option("type") == "llport") {
             ui.left = 0;
             skip_objects = true;
         } else {
             ui.top = 0;
         }

        el.onDragStart(ui, true);

        if (this.multipleSelection)
          for (i in this.elements) {
            if (this.elements[i] != el
              && this.elements[i].option("selected")
              && (!skip_objects || this.elements[i].option("type") == "llport")
              && this.elements[i].option("dragStart") == undefined) {
                  this.elements[i].onDragStart(ui);
            }
          }

        for (i in this.connectors) 
          if (this.elements[this.connectors[i].from].option("dragStart")
            || this.elements[this.connectors[i].toId].option("dragStart"))
            this.connectors[i].onDragStart(ui);
        
        if (skip_objects)
        for (i in this.connectors) {
          var f = this.elements[this.connectors[i].from].option("dragStart"),
            t = this.elements[this.connectors[i].toId].option("dragStart"); 
          if (f && !t) {
              var dp = true; // drag possible
              for (j in this.connectors)
                if (!this.connectors[j].option("dragStart")
                  && (this.connectors[j].from == this.connectors[i].toId
                      || this.connectors[j].from == this.connectors[i].toId))
                      dp = false; // some of the connectors goes to another element                      
              if (dp)
                this.elements[this.connectors[i].toId].onDragStart(ui);
          }
          else if (!f && t) {
              var dp = true; // drag possible
              for (j in this.connectors)
                if (!this.connectors[j].option("dragStart")
                  && (this.connectors[j].from == this.connectors[i].from
                      || this.connectors[j].from == this.connectors[i].from))
                      dp = false; // some of the connectors goes to another element
              if (dp)
                this.elements[this.connectors[i].from].onDragStart(ui);
          }
        }
        }
    },
    'onDragMove': function(el, ui, isConnector) {
        if (!isConnector)
         if (el.option("type") == "llport") {
//             $.log("LEFT IS 0 != " + ui.left);
             ui.left = 0;
         } else {
//             $.log("TOP IS 0 !=" + ui.top);
             ui.top = 0;
         }
      for (i in this.elements)
        if (this.elements[i].option("dragStart") != undefined
          && (isConnector || this.elements[i] != el))
          this.elements[i].onDragMove(ui);
      for (i in this.connectors)
        if (this.connectors[i].option("dragStart")
          && ((!isConnector) || (this.connectors[i] != el)))
          this.connectors[i].onDragMove(ui);
    },
    'onDragStop': function(el, ui, isConnector) {
      if (!isConnector)
         if (el.option("type") == "llport") {
             ui.left = 0;
         } else {
             ui.top = 0;
         }
      if (!isConnector)
          el.onDragStop();

      for (i in this.elements)
        if (this.elements[i].option("dragStart") != undefined
          && this.elements[i] != el)
          this.elements[i].onDragStop(ui);

      for (i in this.connectors)
        if (this.connectors[i].option("dragStart"))
          this.connectors[i].onDragStop(ui);
    }
});
//@aspect
})(jQuery, dm);

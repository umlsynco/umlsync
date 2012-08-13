/*
Class: tabbed

Tabbed diagram handler

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2011 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  TBD

Version:
  1.0.0 (2011-06-08)
*/


(function($, dm, undefined) {
dm = dm || {};
dm.hs = dm.hs || {};

dm.hs.tabbed = function(loader, options) {
  $.extend(true, this.options, options);
  this.counter = 0;
  this.loader = loader;
}

dm.hs.tabbed.prototype = {
   options: {
      tabPrefix:"diag",
      tabs:"tabs"
   },
   checkDiagramName: function(name) {
      var foundName = false;
      $('#' + this.options.tabs + ' ul li a').each(function(i) {
         if (this.text == name) {
           foundName = true;
         }
      });
      return !foundName;
   },
   addDiagram: function(baseType, type, name, options) {
      var tabname = "#"+ this.options.tabPrefix + "-" + this.counter;
      this.counter++;
      $("#" + this.options.tabs).tabs("add", tabname, name);
      this.loader.Diagram(type, baseType, {editable:true, name: name, type: type}, tabname);
   },
   loadDiagram: function(path) {
      var self = this;
      
      $.getJSON(path,  function(json) {
        if (json) {
          var tabname = "#"+ self.options.tabPrefix + "-" + self.counter;
          self.counter++;
$.struct = json;
          $("#" + self.options.tabs).tabs("add", tabname, json.name);

          self.loader.Diagram(json.type, "base", json, tabname);

        } else {
          alert("Failed to load: " + path);
        }
        $("#" + self.options.tabs).tabs("select", tabname);
      });
   }
}

})(jQuery, dm);

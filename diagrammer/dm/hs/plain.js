/*
Class: plain handler

Views and diagrams handler. 
it is required header, content and bottom options to make it resizeable

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2012 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  http://umlsync.org

Version:
  1.0.0 (2012-03-21)
*/


(function($, dm, undefined) {
dm = dm || {};
dm.hs = dm.hs || {};

dm.hs.plain = function(loader, options) {
  $.extend(true, this.options, options);
  this.counter = 0;
  this.loader = loader;
  loader.hs = this;

  // Think about field set 
  $("#" + this.options.content).append('\
      <div id="framework" width="100%" height="100%">\
         <div id="tabs"><ul></ul></div>\
    </div>');

    // #9 #10 # 55 are based on margin and padding of element
    // they should be replaced on valid values
    var self = this;
/*
    var $tabs = $("#tabs").tabs( {tabTemplate: '<li><a href="#{href}"><span>#{label}</span></a><a class="ui-corner-all"><span class="ui-test ui-icon ui-icon-close"></span></a></li>',
    add: function(event, ui) {
        $tabs.tabs('select', '#' + ui.panel.id);
    },
    select: function(event, ui) {
      if (self.loader.hs.diagrams)
        self.loader.selectedDiagram = self.loader.hs.diagrams["#" + ui.panel.id];
    }
    });*/

    $('#tabs span.ui-test').live('click', function() {
        var index = $('li',$("#tabs")).index($(this).parent());
        $("#tabs").tabs('remove', index);
    });
};

dm.hs.plain.prototype = {
   options: {
      tabRight:"diag",
      tabs:"tabs",
      content:"content"
   },
   loadDiagram: function(path) {
      var self = this;
      $.getJSON(path,  function(json) {
          $.log("LOADED " + json.name);
        var tabname = "#"+ self.options.tabRight + "-" + self.counter;
        self.counter++;
        $.struct = json;
        $("#" + self.options.tabs).tabs("add", tabname, json.name);
        self.loader.Diagram(json.type, "base", json, "body");//tabname);
      }).fail(function(x1,x2,x3) {alert("FAILED: " + x1.status + x2 + x3);});
   },
   loadCode: function(url, name) {
     var tabname = "#"+ this.options.tabRight + "-" + this.counter;
     this.counter++;
     $("#tabs").tabs('add', tabname, name);
     $(tabname).load(url);
   },  
};

})(jQuery, dm);

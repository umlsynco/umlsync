/*
Class: vp

Main menu for diagram loading in a Visual-Paradigm style

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2012 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  http://umlsync.org

Version:
  2.0.0 (2012-07-17)
 */

//@aspect
(function($, dm, undefined) {

  /*
   * /param url - path to diagrams description JSON
   *   1. Load JSON from URL 
   *  2.  Create an inner HTML code
   *   3. Append to body
   *   4. Apply styles
   *   5. TODO:  How to destroy ?
   *   6. Handle errors
   */

  dm.ms['us'] = function(handler, options) {

    $.extend(true, this.options, options);
    this.handler = handler;
    this.selected = "class";
    // self options
    var so = this.options,
    self = this;

    // 1. Load JSON from url
    handler['LoadMainMenu'](function(data, urlPrefix) {
      var items = [];

      for (var i in data) {
        var image = (data[i]['image'][0][so['image']] != undefined) ? "list-style-image:url(\'"+ urlPrefix + data[i]['image'][0][so['image']] + "\')" : "list-style-type:none";
        items.push('<li class="diagramSelector" style="cursor:pointer;' + image + ';" id="'  + data[i]['diagram'] +'">' +
        data[i]['description'] + '</li>');
      }

      var innerHtml = items.join('');
      innerHtml = '<form>\
        <fieldset><div id="vp_main_menu34" style="scroll:auto;height:40px;"><ul>' + innerHtml + '</ul></div>\
        <p><label class="left" for="name">Name:</label><span class="left2"><input id="VP_inputselector" type="text" value="/Untitled" maxlength="256" pattern="[a-zA-Z ]{5,}" name="name"/></span>\
        </p></fieldset></form>';
      $("<div id='vp_main_menu' title='Creating new diagram'></div>").appendTo('body');
      $(innerHtml).appendTo("#vp_main_menu");

      $( "#vp_main_menu" ).dialog({
        'autoOpen': true,
//        minHeight: 430,
        'minWidth': 350,
        'modal': true,
        'buttons': {
          "Create": function() {
            var diagram_name = $("#vp_main_menu input").val(),
            fullname = diagram_name;
            if (diagram_name != '') {
              if (!self.handler['checkDiagramName'](diagram_name)) {
                diagram_name += "(2)";
              }
              var sp = diagram_name.split("/");
              if (sp.length > 1)
                diagram_name = sp[sp.length-1];
              self.handler['addDiagram']("base", self.selected, diagram_name, {'fullname': fullname, 'viewid': $("#vp_main_menu select").val()});
            }
            $(this).dialog("close");
          },
          'Cancel': function() {
            $(this).dialog("close");
          }
        },
        //FIXME: is this needed?
        close: function() {
          //allFields.val( "" ).removeClass( "ui-state-error" );
        }
      });

      $("#vp_main_menu select").change(function() {
        var folder = handler.views[$(this).val()].active || "/";
        var val = $("#vp_main_menu input").val();
        val.substr(val.lastIndexOf('/'))
        $("#vp_main_menu input").val(folder + val.substr(val.lastIndexOf('/')));
      });

      $(".diagramSelector").click(function() {
        self.selected = this.id;
        $(".diagramSelector").css("background-color","#eee").css("color", "#000");
        $(this).css("background-color","#5D689A").css("color", "#fff");
        var val = $("#vp_main_menu input").val();
        $("#vp_main_menu input").val(val.substr(0, val.lastIndexOf('/') + 1) + this.id + "Diagram"); 
        //  $("#vp_main_menu .finish").css("background-color","#5D689A").css("cursor","pointer");
      });
    }//call back function
    );
  };

  dm.ms['us'].prototype = {
      'options': {
        'image': "small",
        'url': "dm/ms/us/main.json",
        'id': "ListDiagramMenu"
      }
  };
//@aspect
})(jQuery, dm);

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

  dm.ms['dg'] = function(handler, options) {
    this.handler = handler;
    this.selected = "class";

    // list of modal dialogs
    this.dialogs = new Array();
    // status of modal dialogs
    this.status = new Array();
    this.callback = new Array();
  };


  dm.ms['dg'].prototype = 
  {
   'options': {
    'image': "small",
    'id': "ListDiagramMenu"
  },
  'Activate': function(name, callback) {
    if (!name)
      return;
    this.status[name] = true; // active dialog. It is possible to activate dialog before it's creation. in that case it will be shown on creation.
    this.callback[name] = callback;
    if (name == "new-diagram-dialog") {
      //var vs = this.handler.getAvailableViews();
      var av = this.handler.getActiveView();
      if (av) {
        $("#selectale-views input").each(function(d) { if(this.value == av.euid) this.checked = true;});
        $("#new-diagram-dialog input#VP_inputselector").val(av.getActivePath() + "/");
      }
    }

    $( "#" + name ).dialog( "open" );
  },
  'NewDiagramDialog':function(data) {

    var innerHtml = '<form id="us-dialog-newdiagram">\
      <fieldset><div id="selectable-list" style="scroll:auto;height:40px;"><ul id="diagram-menu"></ul></div>\
      <div id="selectale-views"><input style="margin-top:10px;" type="radio" name=view value="Github" checked=true>GitHub&nbsp\
      <input style="margin-top:10px;" type="radio" name=view value="Github">GitHub Gist&nbsp\
      <input type="radio" name=view value="pe" disabled>Eclipse</div>\
      <p><label class="left" for="name">Name:</label><span class="left2"><input id="VP_inputselector" type="text" value="/Untitled" maxlength="256" pattern="[a-zA-Z ]{5,}" name="name"/></span>\
      </p></fieldset></form>';
      $("<div id='new-diagram-dialog' title='Creating new diagram'></div>").appendTo('body');
      $(innerHtml).appendTo("#new-diagram-dialog");

      var self = this;
      $("#diagram-menu").listmenu({
        selector: "diagram-selector",
        selectable: true,
        urlPrefix: dm.dm.loader.getUrl(),
        data:data,
        onSelect: function(item) {
        self.selected = item.id;
        var val = $("#new-diagram-dialog input#VP_inputselector").val();
        $("#new-diagram-dialog input#VP_inputselector").val(val.substr(0, val.lastIndexOf('/') + 1) + item.id + "Diagram");
      }
      });

      $( "#new-diagram-dialog" ).dialog({
        'autoOpen': true,
        'minWidth': 350,
        'modal': true,
        'buttons': {
        "Create": function() {
        var diagram_name = $("#new-diagram-dialog input#VP_inputselector").val(),
        fullname = diagram_name;
        if (diagram_name != '') {
          if (!self.handler['checkDiagramName'](diagram_name)) {
            diagram_name += "(2)";
          }
          var sp = diagram_name.split("/");
          if (sp.length > 1)
            diagram_name = sp[sp.length-1];
          var vid = $('#us-dialog-newdiagram #selectale-views input[name=view]:checked').val();
          self.handler['addDiagram']("base", self.selected, diagram_name, {'fullname': fullname, 'viewid': vid});
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

      $("#new-diagram-dialog select").change(function() {
        var folder = handler.views[$(this).val()].active || "/";
        var val = $("#new-diagram-dialog input").val();
        val.substr(val.lastIndexOf('/'))
        $("#new-diagram-dialog input").val(folder + val.substr(val.lastIndexOf('/')));
      });

      $("#new-diagram-dialog .diagramSelector").click(function() {
        self.selected = this.id;
        $(".diagramSelector").removeClass('selected');

        $(this).addClass('selected');

        var val = $("#new-diagram-dialog input").val();
        $("#new-diagram-dialog input").val(val.substr(0, val.lastIndexOf('/') + 1) + this.id + "Diagram");
        //  $("#vp_main_menu .finish").css("background-color","#5D689A").css("cursor","pointer");
      }).hover(function () {
        $(this).addClass('hover');
      }, function () {
        $(this).removeClass('hover');
      });
  },
  'SelectRepoDialog': function(data, callback) {
    var items = [];

    for (var i in data) {
      var name = data[i]['name'],
      pr = (data[i]['private']) ? "Private: ":"Public: ";
      items.push('<li class="diagramSelector" style="cursor:pointer;" id="'  + name +'" url="'+ data[i]['url'] +'">' + pr +  data[i]['full_name'] + '</li>');
    }

    var innerHtml = items.join('');
    innerHtml = '<form>\
      <fieldset><div id="selectable-list" style="scroll:auto;height:40px;"><ul>' + innerHtml + '</ul></div>\
      </fieldset></form>';
      $("<div id='repo-selection-dialog' title='Repository selection'></div>").appendTo('body');
      $(innerHtml).appendTo("#repo-selection-dialog");

      $( "#repo-selection-dialog" ).dialog(
	  {
        'autoOpen': true,
        'minWidth': 350,
        'modal': true,
        'buttons': {
          "Create": function() {
            var rep = self.selected;
            if (callback)
              callback(rep);

            $(this).dialog("close");
          },
          'Cancel': function() {
            $(this).dialog("close");
          }
        },
        'close': function() {
        }
      }
	  );

      $(".diagramSelector").click(function() {
        self.selected = $(this).attr('url');
        $(".diagramSelector").css("background-color","#eee").css("color", "#000");
        $(this).css("background-color","#5D689A").css("color", "#fff");
      });
  },
  'SaveDiagramDialog':function(){

  },
  'NewFolder': function(callback) {
    var innerHtml = '<p id="dl-validation-tip" style="color:red;"></p><form>\<fieldset>\
      <div style="display:inline;"><label for="name">Name:</label>\
      <input type="text" name="name" id="name" class="text ui-widget-content ui-corner-all" /></div>\
      </fieldset>\
      </form>';
      var self = this;
      $('<div id="new-project-dialog" title="New folder:"></div>').appendTo('body');
      $(innerHtml).appendTo("#new-project-dialog");
      $("#new-project-dialog").dialog({
        autoOpen: false,
        height: 154,
        width: 350,
        modal: true,
        buttons: {
        "Create": function() {
        var val = $("#new-project-dialog input").val();
        if ((val != "") && (val.indexOf("/"))) {
          if (self.callback && self.callback["new-project-dialog"]) {
            self.callback["new-project-dialog"](val);
          }
          $( this ).dialog( "close" );
        } else {
          $("#new-project-dialog #dl-validation-tip").text("Wrong name !!!");
        }
      },
      Cancel: function() {
        $( this ).dialog( "close" );
      }
      },
      close: function() {
        $("#new-project-dialog input").val("");
        $("#new-project-dialog #dl-validation-tip").text("");
      }
      });
  },
  'CommitDataDialog':function(data, commit_callback){
    var items = [];
    for (var d in data) {
      items.push('<tr><td> <input type="checkbox" checked/></td><td>' + d + '</td></tr>');
    }

    var innerHtml = items.join('');

    innerHtml = "<div id='list-item'><div><div class='scrollable' style='scroll:auto;'>\
      <table id='us-commit-table' class='tablesorter'><thead><tr class='header'><th></th><th>File path</th></tr></thead><tbody>\
      " + innerHtml + "</tbody></table></div>" +
      "<p><label>Commit message: </label><br>"+
      "<textarea id='us-commit-message' maxlength='300' pattern='[a-zA-Z ]{5,}' style='width:99%;'></textarea></p>" +
      "</div></div>";

      var self = this;
      if ($("#commit-changes-dialog").empty()) {
        $('<div id="commit-changes-dialog" title="Commit data:"></div>').appendTo('body');
      } else {
        // remove the previous values
        $("#commit-changes-dialog #list-item").remove();
      }
      $(innerHtml).appendTo("#commit-changes-dialog");

      var commit_data = data;
      $("#commit-changes-dialog").dialog({
        autoOpen: true,
        height: 254,
        width: 550,
        modal: true,
        buttons: {
        "Commit": function() {
        var commit_items = {};
        var message = $("#us-commit-message").val();
        $("#us-commit-table tr:not(:first)").each(function(idx){
          var raw = $(this);
          var column = raw.children("td");
          var checker = column.children("input");
          if (checker.is(':checked')) {
            var file = raw.children("td:last").text();
            commit_items[file] = commit_data[file];
          }
        });
        $( this ).dialog( "close" );
        commit_callback(message, commit_items);
      },
      Cancel: function() {
        $( this ).dialog( "close" );
      }
      },
      close: function() {
      }
      });

  }
  };
//@aspect
})(jQuery, dm);

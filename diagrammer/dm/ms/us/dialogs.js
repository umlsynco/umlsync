/*
 * Class which contain all dialogs in the framework
 * the main purpose of this class is to avoid
 * dialogs creation in the functional areas.
 * 
 * Copyright: Copyright (c) 2012-2013 UMLSync Inc. All rights reserved.
 * URL: http://umlsync.org/about
 * Last Modified Date: 2013-01-24
 *
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
  //
  // Activate dialog by unique id
  // The major adia was to use some unique names for dialogs
  // but left only HTML id of dialog class
  // params:
  //   name - the HTML id of dialog widget
  //   callback - call on activate comple
  // 
  'Activate': function(name, callback) {
    if (!name)
      return;
    this.status[name] = true; // active dialog. It is possible to activate dialog before it's creation. in that case it will be shown on creation.
    this.callback[name] = callback;

    if ($( "#" + name ).dialog( "isOpen" )) {
      $( "#" + name ).dialog( "close" );
    }
    else {
      $( "#" + name ).dialog( "open" );
    }
  },
  //
  // Dialog which contain all available types of diagrams
  // and input area for diagram name.
  //
  // Returns the control to the Framework::addDiagram with
  // full path to the new diagram.
  //
  'NewDiagramDialog':function(data) {

    var innerHtml = '<form id="us-dialog-newdiagram">\
      <fieldset><div id="selectable-list" style="scroll:auto;"><ul id="diagram-menu"></ul></div>\
      <p><input id="us-new-diagram-dialog-input" type="checkbox" checked="true" class="left" style="margin-top:0px;"/><label class="left" for="name">Name:</label></p><br><p><span class="left2"><input id="VP_inputselector" type="text" value="/Untitled" maxlength="256" pattern="[a-zA-Z ]{5,}" name="name"/></span>\
      </p></fieldset></form>';
      $("<div id='new-diagram-dialog' title='Creating new diagram'></div>").appendTo('body');
      $(innerHtml).appendTo("#new-diagram-dialog");

      $("#us-new-diagram-dialog-input").click(function() {
        if ($(this).is(":checked")) {
          $("#VP_inputselector").attr("disabled", null);
        }
        else {
          $("#VP_inputselector").attr("disabled", "disabled");
        }
      });

      
      var currentStatus = "", currentList = {};
      $("#VP_inputselector")
      .autocomplete(
        {
          source:function(request, response) {
            if (response) {
              var val = $("#new-diagram-dialog input#VP_inputselector").val();
              var newStatus = val.substr(0, val.lastIndexOf('/'));
              var match = val.split("/").pop();

              function getMatch(descr) {
                var retList = new Array();
                for (var t in currentList) {
                    if (currentList[t].indexOf(descr) !== -1) {
                        retList.push(currentStatus + "/" + currentList[t] + "/");
                    }
                }
                return retList;
              }

              // Prevent multiple request of the same paths
              if (currentStatus != newStatus) {
                currentStatus = newStatus;
                dm.dm.fw.getSubPaths(newStatus, function(data) {
                  currentList = data;
                  response(getMatch(match)); // Update search result
                });
              } else {
                response(getMatch(match));
              }
            }
          }
        }
      );
      
      var self = this;
      $("#diagram-menu").listmenu({
        selector: "diagram-selector",
        selectable: true,
        urlPrefix: dm.dm.loader.getUrl(),
        data:data,
        onSelect: function(item)
          {
            self.selected = item.id;
            var val = $("#new-diagram-dialog input#VP_inputselector").val();
            if (item.id != "markdown") {
              $("#new-diagram-dialog input#VP_inputselector").val(val.substr(0, val.lastIndexOf('/') + 1) + item.id + "Diagram");
            }
            else {
              $("#new-diagram-dialog input#VP_inputselector").val(val.substr(0, val.lastIndexOf('/') + 1) + "Document.md");
            }
          }
      });

      $( "#new-diagram-dialog" ).dialog({
        'autoOpen': false,
        'minWidth': 150,
        'modal': true,
        'buttons': {
        "Create": function() {
          var isNamed = $("#us-new-diagram-dialog-input").is(":checked"),
            diagram_name = $("#new-diagram-dialog input#VP_inputselector").val();
         
         // Add file extension for diagram files
         if ((diagram_name.lastIndexOf(".umlsync") != diagram_name.length - 8) && (self.selected != "markdown")) {
           diagram_name = diagram_name + ".umlsync";
         }

         if ((diagram_name.lastIndexOf(".md") != diagram_name.length - 3) && (self.selected == "markdown")) {
           diagram_name = diagram_name + ".md";
         }

          var fullname = diagram_name;
          if (isNamed) {
            // check the name of diagram
            var msg = dm.dm.fw.checkContentName(diagram_name);
            if (msg != "ok") {
              // Can't close the dialog if user has entered wrong name
              alert(msg);
              return;
            }
          }
          else {
            // The default name
            diagram_name = "new " + self.selected;
          }

          var params =
          {
            title:isNamed ? diagram_name.split("/").pop() : diagram_name,
            repoId:dm.dm.fw.getActiveRepository(),
            viewid:dm.dm.fw.getActiveView(),
            branch:dm.dm.fw.getActiveBranch(),
            contentType:"dm",
            editable:true,
            isNewOne: isNamed
          };

          if (isNamed)
            params.absPath = diagram_name;
        if (self.selected != "markdown") {
          dm.dm.fw['addDiagramContent']("base", self.selected, params);
        }
        else {
          dm.dm.fw['addMarkdownContent'](params);
        }
        $(this).dialog("close");
      },
      'Cancel': function() {
        $(this).dialog("close");
      }
      },
      open: function() {
        if ($("#us-new-diagram-dialog-input").is(":checked")) {
          var folder = dm.dm.fw.getActiveTreePath();
          $("#new-diagram-dialog input#VP_inputselector").val(folder);
        }
        var $par = $( "#new-diagram-dialog")
              .parent();
        $par.offset($("#treetabs").offset());
        $par.children("DIV.ui-dialog-titlebar").children("span.ui-dialog-title").children("span").text(dm.dm.fw.getActiveRepository() || "none");
      },
      close: function() {
        //allFields.val( "" ).removeClass( "ui-state-error" );
      }
      });

      //Extending: "Creating new diagram [%repo%]"
      $("#new-diagram-dialog")
      .parent()
      .children("DIV.ui-dialog-titlebar")
      .children("span.ui-dialog-title")
      .append("   [<span></span>]");
      
      // Change the default diagram name in dependency on type 
      $("#new-diagram-dialog select").change(function() {
        var folder = dm.dm.fw.getActiveTreePath();
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
  //
  // Dialog to select repository from different sources.
  // It is consists of tabs and list of repositories
  // For example tabs could be "User repos", "Follow repos", "Stared repos" etc.
  // 
  // params:
  //   title - the title of tab
  //   ISelectObserver - object which has onRepoSelected method that
  //                     should be called on repo selection in "titled" tab
  //   repos - the list of objects with repositories in tab
  //
  'SelectRepoDialog': function(title, ISelectObserver, repos) {
    var self = this;

    function getTabContent(data) {
      var items = [];
      for (var i in data) {
        var name = data[i]['full_name'];
        //pr = "<i>" + (data[i]['private']) ? "Private: ":"Public: </i>" ;
        //items.push('<li class="diagramSelector" style="cursor:pointer;" id="'  + name +'" url="'+ data[i]['url'] +'">' + pr + "<span>" + data[i]['full_name'] + '</span></li>');
        items.push('<li class="diagramSelector" style="cursor:pointer;" id="'  + name +'"><span>' + name + '</span></li>');
      }
      return items.join('');
    }

    var
    tabContent = '<div id="us-'+title+'"><ul>'+getTabContent(repos)+'</ul></div>';

    if ($("#repo-selection-dialog #selectable-list").length == 0) {
      var innerHtml = '<form>\
        <fieldset>\
        <div id="us-search"></div>\
        <div id="selectable-list" style="scroll:auto;">\
        <ul><li><a href="#us-'+title+'">'+title+'</a></li></ul>'
        + tabContent + 
        '</div>\
        </fieldset>\
        </form>';
        $("<div id='repo-selection-dialog' title='Repository selection'></div>").appendTo('body');
        $(innerHtml).appendTo("#repo-selection-dialog");

        $("#repo-selection-dialog #selectable-list").tabs();

        var $dialog = $( "#repo-selection-dialog" ).dialog(
            {
              'autoOpen': false,
              appendTo: '#switcher',
              position: 'left',
              'minWidth': 100,
              'modal': false,
              'minHeight': 20,
              'close': function() {
            },
            open: function( event, ui ) {
              $( "#repo-selection-dialog")
              .parent().offset($("#us-branch").offset());
            }
            }
        );
    }
    else {
      $("#repo-selection-dialog #selectable-list").append(tabContent);
      $("#repo-selection-dialog #selectable-list").tabs("add", "#us-" + title, title);
    }

    $("#us-"+title+" .diagramSelector").click(function() {
      self.selected = $(this).attr('url');
      var text = $(this).children("span").text();
      $("#repo-selection-dialog" ).dialog("close");
      ISelectObserver.onRepoSelect(title, text);
    });
  },
  // Create the branch select dialog for the selected repository and append tabs to it.
  // It should append tab only if dialog already exist
  // params:
  //    title - the title of tab
  //    desc  - description of tab content
  //    repoId- the repository unique id
  //    IBranchSelectObserver - object for callback
  'ChangeBranchDialog': function(title, desc, repoId, IBranchSelectObserver) {
    var self = this;

    function getTabContent(data) {
      var items = [];
      for (var i in data) {
        var name = data[i]['name'];
        items.push('<li class="diagramSelector" style="cursor:pointer;" id="'  + name +'"><span>' + name + '</span></li>');
      }
      return items.join('');
    }

    var tabContent = '<div id="us-'+title+'"><ul>'+getTabContent(desc)+'</ul></div>';

    if ($("#branch-selection-dialog-" + repoId).length == 0) {
      innerHtml = '<form>\
        <fieldset>\
        <div id="us-search"></div>\
        <input/>\
        <div id="selectable-list" style="scroll:auto;">\
        <ul><li><a href="#us-'+title+'">'+title+'</a></li></ul>'
        + tabContent + '\
        </div>\
        </fieldset>\
        </form>';
        $("<div id='branch-selection-dialog-"+repoId+"' title='Change/Switch branch'></div>").appendTo('body');
        $(innerHtml).appendTo("#branch-selection-dialog-"+repoId);

        $("#branch-selection-dialog-"+repoId+" #selectable-list").tabs();

        var $dialog = $( "#branch-selection-dialog-"+repoId ).dialog(
            {
              'autoOpen': false,
              'minWidth': 100,
              draggable: false,
              'modal': false,
              'minHeight': 20,
              "position": "left",
              'open': function() {
              $( "#branch-selection-dialog-"+repoId )
              .parent().offset($("#toolbox").offset());
            }
            }
        );
    }
    else {
      $("#branch-selection-dialog-"+repoId + " #selectable-list").append(tabContent);
      $("#branch-selection-dialog-"+repoId + " #selectable-list").tabs("add", "#us-" + title, title);
    }

    $("#branch-selection-dialog-"+repoId+" .diagramSelector").click(function() {
      self.selected = $(this).attr('url');
      var text = $(this).children("span").text();

      $("#branch-selection-dialog-"+repoId).dialog("close");
      IBranchSelectObserver.onBranchSelected(title, text);
      $("#us-branch .js-select-button").text(text);
    });
  },
  //
  // Save diagram dialog which propose to user save change
  //
  'SaveDiagramDialog':function(){

  },
  //
  // Create new folder dialog.
  //
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
  //
  // Commit data selection dialog. It is provide the list of modified files
  // and allow user to select files for commit.
  //
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
      if (!$("#commit-changes-dialog").length) {
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

  },
  //
  // Modal dialog.
  //
  'ConfirmationDialog': function(descr, callback) {
    var innerHtml = '<div id="us-dialog-confirm" title="'+descr.title+'">\
                     <p>\
                       <span class="ui-icon ui-icon-alert" style="float: left; margin: 0 7px 20px 0;">\
                       </span>\
                       '+descr.description+'</p>\
                    </div>';
    var self = this;
    $(innerHtml).appendTo('body');

    $( "#us-dialog-confirm" ).dialog({
      resizable: false,
      height:140,
      modal: true,
      buttons: descr.buttons
    });
  },
  };
//@aspect
})(jQuery, dm);

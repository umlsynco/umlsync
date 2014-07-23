/*
 * Class which contain all dialogs in the framework
 * the main purpose of this class is to avoid
 * dialogs creation in the functional areas.
 * 
 * It was an idea to create a dialog manager instance
 * and specify interfaces between dialogs and [IFramework, IViewManager, IView]
 * 
 * 
 * Copyright: Copyright (c) 2012-2014 UMLSync Inc. All rights reserved.
 * URL: http://umlsync.org/about
 *
 */
(function($, dm, undefined) {

  dm.ms['dg'] = function(handler, options) {
    this.handler = handler;
    this.selected = "class";

    // list of modal dialogs
    this.dialogs = new Array();
    // status of modal dialogs
    this.status = new Array();
    this.callback = new Array();
    var self = this;
    $(document).bind("us-dialog-newdiagram", function(event, data) {
      self['Activate']("new-diagram-dialog", null, data);
    });
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
  'Activate': function(name, callback, data) {
    if (!name)
      return;
    this.status[name] = true; // active dialog. It is possible to activate dialog before it's creation. in that case it will be shown on creation.
    this.callback[name] = callback;

    if (name == "new-diagram-dialog") {
      $("#VP_error").text("Select the name of the new file:");
      
      if (data.view == null) {
        $("#us-new-diagram-dialog-input").attr('disabled', true).attr('checked', false);
        $("#VP_inputselector").attr('disabled', true);
      }
      else {
        $( "#us-new-diagram-dialog-input").attr('disabled', false).attr('checked', true);
        $("#VP_inputselector").attr('disabled', false).val(data.path);
        $("#VP_inputselector").autocomplete("option", "view", data.view);
      }
    }

    if (!$( "#" + name ).dialog( "isOpen" )) {
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
      <br><p id="us-new-diagram-dialog-readio" class="ui-widget-header ui-corner-all"><form>\
      <input value="umlsync" type="radio" name="type" checked="true">JSON</input>\
      <input value="us.svg" type="radio" name="type" style="margin-left:25px;">SVG</input>\
      <input value="text" type="radio" name="type" style="margin-left:25px;" disabled=true>PlantUML</input></p></form>\
      <p><label id="VP_error" style="margin-top:0px;float:left;font-color:red;">Select the name of the new file:</label></p>\
      <br><p class="ui-widget-header ui-corner-all">\
      <input id="us-new-diagram-dialog-input" type="checkbox" checked="true" class="left" style="margin: 4px 0px 4px 4px;"/>\
      <span class="left2"><input id="VP_inputselector" type="text" value="'+dm.dm.fw.getActiveTreePath()+'" maxlength="256" pattern="[a-zA-Z ]{5,}" name="name"/>\
      </span>\
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
          currentStatus: "",
          currentList: null,
          waitPathLoad: false,
          source:function(request, response) {
            if (response) {
              var val = $("#VP_inputselector").val();
              var newStatus = val.substr(0, val.lastIndexOf('/'));
              // Get user input
              var match = val.split("/").pop();
              // Self reference
              var selfA = this;

              // Mrthod to resuce show values
              function getMatch(descr) {
                var retList = new Array();
                for (var t in selfA.options.currentList) {
                    if (selfA.options.currentList[t].indexOf(descr) !== -1) {
                        retList.push(selfA.options.currentStatus + "/" + selfA.options.currentList[t] + "/");
                    }
                }
                return retList;
              }

              // Prevent multiple request of the same paths
              // Or request if paths was not loaded yet
              if (!this.options.waitPathLoad
                 && (this.options.currentStatus != newStatus
                     || this.options.currentList == null
                     || Object.keys(this.options.currentList).length == 0)) {
                
                this.options.currentStatus = newStatus;
                // Refresh result list:
                delete this.options.currentList;
                this.options.currentList = {};

                $(this).addClass('ui-autocomplete-loading');

                var IView = this.options.view;
                if (IView) {
                  this.options.waitPathLoad = true;
                  IView.getSubPaths(newStatus, function(status, data) {
                    // Handle results
                    if (status == "ok") {
                      // Reset wait status and list
                      selfA.options.waitPathLoad = false;
                      selfA.options.currentList = data;
                      $("#VP_inputselector").removeClass("ui-autocomplete-loading");
                      $("#VP_error").text("Select the name of the new file:");
                      response(getMatch(match)); // Update search result
                      }
                       else if (status == "loaded") {
                      $("#VP_error").text("Loading: " + data);
                    }
                    else {
                      // Reset wait status and list
                      selfA.options.waitPathLoad = false;
                      $("#VP_inputselector").removeClass("ui-autocomplete-loading");
                      $("#VP_error").text("Error: " + data);
                      }
                  });
                }
              }
              else {
                // return nothing is path was not load yet
                response(getMatch(match));
              }
            }
          },
          select: function(event, ui) {
            $(this).autocomplete('search');
          }
        }
      );
      
      var self = this;
      $("#new-diagram-dialog #diagram-menu").listmenu({
        selector: "diagram-selector",
        selectable: true,
        urlPrefix: dm.dm.loader.getUrl(),
        data:data,
        onSelect: function(item)
          {
            self.selected = item.id;
            var val = $("#new-diagram-dialog input#VP_inputselector").val();
            if (item.id == "markdown") {
              $("#new-diagram-dialog input#VP_inputselector").val(val.substr(0, val.lastIndexOf('/') + 1) + "Document.md");
            }
            else if (item.id == "snippets") {
              $("#new-diagram-dialog input#VP_inputselector").val(val.substr(0, val.lastIndexOf('/') + 1) + "Snippet.us.snippet");
            }
            else {
              $("#new-diagram-dialog input#VP_inputselector").val(val.substr(0, val.lastIndexOf('/') + 1) + item.id + "Diagram");
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
              type = $("#us-new-diagram-dialog-readio input:checked").val(),
              diagram_name = $("#new-diagram-dialog input#VP_inputselector").val();

         if (isNamed) {
           // Add file extension for diagram files
           if ((diagram_name.lastIndexOf("." + type) != diagram_name.length - 1 -type.length) && (!(["markdown", "snippets"].indexOf(self.selected) >= 0))) {
             diagram_name = diagram_name + "." + type;
           }

             // markdown extension
           if ((diagram_name.lastIndexOf(".md") != diagram_name.length - 3) && (self.selected == "markdown")) {
             diagram_name = diagram_name + ".md";
           }

           // snippets extension
           if ((diagram_name.lastIndexOf(".snippet") != diagram_name.length - 8) && (self.selected == "snippets")) {
             diagram_name = diagram_name + ".snippet";
           }

           var fullname = diagram_name;
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
            title: isNamed ? diagram_name.split("/").pop() : diagram_name,
            repoId:isNamed ? dm.dm.fw.getActiveRepository() : null,
            viewid:isNamed ? dm.dm.fw.getActiveView() : null,
            branch:isNamed ? dm.dm.fw.getActiveBranch() : null,
            absPath: isNamed ? diagram_name : null,
            contentType:"umlsync",
            isOwner: true,
            editable:true,
            isNewOne:true
          };

          if (!isNamed && self.selected != "markdown" && self.selected != "snippets") {
              // Keep the content type for a SaveAs dialog for a content without name
              params.type = type;
          }

          if (self.selected != "markdown" && self.selected != "snippets") {
            // Work-around for the sequence diagrams
            var baseType = self.selected;
            if (type == "umlsync") {
              // Empty diagram in JSON format
              dm.dm.fw['addNewContent'](params, {base_type:baseType,type:self.selected});
              }
            else if (type == "us.svg") {
              // Empty diagram in SVG format
              var ddd = '<?xml version="1.0" encoding="utf-8" ?>\
                           <svg umlsync="v1.0" baseProfile="full" height="100%" version="1.1" width="100%" xmlns="http://www.w3.org/2000/svg" xmlns:ev="http://www.w3.org/2001/xml-events" xmlns:xlink="http://www.w3.org/1999/xlink">\
                           <desc>{"type":"'+self.selected+'","base_type":"'+baseType+'"}</desc></svg>';
              dm.dm.fw['addNewContent'](params, ddd);
            }
            else {
              alert("type - " + type + " not supported.");
            }
          }
          else if (self.selected == "markdown") {
            params.contentType = "markdown";
            params.editable = false;
            // Empty content of markdown
            dm.dm.fw['addNewContent'](params, "Goodby Word!");
          }
          else if (self.selected == "snippets") {
              params.contentType = "snippets";
            params.editable = false;
            dm.dm.fw['addNewSnippets'](params, {});
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
        var $par = $( "#new-diagram-dialog").parent();

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
  'SaveAs': function(callback) {
    var innerHtml = '<p id="dl-validation-tip" style="color:red;"></p><form>\<fieldset>\
      <div style="display:inline;"><label for="name">Name:</label>\
      <input type="text" name="name" id="us-saveas-autocomplete-input" class="text ui-widget-content ui-corner-all" /></div>\
      </fieldset>\
      </form>';
      var self = this;
      
      
      $('<div id="save-as-dialog" title="Save as:"></div>').appendTo('body');
      $(innerHtml).appendTo("#save-as-dialog");
      
      var currentStatus = "", currentList = {};
      $("#us-saveas-autocomplete-input")
      .autocomplete(
        {
          source:function(request, response) {
            if (response) {
              var val = $("input#us-saveas-autocomplete-input").val();
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

      $("#save-as-dialog").dialog({
        autoOpen: false,
        height: 154,
        width: 350,
        modal: true,
        buttons: {
        "Create": function() {
          var val = $("#save-as-dialog input").val();
          var msg = dm.dm.fw.checkContentName(val);

          if ((val != "") && (msg == "ok")) {
            if (self.callback && self.callback["save-as-dialog"]) {
              self.callback["save-as-dialog"](val);
            }
            $( this ).dialog( "close" );
          } else {
            $("#save-as-dialog #dl-validation-tip").text(msg);
          }
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function() {
        $("#save-as-dialog input").val("");
        $("#save-as-dialog #dl-validation-tip").text("");
      }
    });
  },

  //
  // Localhost configuration dialog
  // @result-host - host address
  // @result-secret - secret key
  //
  'ConfigureLocalhost': function(title, callback) {
    var innerHtml = '<p id="dl-validation-tip" style="color:red;"></p>\
      <form>\
      <fieldset>\
      <div style="display:inline;"><label for="host" style="float:left;">Host:</label><input type="text" value="http://localhost:8000" name="host" id="us-host-input" class="text ui-widget-content ui-corner-all" style="float:right;width:250px;" /></div><br><br>\
      <div style="display:inline;"><label for="key" style="float:left;">Secret key:</label><input type="text" value="180070104577213587621384870490287" name="key" id="us-key-input" class="text ui-widget-content ui-corner-all" style="float:right;width:250px;"/></div>\
      </fieldset>\
      </form>';
      var self = this;

      $('<div id="configure-localhost-dialog" title="'+title+'"></div>').appendTo('body');
      $(innerHtml).appendTo("#configure-localhost-dialog");

      $("#configure-localhost-dialog").dialog({
        autoOpen: false,
        height: 154,
        width: 350,
        modal: true,
        buttons: {
            "Connect": function() {
              var host = $("#us-host-input").val();
              var key = $("#us-key-input").val();
              if (callback && callback.OnConfigSetup) {
                callback.OnConfigSetup(host, key);
              }

              $( this ).dialog( "close" );
            },
            Cancel: function() {
              $( this ).dialog( "close" );
            },
            'Info ...': function() {
                window.open('https://github.com/UmlSync/websync/blob/master/install.md', '_blank');
            }
        },
        close: function() {
            $("#configure-localhost-dialog #dl-validation-tip").text("");
        }
    });
  },

  //
  // Snippets navigation dialog
  //
  'SnippetNavigator': function(params, fw, jsonData) {
    var snippetDescription = new Array();
    var snippetPosition = -1;
    var PARARAMS = params;
    var snippetSortCache = null;
    var title = params.title;
    var innerHtml = '<div id="us-snippets-toolbox"><ul class="ui-widget ui-helper-clearfix">\
                                    <li class="ui-state-default ui-corner-all" title="First Comment"><span class="ui-icon ui-icon-seek-first"></span></li>\
                                    <li class="ui-state-default ui-corner-all" title="Previous Comment"><span class="ui-icon ui-icon-seek-prev"></span></li>\
                                    <li class="ui-state-default ui-corner-all" title="Stop and Save snippets"><span class="ui-icon ui-icon-stop"></span></li>\
                                    <li class="ui-state-default ui-corner-all" title="Stop and Save snippets"><span class="ui-icon ui-icon-pause"></span></li>\
                                    <li class="ui-state-default ui-corner-all" title="Start Snippet"><span class="ui-icon ui-icon-comment"></span></li>\
                                    <li class="ui-state-default ui-corner-all" title="Next Comment"><span class="ui-icon ui-icon-seek-next"></span></li>\
                                    <li class="ui-state-default ui-corner-all" title="Switch to the final Comment"><span class="ui-icon ui-icon-seek-end"></span></li></ul>\
                                    </div>';
    var innerHtml2 = '<div id="snippets" style="width: 100%; height: 100%;"><div id="selectable-list" style="scroll:auto;"><ul id="snippets-list"></ul></div></div>';
                                    
    var self = fw;

    $('<div id="snippet-navigator-dialog" title="'+title+'"></div>').appendTo('body');
    $(innerHtml2).appendTo("#snippet-navigator-dialog");

    // Subscribe on add new items event
    $(document).on("snippet.add", function(event) {
          var idx = event.info.position.index;
          // Update an existing snippet
          if (idx != undefined && idx != null) {
            snippetDescription[idx] = event.info;
          }
          // Insert snippet at active position
          else {
            ++snippetPosition;
            event.info.position.index = snippetPosition; // Update snippet position in the list
              snippetDescription.splice(snippetPosition, 0, event.info);
            $("#snippets-list").append("<li title='"+event.info.msg+"'>"+event.info.params.absPath+"</li>");
            $("#snippets-list").sortable("refresh");
          }
    });

    // Add all existing items to the list
    // Note: applicable for snippet open only
    if (jsonData && jsonData['snippets']) {
        for (var sn in jsonData['snippets']) {
            var inf = jsonData['snippets'][sn]
            snippetDescription.push(inf);
            ++snippetPosition;
            $("#snippets-list").append("<li title='"+inf.msg+"'>"+inf.params.absPath+"</li>");
        }
    }

    // disable snippet mode of the framework
    function disableSnippetMode() {
        if (self.selectedContentId) {
           params = self.contents[self.selectedContentId];
           if (params && params.contentType) {
              var snippet = self.formatHandlers[params.contentType].snippetMode(self.selectedContentId, false);
              if (snippet) {
                self.activeSnippet.push(snippet);
              }
           }
        }
    }

    // Enable snippets mode for the framework
    fw.SnippetMode = true;

    // Make the list of snippets selectable
    $("#snippets #snippets-list")
    // Make the list of snippets sortable
    .sortable({
      start: function(event, ui) {
        // Drop snippet bubble on remove
        $("#snippet_bubble").remove();
        // Drop snippet from the list
        var index = ui.item.index();
        snippetSortCache = snippetDescription.splice(index, 1)[0];
      },
      stop: function(event, ui) {
        var index = ui.item.index();
        snippetDescription.splice(index, 0, snippetSortCache);
      }
    });

    var cachedWidth = 200, cachedPosition = {top:50, left: 400}, cachedH = 39;
    // Open snippet navigation dialog
    //
    $("#snippet-navigator-dialog").dialog({
        autoOpen: true,
        height: 154,
        width: 350,
        modal: false,
        open: function(event, ui){
            // Hide close icon
            $(this).parent().children().children('.ui-dialog-titlebar-close').hide();
            // Add navigation icons
            $(this).parent().find('.ui-dialog-titlebar').append(innerHtml);
        },
        close: function() {
          // Save snippets content
          dm.dm.fw.saveSnippetsContent(PARARAMS, snippetDescription);
          // disable events subscription (do not modify snippet anymore)
          $(document).off("snippet.add");
          // Destroy dialog
          $( this ).dialog( "destroy" );
          // Remove HTML element
          $("#snippet-navigator-dialog").remove();
        }
    })
    // Make this dialog draggable
    .parent().draggable().dblclick(function() {
        // To prevent unexpected behavior copy the values to the local variables
        var $this = $(this), cw = cachedWidth, cp = cachedPosition, ch = cachedH;
        cachedWidth = $this.width();
        cachedH = $this.height();
        cachedPosition = $this.position();

        // save/restore from the small/big view
        $("#snippet-navigator-dialog").toggle();
        $('#ui-dialog-title-snippet-navigator-dialog').toggle();
        $this.animate({width:cw, height:ch, top:cp.top, left:cp.left});
    });
    
    $("#us-snippets-toolbox span.ui-icon").click(self, function(e, data) {
        var self = e.data || data,
            $this = $(this);
        if ($this.hasClass('ui-icon-stop')) {
            self.SnippetMode = false;
            disableSnippetMode();
            // remove snippets toolbox
            $("#snippet-navigator-dialog").dialog("close");
        }
        else if ($this.hasClass('ui-icon-pause')) {
            self.SnippetMode = false;
            disableSnippetMode();
        }
        else if ($this.hasClass('ui-icon-seek-next')) {
            if (snippetPosition < snippetDescription.length - 1) {
                ++snippetPosition;
                snippetDescription[snippetPosition].position.index = snippetPosition;
                self.openSnippet(PARARAMS, snippetDescription[snippetPosition]);
            }
        }
        else if ($this.hasClass('ui-icon-seek-prev')) {
            if (snippetPosition > 0) {
                --snippetPosition;
                snippetDescription[snippetPosition].position.index = snippetPosition;
                self.openSnippet(PARARAMS, snippetDescription[snippetPosition]);
            }
        }
        else if ($this.hasClass('ui-icon-seek-first')) {
            if (snippetPosition >= 0) {
                snippetPosition = 0;
                snippetDescription[snippetPosition].position.index = snippetPosition;
                self.openSnippet(PARARAMS, snippetDescription[snippetPosition]);
            }
        }
        else if ($this.hasClass('ui-icon-seek-end')) {
            if (snippetPosition >= 0) {
                snippetPosition = snippetDescription.length - 1;
                snippetDescription[snippetPosition].position.index = snippetPosition;
                self.openSnippet(PARARAMS, snippetDescription[snippetPosition]);
            }
        }
        e.stopPropagation();
    });

    $("DIV#snippets>DIV#selectable-list>ul#snippets-list>li").live('click', function () {
        var index = $(this).parent().children('li').removeClass('hover').index(this);
        if (index != -1 && index >= 0 && index < snippetDescription.length) {
            $(this).addClass('hover');
            snippetPosition = index;
            snippetDescription[snippetPosition].position.index = snippetPosition;
            self.openSnippet(PARARAMS, snippetDescription[snippetPosition]);
        }
    });
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
      if (data[d].title) {
        items.push('<tr><td> <input type="checkbox" checked/></td><td>' + data[d].title + '</td></tr>');
      }
      else {
        items.push('<tr><td> <input type="checkbox" checked/></td><td>' + d + '</td></tr>');
      }
    }

    var innerHtml = items.join('');

    innerHtml = "<div id='list-item'><div><div class='scrollable' style='scroll:auto;'>\
      <table id='us-commit-table' class='tablesorter'><thead><tr class='header'><th></th><th>File path</th></tr></thead><tbody>\
      " + innerHtml + "</tbody></table></div>" +
      "<p><label>Commit message: </label><br>"+
      "<textarea id='us-commit-message' maxlength='300' pattern='[a-zA-Z ]{5,}' style='width:99%;'></textarea><br>"+
      "<label id='us-commit-status'></label></p>" +
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
        height: 284,
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
        var myLovelyDialog = this;
        commit_callback(message,
                        commit_items,
                        function(err) { // On any completion state
                           if (err == null) {
                             // Clear the commit status message
                             $("#commit-changes-dialog #us-commit-status").html("");
                             $( myLovelyDialog ).dialog( "close" );
                             return;
                           }
                           $("#commit-changes-dialog #us-commit-status").html("Error:"+err.message);
                           // It is up to user to cancel or repeat the commit
                        },
                        function(status) {
                            $("#commit-changes-dialog #us-commit-status").html(status);
                        });
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
    // Destroy previous dialog
    $("#us-dialog-confirm").remove();

    var innerHtml = '<div id="us-dialog-confirm" title="'+descr.title+'">\
                     <p>\
                     <span class="ui-icon ui-icon-alert" style="float: left; margin: 0 7px 20px 0;">\
                     </span>\
                     '+descr.description+'</p>\
                     </div>';
    var self = this;
    $(innerHtml).appendTo('body');

    var $dialog = $( "#us-dialog-confirm" ).dialog({
      resizable: false,
      autoOpen: false,
      height:140,
      modal: true,
      buttons: descr.buttons
    });

    return $dialog.dialog('open');
  },
  
  'SelectBranchesDialog': function(title, ISelectObserver, repos) {
    var self = this;

    function getTabContent(data) {
      var items = [];
      for (var i in data) {
        var name = data[i];
        //pr = "<i>" + (data[i]['private']) ? "Private: ":"Public: </i>" ;
        //items.push('<li class="diagramSelector" style="cursor:pointer;" id="'  + name +'" url="'+ data[i]['url'] +'">' + pr + "<span>" + data[i]['full_name'] + '</span></li>');
        items.push('<li class="diagramSelector" style="cursor:pointer;" id="'  + name +'"><span>' + name + '</span></li>');
      }
      return items.join('');
    }

    var
    tabContent = '<div id="us-'+title+'"><ul>'+getTabContent(repos)+'</ul></div>';

    if ($("#svn-selection-dialog #selectable-list").length == 0) {
      var innerHtml = '<form>\
        <fieldset>\
        <div id="us-search"></div>\
        <div id="selectable-list" style="scroll:auto;">\
        <ul><li><a href="#us-'+title+'">'+title+'</a></li></ul>'
        + tabContent + 
        '</div>\
        </fieldset>\
        </form>';
        $("<div id='svn-selection-dialog' title='Repository selection'></div>").appendTo('body');
        $(innerHtml).appendTo("#svn-selection-dialog");

        $("#svn-selection-dialog #selectable-list").tabs();

        var $dialog = $( "#svn-selection-dialog" ).dialog(
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
              $( "#svn-selection-dialog")
              .parent().offset($("#us-branch").offset());
            }
            }
        );
    }
    else {
      $("#svn-selection-dialog #selectable-list").append(tabContent);
      $("#svn-selection-dialog #selectable-list").tabs("add", "#us-" + title, title);
    }

    $("#us-"+title+" .diagramSelector").click(function() {
      self.selected = $(this).attr('url');
      var text = $(this).children("span").text();
      $("#svn-selection-dialog" ).dialog("close");
      ISelectObserver.onRepoSelect(title, text);
    });
  },


  };
})(jQuery, dm);

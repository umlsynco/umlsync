/*
Class: framework

Views and diagrams handler.
it is required header, content and bottom options to make it resizeable

Copyright:
  Copyright (c) UMLSync Inc. All rights reserved.

URL:
  http://umlsync.org

Version:
  1.0.0 (2012-03-21)
 */

//@aspect
(function($, dm, undefined) {

  //@export:dm.hs.framework:plain
  dm.hs.framework = function(options) {
    var activeNode;
    //var Showdown = require('showdown');
    var converter = new Showdown.converter({ extensions: ['umlsync'] });

    function getInstance(options) {
      dm.dm = dm.dm || {};
      if (!dm.dm['fw']) {
        // create a instance
        dm.dm['fw'] = new framework(options);
      }

      // return the instance of the singletonClass
      return dm.dm['fw'];
    }

    var framework = function(options) {
      var tmp_opt = $.extend(true, {}, this.options, options);
      this.options = tmp_opt;

      this.counter = 0;
      this.loader = dm.dm.loader;
      this.diagrams = this.diagrams || {};
      this.markdown = this.markdown || {};
      this.contents = this.contents || {};
      this.openDiagramMenuOnFirstInit = false;

      this.initializeToolBox(dm.dm.loader);

      if (dm.ms['dg']) {
        dm.dm['dialogs'] = new dm.ms['dg'](this);
        this.initMainMenu();
      }

      // Think about field set
      $("#" + this.options.content).append('\
          <div id="'+ this.options.content +'-left" style="width:200px;height:100%;padding:0;margin:0;position:absolute;">\
          <div id="switcher" style="background-color:gray;">\
          <div class="dropdown-widget" style="display:none;">\
          <div class="select-menu">\
          <a class="minibutton select-menu-button js-menu-target">\
          <span class="mini-icon mini-icon-branch"></span>\
          <i>Repository:</i>\
          <span class="js-select-button">umlsynco/umlsync</span>\
          </a>\
          <div id="opened-repos" style="position:absolute;right:0px;z-index:9999;">\
          <div class="select-menu-modal js-select-menu-pane">\
          <div class="select-menu-header">\
          <span class="select-menu-title">Switch branches/tags</span>\
          <span class="mini-icon mini-icon-remove-close js-menu-close"></span>\
          </div> <!-- /.select-menu-header -->\
          <div class="select-menu-filters">\
          <div class="select-menu-text-filter">\
          <input type="text" placeholder="Find a branch…" class="js-select-menu-text-filter js-filterable-field js-navigation-enable" id="commitish-filter-field">\
          </div> <!-- /.select-menu-text-filter -->\
          <div class="select-menu-tabs">\
          <ul>\
          <li class="select-menu-tab">\
          <a class="js-select-menu-tab selected" data-filter="branches" href="#">Branches</a>\
          </li>\
          <li class="select-menu-tab">\
          <a class="js-select-menu-tab" data-filter="tags" href="#">Tags</a>\
          </li>\
          </ul>\
          </div><!-- /.select-menu-tabs -->\
          </div><!-- /.select-menu-filters -->\
          <div data-filterable-type="substring" data-filterable-for="commitish-filter-field" class="select-menu-list js-filter-tab js-filter-branches" style="display: block;">\
          <div class="select-menu-item js-navigation-item js-navigation-target">\
          <span class="select-menu-checkmark mini-icon mini-icon-confirm"></span>\
          <a rel="nofollow" data-name="AccordionMenu" class="js-navigation-open select-menu-item-text js-select-button-text" href="/umlsynco/umlsync/tree/AccordionMenu">AccordionMenu</a>\
          </div> <!-- /.select-menu-item -->\
          <div class="select-menu-item js-navigation-item js-navigation-target">\
          <span class="select-menu-checkmark mini-icon mini-icon-confirm"></span>\
          \
          <a rel="nofollow" data-name="DiagramMenuToolbox" class="js-navigation-open select-menu-item-text js-select-button-text" href="/umlsynco/umlsync/tree/DiagramMenuToolbox">DiagramMenuToolbox</a>\
          \
          </div> <!-- /.select-menu-item -->\
          \
          \
          \
          <div class="select-menu-item js-navigation-item js-navigation-target">\
          <span class="select-menu-checkmark mini-icon mini-icon-confirm"></span>\
          \
          <a rel="nofollow" data-name="editor_repo_selection" class="js-navigation-open select-menu-item-text js-select-button-text" href="/umlsynco/umlsync/tree/editor_repo_selection">editor_repo_selection</a>\
          \
          </div> <!-- /.select-menu-item -->\
          \
          \
          \
          <div class="select-menu-item js-navigation-item js-navigation-target">\
          <span class="select-menu-checkmark mini-icon mini-icon-confirm"></span>\
          \
          <a rel="nofollow" data-name="github_integration" class="js-navigation-open select-menu-item-text js-select-button-text" href="/umlsynco/umlsync/tree/github_integration">github_integration</a>\
          \
          </div> <!-- /.select-menu-item -->\
          \
          \
          \
          <div class="select-menu-item js-navigation-item js-navigation-target">\
          <span class="select-menu-checkmark mini-icon mini-icon-confirm"></span>\
          \
          <a rel="nofollow" data-name="grid-align" class="js-navigation-open select-menu-item-text js-select-button-text" href="/umlsynco/umlsync/tree/grid-align">grid-align</a>\
          \
          </div> <!-- /.select-menu-item -->\
          \
          \
          \
          <div class="select-menu-item js-navigation-item js-navigation-target">\
          <span class="select-menu-checkmark mini-icon mini-icon-confirm"></span>\
          \
          <a rel="nofollow" data-name="IE9" class="js-navigation-open select-menu-item-text js-select-button-text" href="/umlsynco/umlsync/tree/IE9">IE9</a>\
          \
          </div> <!-- /.select-menu-item -->\
          \
          \
          \
          <div class="select-menu-item js-navigation-item js-navigation-target selected last-visible navigation-focus">\
          <span class="select-menu-checkmark mini-icon mini-icon-confirm"></span>\
          \
          <a rel="nofollow" data-name="master" class="js-navigation-open select-menu-item-text js-select-button-text" href="/umlsynco/umlsync/tree/master">master</a>\
          \
          </div> <!-- /.select-menu-item -->\
          \
          \
          <form method="post" class="js-create-branch select-menu-footer select-menu-item select-menu-new-item-form js-navigation-item js-navigation-target js-new-item-form" action="/umlsynco/umlsync/branches" accept-charset="UTF-8"><div style="margin:0;padding:0;display:inline"><input type="hidden" value="/+3C5/PUTxi24+gIy6hmjxmh4fWwBLoH8WI59aC9Anc=" name="authenticity_token"></div>\
          <span class="mini-icon mini-icon-branch-create"></span>\
          <div class="select-menu-item-text">\
          <h4>Create branch: <span class="js-new-item-name"></span></h4>\
          <span class="description">from ‘master’</span>\
          </div>\
          <input type="hidden" class="js-new-item-submit" id="name" name="name">\
          <input type="hidden" value="master" id="branch" name="branch">\
          \
          </form> <!-- /.select-menu-footer -->\
          \
          \
          </div> <!-- /.select-menu-list -->\
          \
          \
          <div style="display: none;" data-filterable-type="substring" data-filterable-for="commitish-filter-field" class="select-menu-list js-filter-tab js-filter-tags filterable-empty">\
          \
          \
          <div class="select-menu-no-results js-not-filterable">Nothing to show</div>\
          \
          </div> <!-- /.select-menu-list -->\
          \
          </div>\
          </div>\
          </div>\
          </div>\
          <div class="branchnav-widget ui-state-default" style="display:none;">\
          <div class="select-menu">\
          <a class="minibutton select-menu-button js-menu-target">\
          <span class="mini-icon mini-icon-branch"></span>\
          <i>Branch:</i>\
          <span class="js-select-button">master</span>\
          </a>\
          </div>\
          </div>\
          <div id="reponav"><span id="us-github">Github</span><span style="float:right;" id="us-eclipse">Eclipse</span></div>\
          <div id="toolbox"><ul style="list-style:none;">\
          <li class="us-left" title="Commit changes"><img src="/images/commit.png" class="ui-icon"></li>\
          <li class="us-left" title="Reload tree"><img src="/images/reload.png" class="ui-icon"></li>\
          <li id="us-newdoc" title="New diagram"><img src="/images/newdoc.png" class="ui-icon"></li>\
          <li id="us-revertdoc" title="Revert diagram"><img src="/images/revertdoc.png" class="ui-icon"></li>\
          <li id="us-removedoc" title="Remove diagram"><img src="/images/deldoc.png" class="ui-icon"></li>\
          </ul></div>\
          <div id="treetabs"></div>\
          </div>\
          </div>\
          <div id="'+ this.options.content +'-left-right-resize" style="width:6px;left:200px;height:100%;position:absolute;padding:0;margin:0;border:0px solid gray;background-color:gray;cursor: col-resize;"></div>\
          <div id="'+ this.options.content +'-right" style="width:100px;left:206px;height:100%;position:absolute;padding:0;margin:0;">\
          <div id="tabs"><ul></ul></div>\
          </div>');
          // #9 #10 # 55 are based on margin and padding of element
          // they should be replaced on valid values
          var self = this;
          self.updateFrameWork(true); // $(window).trigger("resize");
          $(window).resize(function(e) {
            if ((e.target === window) || (e.target == window)) {
              self.updateFrameWork(true);
            }
          });
          
         // Switch between github and eclipse engine          
         $("#us-github").click(function(){ 
           // Show repo&branch selection min-buttons
           $("#reponav").children("div").show();
           // TODO: Show the latest active tree
         });
         $("#us-eclipse").click(function(){
           // Hide the github selection mini-buttons
           $("#reponav").children("div").hide();
           // Switch to eclipse tree
           self.addView2('Eclipse', new dm.base.LocalhostView("http://localhost:8000/vm/pe"));
         });


          var $switcher = $('#switcher');
          $switcher.addClass('ui-switcher ui-widget ui-helper-reset ui-switcher-icons');

          $("#us-newdoc").click(function() {
            dm.dm.dialogs['Activate']("new-diagram-dialog");
          });
          
          var $tabs = $("#tabs")
          .tabs( {'tabTemplate': '<li><a href="#{href}"><span>#{label}</span></a><a class="ui-corner-all"><span class="ui-test ui-icon ui-icon-close"></span></a></li>',
            'scrollable': true,
            'add': function(event, ui) {
            if (self.diagrams) {
              self.selectedDiagramId = "#" + ui.panel.id;
            }
            $tabs.tabs('select', '#' + ui.panel.id);
          },
          'select': function(event, ui) {
            if (self.diagrams) {
              self.selectedDiagramId = "#" + ui.panel.id;

              // Show/hide diagram menu to tabs change
              if ($(self.selectedDiagramId).attr('edm') == "true") {
                $(".diagram-menu").show();
                var did = self.diagrams[self.selectedDiagramId];
                if (did) {
                  //@ifdef EDITOR
                  self['ActivateDiagramMenu'](did.options['type']);
                  //@endif
                  did.draw();
                }
              } else {
                $(".diagram-menu").hide();
              }
            }
            self.updateFrameWork(true);
          },
          'show': function(event, ui) {
            if (self.diagrams) {
              self.selectedDiagramId = "#" + ui.panel.id;
              var did = self.diagrams[self.selectedDiagramId];
              if (did) {
                did.draw();
              }
            }
          }
          });
          $("#tabs").css({'background-color':'#7E8380'}).css({'background':"none"});

          var canvasTop = (this.options.notabs) ? 13:44;
          $("#tabs").append('<canvas id="SingleCanvas" class="us-canvas" style="left:18px;top:'+canvasTop+'px;" width="1040" height="600">YOUR BROWSER DOESN\'t SUPPORT CANVAS !!!</canvas>');
          
          if (this.options.notabs)
            $("#tabs ul.ui-tabs-nav").hide();

          // AUTOMATED TEST WORK_AROUND !!!
          $("#content-right DIV.ui-scrollable-tabs").scroll(
              function (e){
                $(this).scrollTop(0);
                e.preventDefault();
                e.stopPropagation();
              });

          $('#tabs span.ui-test').live('click', function() {
            var index = $('li', $tabs).index($(this).parent().parent()),

            ahref = $(this).parent().parent().children("A:not(.ui-corner-all)").attr("href");

            // Hide the diagram menu
            $(".diagram-menu").hide();

            if (self.contents && self.contents[ahref]) {
                self.saveContent(ahref, true);
                delete self.contents[ahref];
            }
            $tabs.tabs('remove', index);
            $(ahref).remove();
          });

          var $treetabs = $("#treetabs");
          //.tabs({tabTemplate: '<li><a href="#{href}"><span>#{label}</span></a><a class="ui-corner-all"><span class="ui-test ui-icon ui-icon-close"></span></a></li>',
          //'scrollable': true}).css({'background-color':"#7E8380", 'background':"none"});



          /*          $('#treetabs span.ui-test').live('click', function() {
            var index = $('li', $treetabs).index($(this).parent());
            ///$treetabs.tabs('remove', index);
          });
           */
          $("#content-left-right-resize").draggable({ axis: 'x', 'drag': function(ui) {
            self.updateFrameWork(false, ui);
          },
          stop: function(ui) {
            self.updateFrameWork(false, ui, true);
          }
          });

          // Initialize the key handler
          this.initializeKeyHandler(dm.dm.loader);
          if (this.options.viewmanager) {
            this.registerViewManager(this.options.viewmanager);
          }

          this.left_counter = 0;
          this.right_counter = 0;

          this.initDropDownSelector('#switcher #reponav', "us-repo",
              {
            filter:true,
            mtitle: 'Repository',
            title: 'Open/Switch repository',
            onSelect: function(selectedTab, selectedItem) {
            if (selectedTab == 'Yours') {
              // simply change repo
            }
            else if (selectedTab == 'Follow') {
              // open gists
            }
          }
              }
          ); // initDropDownSelector
          this.initDropDownSelector('#switcher #reponav', 'us-branch',
              {
            filter:true,
            mtitle: 'Branch',
            onSelect: function(selectedTab, selectedItem) {
            if (selectedTab == 'Yours') {
              // simply change repo
            }
            else if (selectedTab == 'Follow') {
              // open gists
            }
            alert("SELECTED !!!");
          }
              }
          ); // initDropDownSelector

          // Update the sizes first time
          this.updateFrameWork(true);

          self.wdddd = true;
    }

    framework.prototype = {
     options: {
      tabRight:"diag",
      embedded:"embedded",
      tabLeft:"view-",
      tabs:"tabs",
      top:"#content-header",
      bottom:"#content-bottom",
      content:"content"
     },
     views:{},
     addRepositories: function(title, IViewsManager, descr) {
      if (dm.dm.dialogs) {
        dm.dm.dialogs['SelectRepoDialog'](title, IViewsManager, descr);
      }
     },
     // Work-around to change text of
     // selected repository
     onRepoSelect: function(view, text) {
       if (view.euid == "github") {
        $("#us-repo .js-select-button").text(view.getActiveRepository());
        $("#us-branch .js-select-button").text(view.activeBranch);
       }
     },

    // create the drop down selector with tabs
    // param - element id to attach widget
    // desc - JSON description of drop down selector
    //        {filter: true/false, mtitle: MiniTitle, title: TITLE, tabs:{ name1: {id1, id2}, name2: {id3, id4}}}
    //
    initDropDownSelector: function(parentId, uid, desc) {

      $('<div class="dropdown-widget" id="'+uid+'">\
          <div class="select-menu">\
          <a class="minibutton select-menu-button js-menu-target">\
          <span class="mini-icon mini-icon-branch"></span>\
          <i>'+desc.mtitle+':</i>\
          <span class="js-select-button">none</span>\
          </a>\
          </div>\
          </div>')
          .appendTo(parentId)
          .click(function() {
            if (uid == "us-repo")
              dm.dm.dialogs['Activate']("repo-selection-dialog");
            if (uid == "us-branch") {
              var text = $("#us-repo .js-select-button").text();
              var repoId = text.replace("/", "-");
              dm.dm.dialogs['Activate']("branch-selection-dialog-"+repoId);
            }
          });
    },
    getActiveTreePath: function() {
      var text = this.getActiveView();
      if (!this.views[text])
        return "/";
      return (this.views[text]['view'].active || "" ) + "/";
    },
    //
    // Return the available folders for the concrete folder
    //
    getSubPaths: function(path, sp_callback) {
      var text = this.getActiveView();
      if (!this.views[text])
        return null;
      return this.views[text]['view'].getSubPaths(path, sp_callback);
    },
    //
    //  Return the active view unique id
    //  see addView2 for more details
    //
    getActiveView: function() {
      return this.activeView;
    },
    //
    // Return an active repository under the current active view
    //
    getActiveRepository: function() {
      var text = this.getActiveView();
      if (!this.views[text])
        return "none";
      return (this.views[text].view.getActiveRepository() || "none" );
    },
    getActiveBranch: function() {
      var text = this.getActiveView();
      if (!this.views[text])
        return "none";
      return (this.views[text].view.getActiveBranch() || "none" );
    },
    //
    // Check that content with such name do not exist
    //
    checkContentName: function(name) {
      var text = this.getActiveView();
      if (!this.views[text])
        return null;
      return this.views[text]['view'].checkContentName(name);

    },
    // Loading the main menu JSON description and put it as argument to callback function
    //@proexp
    'CreateDiagramMenu':function(type, innerHtml, callback) {
      var len = $("#accordion").length;
      if (len) {
        $("#accordion").accordion('destroy').append("<h3 aux='"+type+"'><a href='#'>"+type+" diagram</a></h3>"+innerHtml).accordion({'active': len, autoHeight:false, clearStyle: true});
      } else {
        var header = '<div id="diagram-menu-header" class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix">\
          <span id="ui-dialog-title-vp_main_menu" class="ui-dialog-title">Toolbox</span>\
          <a class="ui-dialog-titlebar-close ui-corner-all" href="#" role="button">\
          <span class="ui-icon ui-icon-closethick">close</span></a></div>';

          $("#tabs").append("<div class='diagram-menu ui-dialog ui-widget ui-widget-content ui-corner-all'>"+header+"<div id='accordion'><h3 aux='"+type+"'><a href='#'>"+type+" diagram</a></h3>"+innerHtml+"</div></div>");
          
          $(".diagram-menu").draggable({'containment': '#tabs', 'cancel':'div#accordion'});
          
          $("#accordion").accordion({'active': 0, autoHeight:false, clearStyle: true});

          if (!this.openDiagramMenuOnFirstInit) {
            $(".diagram-menu").hide();
          }
		  $("#diagram-menu-header a.ui-dialog-titlebar-close").click(function() { 
                $("div.diagram-menu #accordion").slideToggle();
          });
      }
      if (callback) {
        callback(len); // len == index
      }
    },
    //@proexp
    'ActivateDiagramMenu':function(type) {
      var menuIsActive = false;
      var len = $("#accordion").length;
      if (len) {
        var idx = -1;
        len = 0; // Wrong length earlier, have to re-calculate it again
        $("#accordion").find("h3").each(function(index) {
          ++len;
          if ($(this).attr("aux") == type) {
            idx = index;
            menuIsActive = true;
          }
        });

        if (idx >=0) {
          $("#accordion").accordion({'active': idx});
        }
      }
      $("#accordion").children("DIV").css("width", "");
      return menuIsActive;
    },
    initMainMenu:function() {
      dm.dm.loader.LoadMainMenuData(function(data) {
        dm.dm.dialogs['NewDiagramDialog'](data);
      });
      dm.dm.dialogs['NewFolder']();
    },
    //@proexp
    'activeDiagram':function() {
      if (this.diagrams && this.selectedDiagramId) {
        return this.diagrams[this.selectedDiagramId];
      }
      return null;
    },
    //@proexp
    'registerViewManager': function(viewmanager, type) {
      var json_type = type || "json";
      if (viewmanager) {
        this.options.viewmanager = viewmanager;
        var self = this;
        $.ajax({ 'url': viewmanager + "getviews",
          'dataType': json_type,
          'success':  function(json) {
          var innerHtml = "",
          selectHtml = "";
          for (i in json) {
            innerHtml += "<li><a href='#'>" + json[i]['title']+ "</a></li>";
            selectHtml += "<option>" + json[i]['title'] + "</option>";
            $('#vp_main_menu select').append($("<option></option>")
                .attr("value",json[i]['id'])
                .text(json[i]['title']));
          }

          if ($('#header-menu #Views ul').length == 0) {
            $('#header-menu').append("<li id='Views'><a href='#'>Views</a><ul>" + innerHtml+"</ul></li>").jqsimplemenu();
          }
          else {
            $('#header-menu #Views ul').append(innerHtml);
            $('#header-menu').jqsimplemenu();
          }

          // Complete menu update first.
          // And open the default views than.
          for (i in json) {
            if (json[i]['isdefault']) {
              var IView = new dm.base.LocalhostView(self.options.viewmanager + json[i]['id']);
              IView.euid = json[i]['id'];
              self.addView2(json[i]['title'], IView);
            }
          }
        }
        });
      }
    },
    updateFrameWork: function(resizeAll, ui) {
      if (resizeAll) {
        // setup height for content and left - resize -right conent DIV's
        // header border 1px => total 2px (border top, border-bottom)
        // content border 1px => total 2px (border top, border-bottom)
        // and -1 to get real height
        var hhh = $(window).height() - $(this.options.top).outerHeight(true) - 5 - $("#"+this.options.content+"-bottom").outerHeight(true);

        var $ch1 = $("#" + this.options.content).height(hhh)  // set height of middle:  #content
        .children("DIV").height(hhh)              // #content-left; #content-right; #content-left-right-resize;  No border for this items available
        .children(".ui-scrollable-tabs").height(hhh - 2)    // 1px solid border defined for .ui-scrollable-tabs
        .children(".ui-tabs").height(hhh - 8);        // 3px border defined for .ui-tabs BUT if we will shift it than it is possible to observe cool effect

        // content left maximize treetabs area
        var repoH = $("#switcher #reponav").height(),
        toolboxH = $("#switcher #toolbox").height();
        $("#switcher #treetabs").height(hhh - repoH - toolboxH-2);

        var $ch, $md;
        if ($ch1.children(".ui-tabs-panel").length) {
          if (this.options.notabs == undefined || !this.options.notabs)
            hhh = hhh - $ch1.children("ul").height() - 8; //  8 from above and 1 is top padding of ul (which is tabs navigator)

          $ch = $ch1.children(".ui-tabs-panel").height(hhh)
          .children("div").height(hhh - 24); // Border 1px + padding 11
          hhh -= 24;

          // Update the markdown text area
          $md = $(".us-markdown-editor");
          if ($md.length != 0) {
            $md.height(hhh-$("span.us-toolbox-header ul li a").height()-35);
          }
        }

        // recalculate the content
        var wd = $("#" + this.options.content).width() - $("#"+ this.options.content+"-left").width() - 6;
        $("#" + this.options.content + "-right").width(wd);

        // Update the markdown text area
        if ($md && $md.length != 0) {
          $md.width(wd-37*2);
        }
        
        var canvas = window.document.getElementById('SingleCanvas');
        if (canvas) {
          if ($ch) {
            var s = $ch.offset();
            if (s) {
              canvas.left = s.x;
              canvas.top = s.y;
            }
          }
          canvas.height = hhh - 11; // 11-is scroll element size
          if ($(".us-diagram").length) {
            canvas.width = ($(".us-diagram").width() - 12);
          } else {
            canvas.width = wd - 40 - 12;
          }
        }
      }

      // change width on drag the resize div
      else if (ui != undefined) {
        $("#content-left-right-resize").css("left", ui.pageX);
        $("#content-left").css("width", ui.pageX);

        var wd = $("#content").width() - $("#content-left").width() - 6;
        $("#content-right").css("left", ui.pageX + 7).width(wd);

        var canvas = window.document.getElementById('SingleCanvas');
        if (canvas) {
          canvas.width = $("#content").width() - $("#content-left").width() - 40;
          if ($(".us-diagram").length) {
            canvas.width = ($(".us-diagram").width() - 12);
          } else {
            canvas.width = wd - 40 - 12;
          }
        }

        // Update the markdown text area
        var $md = $(".us-markdown-editor");
        if ($md.length !=0) {
          $md.width(wd-37*2);
        }
        
      }
      var tabsHeight = $(window).height() - $(this.options.top).outerHeight(true) - 8 - $(this.options.bottom).outerHeight(true);

      $("#tabs").width($("#content").width() - $("#content-left").width() - 13);//.height(tabsHeight);
      $("#tabs .ui-tabs-panel") //.height(tabsHeight-45)
      .children("DIV")
      .width($("#content").width() - $("#content-left").width() - 32);
      //.height($(window).height() - $("#content").position().top - 55 -  $(this.options.bottom).height());
      //$("#treetabs .ui-tabs-panel").height(tabsHeight-45);

    },
    addBranch: function(title, repoUrl, IBranchSelectObserver, desc) {
      var repoId = repoUrl.replace("/", "-");
      if (dm.dm.dialogs) {
        dm.dm.dialogs['ChangeBranchDialog'](title, desc, repoId, IBranchSelectObserver);
      }
    },
    //@proexp
    'addView2': function(name, IView) {
      //TODO: don't load view if name/euid is reserved yet !
      //    it could help to prevent some mess with localhost views
      var id = this.options.tabLeft+ this.left_counter;
      this.left_counter++;
      $("#treetabs").children("DIV").hide();
      $("#treetabs").append("<div id='"+id+"'></div>");

      if (name != "Eclipse") {
        $("#us-repo .js-select-button").text(IView.getActiveRepository());
        $("#us-branch .js-select-button").text("master");
      
     }

     id = "DIV#" + id;
     var $treetabs = $("#treetabs");

     $(id).append("<div id='tree'></div>");
     var self = this;

     function initCtxMenu(vid, items, view) {
        $('<ul id="view-'+  vid +'" class="context-menu" ></ul>').hide().appendTo('body');
        $("#view-"+vid).listmenu({
          selector: "menu-item",
          path:"./",
          data:items,
          onSelect: function(item) {
          if (item.click) {
            item.click(activeNode, view)
            $(".context-menu").hide();
          }
        }
        });
        $.log("ADD: view-" + vid);
      }

      self.views = self.views || {};
      self.views[IView.euid] = {};
      self.views[IView.euid]['view'] = IView;

      if (IView.ctx_menu) {
        initCtxMenu(IView.euid, IView.ctx_menu, IView);

        if (IView['element_menu']) {
          self.views[IView.euid]['element_menu'] = {};
          var counter = 0;
          for (var r in IView['element_menu']) {
            var rs = r.split(","), // Multiple elements support "Package,Subsystem"
            nm = IView.euid + "-" + counter;
            for (var h in rs) {
              self.views[IView.euid]['element_menu'][rs[h]] = nm;
            }
            initCtxMenu(nm, IView['element_menu'][r], IView);
            counter++;
          }
        }
      }

      IView.initTree(id + " #tree");

      this.activeView = IView.euid; // only 'github'
      
      return id;
    },
    'ShowContextMenu': function(name, event, node) {
      $.log("SHOW: " + name);
      $(".context-menu").hide();
      if (name) {
        activeNode = node;
        $("#view-"+name +".context-menu").css("left", event.clientX).css("top", event.clientY).show();
      }
    },
    'ShowElementContextMenu': function( desc , viewid, data, event) {
      activeNode = data;
      var self = dm.dm.fw;
      desc = data.options.title;
      $.log("ShowElementContextMenu: " + desc + "   VID: " + viewid + "  DATA: " + data.options + "  TYPE: " + data.options.title + " DESC:" + data.options.description);
      if (self.views && self.views[viewid]
      && self.views[viewid]['element_menu']
      && self.views[viewid]['element_menu'][desc]) {
        // Enable the context menu for element
        var uniqueName = "#view-";
        uniqueName += self.views[viewid]['element_menu'][desc];// Id of the menu
        $.log("SHOW: " + uniqueName);
        var $elem = $(uniqueName +".context-menu");
        if (data == undefined) {
          $elem.hide({delay:1000});
        } else {
          $elem.css("left", event.clientX-3).css("top", event.clientY+3).show()
        }
      }
    },
    //@proexp
    addView: function(name, options, toolbox) {
      var id = "#" + this.options.tabLeft+ this.left_counter;
      this.left_counter++;
      $("#treetabs").tabs("add", id, name);
      $(id).append("<div id='tree'></div>");
      var dt = $(id + " #tree").dynatree(options).dynatree("getTree");


      // Create toolbox
      if (toolbox != undefined) {
        var tb = toolbox;
        var innerHtml = "<div style=\"position:absolute;right:10px;top:37px;\">";
        for (i in toolbox.items) {
          innerHtml += "<button id=\"toolboxitem" + i+ "\" class=\"ui-button\" title=\"" + (toolbox.items[i]).title +"\"><span class=\"ui-icon " + (toolbox.items[i]).button+ "\"/></button>";
        }
        innerHtml += "</div>";

        $(innerHtml).appendTo(id);
        for (i in toolbox.items) {
          $("#toolboxitem" + i).click(i, function(e) {
            if (tb.items[e.data] && tb.items[e.data].method)
              tb.items[e.data].method(dt.getActiveNode());}
          );
        }
      }
      return id;
    },
    //@proexp
    'addMarkdown': function(params) {
      var tabname = this.options.tabRight + this.counter;
      var defaultMarkdownData = "Goodby Word!";

      $("#" + this.options.tabs)
      .append('<div id="'+tabname+'"></div>')
      .tabs('add','#'+tabname,params.title);
      tabname = "#" + tabname;

      // Enable diagram menu
      $(tabname).attr("edm", true);
      $(".diagram-menu").hide();

      //tabs("add", tabname, name);
      this.counter++;

      var self = this;

      if (params.absPath) {
        // Save an empty diagram. It could be new diagram or 
        self.views[params.viewid].view.saveContent(params, defaultMarkdownData, true);
        // Add content to cache
        self.contents[tabname] = params;
      }

      self.loadMarkdown(tabname, params, defaultMarkdownData);

      this.updateFrameWork(true);
    },
    //@proexp
    'addDiagram': function(baseType, type, params) {
      var tabname = this.options.tabRight + this.counter;

      $("#" + this.options.tabs)
      .append('<div id="'+tabname+'"></div>')
      .tabs('add','#'+tabname,params.title);
      tabname = "#" + tabname;

      // Enable diagram menu
      $(tabname).attr("edm", true);
      $(".diagram-menu").show();

      //tabs("add", tabname, name);
      this.counter++;
      if (type == "sequence")
        baseType = "sequence";
      var self = this;

      this.openDiagramMenuOnFirstInit = true;

      if (params.absPath) {
        // Save an empty diagram. It could be new diagram or 
        self.views[params.viewid].view.saveContent(params, {}, true);
        // Add content to cache
        self.contents[tabname] = params;
      }

      self.loadDiagram(tabname, params, {type:type, base_type:baseType});

      this.updateFrameWork(true);
    },
    //@proexp
    saveContent: function(tabid, isTabClosed) {
      var self = this;
      if (!self.contents[tabid]) {
        return;
      }
      var params = self.contents[tabid];
      
      if (!self.views || !self.views[params.viewid] || !self.views[params.viewid].view) {
        alert("View: " + viewId + " was not initialize.");
        return;
      }

      // Saved the diagram description:
      if (self.contents[tabid].contentType == "dm") { // Diagram
        if (!self.diagrams[tabid])
          return;
        var data = self.diagrams[tabid].getDescription();
        self.views[params.viewid].view.saveContent(params, data);
      }
      else if (self.contents[tabid].contentType == "md") { // Markdown
        // Save the markdown content
        // self.views[params.viewid].view.saveContent(params, data);

        // Diagram has listener on destroy,
        // but there is no destroy listener for markdown
        if (isTabClosed) {
          self.views[params.viewid].view.releaseContent(params);
        }
      }
    },

    appendContentToolbox: function(selector, params) {
      var self = this;
      if (params.selector == undefined) {
        var edit = (params.editable == true) || (params.editable == "true"),
        // It is not possible to edit file if it is defined by sha (and path unknown)
        // or if user is not owner of repository
        editBullet = (!params.isOwner || params.absPath == undefined) ? "": '<a id="us-link"><span id="us-diagram-edit">' + (edit ? "View":"Edit")+ '</span></a>';

        $(selector).append('<span class="us-diagram-toolbox">\
                               <a id="us-link"><span id="us-getlink">Get link</span></a>\
                               '+ editBullet +'\
                            </span>');
        // Handle edit if user is owner of the content
        if (params.isOwner) {
          $(selector + " #us-diagram-edit").click(function() {
            // switch from editable to static and back
            var text = $(this).text(),
                editFlag = false;
            if (text == "Edit") {
              $(this).text("View");
              editFlag = true
            }
            else {
              $(this).text("Edit");
            }

            // If content is diagram
            if (params.contentType == "dm") { 
              var did = self.diagrams[self.selectedDiagramId];
              if (did != undefined) {
                did._setWidgetsOption("editable", editFlag);
                // Handle the diagram menu status
                $(selector).attr("edm", editFlag);
                if (editFlag) {
                  $(".diagram-menu").show();
                  self['ActivateDiagramMenu'](did.options['type']);
                } else {
                  $(".diagram-menu").hide();
                }
              }
            }
            // if content is markdown code
            else if (params.contentType == "md") { 
              self.editMarkdown(selector, params);
            }
          });
        }
      }
      else {
        // It is not possible to edit file if it is defined by sha (and path unknown)
        // or if user is not owner of repository
        var editBullet = (!params.isOwner || params.absPath == undefined) ? "": '<a id="us-link"><span class="us-diagram-edit">Edit</span></a>';
        $(selector).append('<span class="us-diagram-toolbox">\
                              <a id="us-link"><span id="us-getlink">Get link</span></a>\
                              <a id="us-link"><span class="us-diagram-edit" edm="false">Full screen</span></a>\
                              '+ editBullet +'\
                            </span>');


        $(selector + " .us-diagram-edit").click(function() {
            var clonedParams = $.extend(true, {}, params);
            delete clonedParams['selector'];
            // jquery return string for attibute "edm" therefore we have to compare it with 'false'
            clonedParams.editable = params.isOwner ? ($(this).attr("edm") != 'false') : false;
            self.loadContent(clonedParams);
        });
      }
    },
    // Switch markdown to edit mode
    editMarkdown: function(selector, params, editMode) {
      var isEditMode = ($(selector + " div#readme").length == 0),
          self = this;

      if (isEditMode == editMode)
        return;
     
      if (isEditMode) {
        // get entered text
        var data = $(selector + " #markdown").val();

        // Save content in storage cache
        self.views[params.viewid].view.saveContent(params, data);

        // remove edit UI elements
        $(selector + " #markdown").remove();
        $(selector + " span.us-toolbox-header").remove();
        
        // Load an updated markdown
        this.loadMarkdown(selector, params, data);
      }
      else {
        function getSelection() {
          return (!!document.getSelection) ? document.getSelection() :
            (!!window.getSelection) ? window.getSelection() :
            document.selection.createRange().text;
        }

        // toolbox descriptor
        var rrrr = '<span class="us-toolbox-header"><ul style="list-style:none outside none;">\
                        <li class="us-toolbox-button us-toolbox-h1"><a title="Heading 1 [Ctrl+1]" accesskey="1" postfix="\n========\n">First Level Heading</a></li>\
                        <li class="us-toolbox-button us-toolbox-h2"><a title="Heading 2 [Ctrl+2]" accesskey="2" postfix="\n--------\n" href="">Second Level Heading</a></li>\
                        <li class="us-toolbox-button us-toolbox-h3"><a title="Heading 3 [Ctrl+3]" accesskey="3" prefix="### " href="">Heading 3</a></li>\
                        <li class="us-toolbox-button us-toolbox-h4"><a title="Heading 4 [Ctrl+4]" accesskey="4" prefix="#### " href="">Heading 4</a></li>\
                        <li class="us-toolbox-button us-toolbox-h5"><a title="Heading 5 [Ctrl+5]" accesskey="5" prefix="##### " href="">Heading 5</a></li>\
                        <li class="us-toolbox-button us-toolbox-h6"><a title="Heading 6 [Ctrl+6]" accesskey="6" prefix="###### " href="">Heading 6</a>\
                        </li><li class="us-toolbox-separator">&nbsp</li>\
                        <li class="us-toolbox-button us-toolbox-bold"><a title="Bold [Ctrl+B]" accesskey="B" prefix="**" postfix="**">Bold</a></li>\
                        <li class="us-toolbox-button us-toolbox-italic"><a title="Italic [Ctrl+I]" accesskey="I" prefix="_" postfix="_">Italic</a></li>\
                        <li class="us-toolbox-separator">&nbsp</li>\
                        <li class="us-toolbox-button us-toolbox-bullet "><a title="Bulleted List" prefix="- ">Bulleted List</a></li>\
                        <li class="us-toolbox-button us-toolbox-numlist"><a title="Numeric List" prefix="1. ">Numeric List</a></li>\
                        <li class="us-toolbox-separator">&nbsp</li>\
                        <li class="us-toolbox-button us-toolbox-pic"><a title="Picture [Ctrl+P]" accesskey="P" prefix="">Picture</a></li>\
                        <li class="us-toolbox-button us-toolbox-link"><a title="Link [Ctrl+L]" accesskey="L" prefix="">Link</a></li>\
                        <li class="us-toolbox-separator">&nbsp</li>\
                        <li class="us-toolbox-button us-toolbox-quotes"><a title="Quotes" prefix="> ">Quotes</a></li>\
                        <li class="us-toolbox-button us-toolbox-code"><a title="Code Block / Code" prefix="<code>" postfix="</code>">Code Block / Code</a></li>\
                        <li class="us-toolbox-separator">&nbsp</li>\
                      </ul></span><textarea rows="20" cols="80" id="markdown" class="us-markdown-editor"></textarea>';
        $(selector + " div#readme").remove();
        $(rrrr).appendTo(selector);

        self.updateFrameWork(true); // Make text area to fit size of content

        $(selector + " span.us-toolbox-header ul li.us-toolbox-button a")
        .click(function(e) {
           
           var sel = $(selector + " #markdown").getSelection();
           //$(selector + " #markdown").getSelection();
           //alert("CLICKED !!! " + sel.text);
           var prefix = $(this).attr("prefix") || "",
             postfix = $(this).attr("postfix") || "";
           $(selector + " #markdown").wrapSelection(prefix, postfix);
           //alert("add prefix !!! " + $(this).attr("prefix"));

           e.preventDefault();
           e.stopPropagation();
        });

        var viewid = params.viewid;

        self.views[viewid].view.loadContent(params, {
            'success': function(err, data) {
              $(selector + " #markdown").text(data);

              // Update the framework sizes
              self.updateFrameWork(true);
            },
            'error': function() {
            }
        });
     }
    },
    //
    // Universal method to load diagram, code or markdown
    // Unique content id: {ViewId, repository, branch, path from root}.
    // It is not possible to restore path by blob therefore we can't use blobs for wiki-like solutions
    //
    loadContent: function(params, parentParams) {
      var uniqueContentId =  params.viewid + "/" + params.repoId + "/" + params.branch + "/" + params.absPath,
          viewid = params.viewid,
          self = this;
      params.cuid = uniqueContentId;

      // Check if view is really exists: fox example if some diagram contain
      //                                 reference on sourceforge or googlecode
      if (!self.views || !self.views[viewid] || !self.views[viewid].view) {
        alert("View: " + viewid + " was not initialize.");
        return;
      }

      if (params.absPath == undefined && params.relativePath == undefined && params.sha == undefined) {
        alert("Not enough information about loadble content.");
        return;
      }
      
      // Handle the relative path use-case:
      if (parentParams != undefined && params.absPath == undefined && params.relativePath != undefined ) {
        params.absPath = self.views[viewid].view.getContentPath(params, parentParams);
      }

      // work-around for the first content load
      // to prevent diagram menu open over markdown
      this.openDiagramMenuOnFirstInit = params.editable;

      // Check if content was loaded before
      // and select corresponding tab
      // But if diagram should be embedded into markdown
      // then skip this step
      if (self.contents && params.selector == undefined) {
        for (var r in self.contents) {
          var d = self.contents[r];
          if ((d.viewid == params.viewid)  // Github 
              && (d.repoId == params.repoId)   // userid/repo
              && (d.branch == params.branch) // tree/master
              && (d.absPath == params.absPath) // path from root
              )
          { // if
              $("#tabs").tabs('select', r);
              return;
          } // end if
        }
      }

      // Create tab or use an existing selector
      var tabname = params.selector || self.options.tabRight + "-" + self.counter;
      self.counter++;

      // create new tab
      if (params.selector == undefined) {
        tabname = "#" + tabname;
        $("#" + self.options.tabs).tabs("add", tabname, params.title);
        $("#" + self.options.tabs).append('<div id="'+ tabname +'"></div>');

        // Hide diagram menu
        if (params.editable == true || params.editable == "true" ) {
          $(".diagram-menu").show();
        } else {
          $(".diagram-menu").hide();
        }
      }
      
      // Add gif which shows that content is loading
      $('<img id="puh" src="images/Puh.gif"/>').appendTo(tabname);
      
      if (self.views[viewid]) {
        self.views[viewid].view.loadContent(params, {
          'success': function(msg, data) {
            if (params.selector == undefined)
              self.contents[tabname] = params;

            // Simple toolbox for each diagram
            self.appendContentToolbox(tabname, params);

            // Remove puh after JSON load completion
            $(tabname + " #puh").remove();

            var ct = params.contentType;

            if (params.contentType == "dm") {
              self.loadDiagram(tabname, params, data);
            }
            else if (params.contentType == "md") {
              self.loadMarkdown(tabname, params, data);
            }
            else if (params.contentType == "code") {
              self.loadCode(tabname, params, data);
            }
            else {
              alert("Unknown content type: " + params.contentType);
            }

            // Update the framework sizes
            self.updateFrameWork(true);
          },
          'error': function(msg) {
            alert("Failed to load: " + params.absPath + ":\n" + msg);
          }
        });
      }
    },
    //    
    // Load diagram from data:
    //
    // tabname: tab selector
    // 
    // params: { 
    //   viewid - IView.euid
    //   title - the name of file
    //   repo - file's repository
    //   branch - file's branch 
    //   absPath - repo + branch + absolute path
    //   node - dynatree node
    //   selector - jQuery selector to insert diagram
    // }
    // 
    // data: diagram data
    //
    loadDiagram: function(tabname, params, data) {
      var jsonData = (typeof data === "string") ? $.parseJSON(data) : data,
          viewid = params.viewid,
          self = this;

      jsonData.multicanvas = (params.selector != undefined);

      // enable diagram menu
      if (params.selector == undefined)
        $(tabname).attr("edm", params.editable);

      jsonData['fullname'] = params.absPath;
      jsonData['editable'] = true;

      dm.dm.loader.Diagram(
        jsonData.type,
        jsonData.base_type || "base",
        jsonData,
        tabname,
        function(obj) {
          self.diagrams[tabname] = obj; // Keep diagram name

          obj.onDestroy(function() {
            self.views[params.viewid].view.releaseContent(params);
            delete self.diagrams[tabname];
          });

          if (obj.options.multicanvas) {
            self['ActivateDiagramMenu'](obj.options['type']);
            obj.draw();
          }
          obj.options['viewid'] = viewid;
          dm.dm.loader.OnLoadComplete(
            function() {
              obj._setWidgetsOption("editable", params.editable);
            }
          );
        });
    },
    //
    // Load markdown
    //
    loadMarkdown: function(tabname, params, data) {
      var innerHtml = '<div class="us-diagram announce instapaper_body md" data-path="/" id="readme"><span class="name">\
        <span class="mini-icon mini-icon-readme"></span> '+params.absPath+'</span>\
        <article class="markdown-body entry-content" itemprop="mainContentOfPage">\
        '+converter.makeHtml(data)+'\
        </article></div>';

      $(tabname).append(innerHtml); // Markdown loaded
      $(tabname).attr("edm", false);//enable diagram menu is always false for markdown

      var self = this;
      $(tabname + " article.markdown-body .pack-diagram").each(function() {
        var newId = self.options.embedded + "-" + self.counter;
        self.counter++;
        
        var relativePath = $(this).attr("path"),
            sum = $(this).attr("sha"),
            loadParams;
       
        // Initialize load parameter from content or inherit them from parent document
        loadParams = {
          sha:sum,
          relativePath:relativePath,
          repoId:$(this).attr("repo") || params.repoId,
          branch:$(this).attr("branch") || params.branch,
          viewid:$(this).attr("source") || params.viewid,
          title: (relativePath == undefined) ? sum : relativePath.split("/").pop(), // title is the last word separated by slash

          // extra options for content handler
          contentType:"dm", // means diagram
          editable:false,
          selector:tabname + " #" +  newId
        };

        // TODO: What is this string for ?
        $(this).css('padding', '20px').width("1200px").height("600px").css("overflow", "none").css("text-align", "center");
        // replace the default id by unique ID
        $(this).attr("id", newId);

        // all these contents should be embedded
        // diagrams
        dm.dm.fw.loadContent(loadParams, params);
      }); // jQuery.each
    },
    //
    // Load source code and run google prettify on it
    //
    loadCode: function(tabname, params, data) {
      $(tabname).append("<div class='us-diagram'><pre class='prettyprint linenums:1'>" + data + "</pre></div>");
      $(tabname).attr("edm", false);//enable diagram menu is always false for code

      prettyPrint();
 
      self.updateFrameWork(true);
    },

    //
    // Initialize key handler
    //
    initializeKeyHandler: function(Loader) {
      //@ifdef EDITOR
      var fw = this;
      $(window).keydown(function(e) {
        if (e.ctrlKey && e.keyCode == 17) {
          fw.CtrlDown = true;
        } else if (e.keyCode == 46) { // Del
          if (($(".editablefield input").length == 0) && (fw.diagrams[fw.selectedDiagramId] != undefined))  {
            if (fw.diagrams[fw.selectedDiagramId]) {
              fw.diagrams[fw.selectedDiagramId].removeSelectedElements();
            }
          }
        } else if (e.keyCode == 27) { // Esc
          var e = jQuery.Event("blur");
          e.apply = false;      // Do not apply changes
          $(".editablefield input").trigger(e);
        } else if (e.keyCode == 13) { // Enter
          $(".editablefield input").trigger('blur');
        } else if (e.ctrlKey) {
          switch (e.keyCode) {
            case 65:// Handle Ctrl-A
              if (fw.diagrams[fw.selectedDiagramId]) {
                fw.diagrams[fw.selectedDiagramId]._setWidgetsOption("selected", true);
              }
              e.preventDefault();
              break;

            case 67: // Handle Ctrl-C
              // 1. Get focus manager
              // 2. if element ? => copy it on clipboard
              //              stop propagate
              if (fw.diagrams[fw.selectedDiagramId])  {
                $.clippy = fw.diagrams[fw.selectedDiagramId].getDescription("selected", true);
              } else {
                $.clippy = undefined;
              }
              break;
            case 88:
              // Handle Ctrl-X
              // 1. Get focus manager
              // 2. if element ? => copy it on clipboard
              //              stop propagate
              // 3. Remove element
              if (fw.diagrams[fw.selectedDiagramId])  {
                if (fw.diagrams[fw.selectedDiagramId].clickedElement != undefined) {
                  fw.diagrams[fw.selectedDiagramId].clickedElement._update();
                  $.clippy = fw.diagrams[fw.selectedDiagramId].clickedElement.getDescription();
                  $("#" + fw.diagrams[fw.selectedDiagramId].clickedElement.euid + "_Border").remove();
                } else {
                  $.clippy = undefined;
                }
              } else {
                $.clippy = undefined;
              }
              break;
            case 86:// Handle Ctrl-V
              // 1. Get focus manager
              // 2. if diagram ? => try copy element from clipboard
              //              stop propagate if success
              if (($.clippy)  && (fw.diagrams[fw.selectedDiagramId])) {
                // Make selected only inserter items
                fw.diagrams[fw.selectedDiagramId]._setWidgetsOption("selected", false);
                fw.diagrams[fw.selectedDiagramId].multipleSelection = true;
                var obj = $.parseJSON($.clippy),
                es = obj["elements"],
                cs = obj["connectors"];
                for (j in es) {
                  es[j].pageX = parseInt(es[j].pageX) + 10;
                  $.log("pzgeX: " + es[j].pageX);
                  es[j].pageY = parseInt(es[j].pageY) + 10;
                  fw.diagrams[fw.selectedDiagramId].Element(es[j].type, es[j]);
                }

                //for (j in cs)
                //fw.diagrams[fw.selectedDiagramId].Connector(cs[j].type, cs[j]);
                $.clippy = undefined;
              }
              break;
            case 90:// Handle Ctrl-Z
              // 1. Get focus manager
              // 2. if diagram => get operation sequence manager
              //             -> goBack()
              if (fw.diagrams[fw.selectedDiagramId])  {
                fw.diagrams[fw.selectedDiagramId].opman.revertOperation();
              }
              break;
            case 89:// Handle Ctrl-Y
              // 1. Get focus manager
              // 2. if diagram => get operation sequence manager
              //             -> goForward()
              if (fw.diagrams[fw.selectedDiagramId])  {
                fw.diagrams[fw.selectedDiagramId].opman.repeatOperation();
              }
              break;
            case 83:// Handle Ctrl-S
              // 1. Get focus manager
              // 2. if diagram =>  Store the current diagram
              //             -> goBack()
              break;
            default:
              break;
          }
        }
      }
      )
      .keyup(function(e) {
        if (e.keyCode == 17) {
          fw.CtrlDown = false;
        }
      }
      );
      //@endif
    },
    //
    // Initialize toolbox for context menu
    //
    initializeToolBox: function(Loader) {
      var fw=this;
      // Place for logo !!!
      //$("body").append('<img src="./images/logo.png" style="position:fixed;top:0;left:0;"/>');
      $("body").append('<div id="context-toolbox" class="us-context-toolbox">\
          <select name="speedAa" id="speedAa" style="border: 1px solid #B3C7E1;width:60px;"></select>\
          <select name="borderWidth" id="borderWidth" style="border: 1px solid #B3C7E1;"></select>\
          <button class="ui-button"><span class="ui-icon ui-icon-font-big"/></button>\
          <button class="ui-button"><span class="ui-icon ui-icon-font-italic"/></button>\
          <button id="vatop" title="Bring Front" class="ui-button"><span class="ui-icon ui-icon-valign-top"/></button>\
          <button id="vacenter" class="ui-button"><span class="ui-icon ui-icon-valign-center"/></button>\
          <button id="vabottom" title="Bring Back" class="ui-button"><span class="ui-icon ui-icon-valign-bottom"/></button>\
          <button class="ui-button"><span class="ui-icon ui-icon-font-underline"/></button>\
          <button class="ui-button"><span class="ui-icon ui-icon-font-underline"/></button>\
          <button id="color5" title="Color Picker"><span class="color5"/></button></div>');

          /*
  There are two menus required for editable:
  one for text edit
    another for element/connector edit
                    <button class="ui-button"><span class="ui-icon ui-icon-align-left"/></button>\
                    <button class="ui-button"><span class="ui-icon ui-icon-align-center"/></button>\
                    <button class="ui-button"><span class="ui-icon ui-icon-align-right"/></button>\
                    <button class="ui-button"><span class="ui-icon ui-icon-valign-bottom"/></button>
           */

          $("#context-toolbox").click(function(){ $(".context-menu").hide();});
          //                    $("#vp_main_menu_ref").click(function(){
          //                    $( "#vp_main_menu" ).dialog( "open" );
          //                  });

          var allFonts = ["arial", "san serif", "serif", "wide", "narrow", "comic sans ms", "Courier New", "Geramond", "Georgia", "Tahoma", "Trebuchet MS", "Verdana"];
          for (var loop=0; loop<allFonts.length; loop++) {
            var rrr = "<option value=\""+allFonts[loop] +"\">" +allFonts[loop]+"</font></option>";
            $(rrr).css("font-family", allFonts[loop]).appendTo('select#speedAa');
          }

          for (var i=1; i<11;++i) {
            $("#borderWidth").append("<option value='"+ i+"'>" + i +"px</option>");
          }

          $('button#color5').simpleColorPicker({ 'onChangeColor': function(color) {
            if (fw.diagrams[fw.selectedDiagramId])  {
              fw.diagrams[fw.selectedDiagramId]._setWidgetsOption("color", color);
            }
          } });
          $('button#vatop').click(function() {
            if (fw.diagrams[fw.selectedDiagramId])  {
              fw.diagrams[fw.selectedDiagramId]._setWidgetsOption("z-index", "front");
            }
          });
          $('button#vabottom').click(function() {
            if (fw.diagrams[fw.selectedDiagramId])  {
              fw.diagrams[fw.selectedDiagramId]._setWidgetsOption("z-index", "back");
            }
          });

          $("#borderWidth").change(function() {
            if (fw.diagrams[fw.selectedDiagramId])  {
              $.log("diagram ok");
              fw.diagrams[fw.selectedDiagramId]._setWidgetsOption("borderwidth", $(this).val() + "px");
            }
          });

          $("select#speedAa").change(function() {
            $.log("diagram ok");
            if (fw.diagrams[fw.selectedDiagramId])  {
              fw.diagrams[fw.selectedDiagramId]._setWidgetsOption("font-family", $(this).val());
            }
          });


    }
    };

    return getInstance(options);

  };
  //@print

  //@aspect
})(jQuery, dm);

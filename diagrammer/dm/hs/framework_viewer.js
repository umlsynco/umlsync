/*
Class: framework for viewer

Views and diagrams handler.
it is required header, content and bottom options to make it resizeable

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2012 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  http://umlsync.org

Version:
  1.0.0 (2012-11-01)
 */

//@aspect
(function($, dm, undefined) {

//@export:dm.hs.framework:plain
  dm.hs.framework = function(options) {
    var activeNode;
    var converter = new Showdown.converter();
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
      $.extend(true, this.options, options);
      this.counter = 0;
      this.loader = dm.dm.loader;
      this.diagrams = this.diagrams || {};
      this.markdown = this.markdown || {};

      this.initializeToolBox(dm.dm.loader);

      // Think about field set
      $("#" + this.options.content).append('\
          <div id="'+ this.options.content +'-left" style="width:200px;height:100%;padding:0;margin:0;position:absolute;background-color:gray;">\
          <div class="ui-corner-all ui-state-default" style="background-color:white;">\
          <img src="/images/search.png" style="margin-left:10px;"/>\
          <a id="us-search" href="#" style="width:100%;height:30px;color:gray;">Search</a>\
          </div>\
          <div id="accordion" style="background-color:gray;">\
          <h3><a href="#">Repositories</a></h3>\
          <div id="us-repos">\
          <h3><a href="#" id="us-repo-title">Your repositories</a></h3>\
          <div id="us-repos-user"></div>\
          <h3><a href="#" id="us-repo-title">Follow repositories</a></h3>\
          <div id="us-repos-follow"></div>\
          <h3><a href="#" id="us-repo-title">Gist</a></h3>\
          <div id="us-repos-gist"></div>\
          <h3><a href="#" id="us-repo-title">Search repositories</a></h3>\
          <div id="us-repos-search"></div>\
          <h3><a href="#" id="us-repo-title">Eclipse</a></h3>\
          <div id="us-repos-localhost"></div>\
          </div>\
          <h3><a href="#" id="us-active-repo">Active Repository</a></h3>\
          <div id="treetabs"><ul class="us-list" style="display:inline;list-style-type: none;"></ul></div>\
          <h3><a href="#" id="us-loaded">Recently loaded</a></h3>\
          <div id="loadedlist"><ul class="us-list" style="display:inline;list-style-type: none;"></ul></div>\
          </div>\
          </div>\
          <div id="'+ this.options.content +'-left-right-resize" style="width:6px;left:200px;height:100%;position:absolute;padding:0;margin:0;border:0px solid gray;background-color:gray;cursor: col-resize;"></div>\
          <div id="'+ this.options.content +'-right" style="width:100px;left:206px;height:100%;position:absolute;padding:0;margin:0;">\
          <div id="tabs"><ul class="us-frames" style="display:inline;list-style-type: none;"></ul></div>\
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


          /*var $tabs = $("#tabs")
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
                                                        var did = self.diagrams[self.selectedDiagramId];
                                                        if (did) {
//@ifdef EDITOR
                                                          self['ActivateDiagramMenu'](did.options['type']);
//@endif
                                                          did.draw();
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
                                        });*/

          $("#tabs").css({'background-color':'#7E8380'}).css({'background':"none"});
          //$("#tabs").append('<canvas id="SingleCanvas" class="us-canvas" style="left:18px;top:44px;" width="1040" height="600">YOUR BROWSER DOESN\'t SUPPORT CANVAS !!!</canvas>');

          /*
                        $('#tabs span.ui-test').live('click', function() {
                                        var index = $('li', $tabs).index($(this).parent().parent()),
                                            ahref = $(this).parent().parent().children("A:not(.ui-corner-all)").attr("href");
                                        // TODO: Add dialog "Would you like to store diagram ?"
                                        if (self.diagrams && self.diagrams[ahref]) {
//@ifdef EDITOR
                                                if (self.diagrams[ahref].isModified()) {
                                                  alert("SAVE:");
                                                  var diagram = self.diagrams[ahref];
                                              var data = diagram.getDescription();
                          self['saveDiagram'](diagram.options['viewid'], diagram.options['fullname'], data, "Test save/restore !!!");
                                                }
//@endif
                                                delete self.diagrams[ahref];
                                        }
                                        $tabs.tabs('remove', index);
                        });*/
          //$('#accordion').accordion({collapsible:true, heightStyle: "content" });

//////////////////////////init accordion-like solution
          var $acc = $('#accordion');
          $acc.addClass('ui-accordion ui-widget ui-helper-reset ui-accordion-icons');
          $acc.children("h3").addClass('ui-accordion-header ui-helper-reset ui-state-default ui-corner-top').append('<span class="ui-icon ui-icon-triangle-1-s"></span>');
          $acc.children("div").addClass('ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content-active');

//        jQuery(document).ready(function(){
          $("#us-search").editable({onSubmit:function(data) {
            if (data["current"] == data["previous"])
              return;
            self.views['Github'].view.search(data["current"]);
            return true;
          }})
          .click(function(e){e.stopPropagation();}) // Pevent handling by parent DIV
          .parent()
          .click(function(){$("#us-search").trigger('click');}); // Make element editable on click


          $("#us-repos").children("h3").click(function() {
            $(this).next().slideToggle();
          });
          var $bcc = $("#us-repos");
//        $bcc.addClass('ui-accordion ui-widget ui-helper-reset ui-accordion-icons');
          $bcc.css("padding", 0);// make it fit to size
          $bcc.children("h3").addClass('ui-accordion-header ui-helper-reset ui-state-default').append('<span class="ui-icon ui-icon-triangle-1-s"></span>');
          $bcc.children("div").addClass('ui-accordion-content ui-helper-reset ui-widget-content ui-accordion-content-active');

          $acc.children("h3").click(function() {
            if ($(this).hasClass('ui-state-default')) {
              var height = 0;
              $("#accordion .ui-state-active").each(function(){height += $(this).next().height();});
              height = $("#content-left").height() - height - 5*35;

              // Recalculate height if it is too small
              if (height < 100) {
                height = 0;
                $("#accordion .ui-state-active").each(function(){
                  var h = $(this).next().height();
                  if (h > 100) {
                    h = h - 100;
                    $(this).next().animate({"height": "-=" + h}, 'slow');
                    height += 100;
                  } else {
                    height += h;
                  }
                });
                height = $("#content-left").height() - height - 5*35;
              }

              $(this).removeClass('ui-state-default').addClass('ui-state-active');
              $(this).next().css({'height':height}).slideDown('slow');
            } else {
              $(this).removeClass('ui-state-active ui-state-hover').addClass('ui-state-default');
              $(this).next().slideUp('slow');
            }
            return false;
          })
          .hover(
              function() {
                $(this).addClass('ui-state-hover');
              },
              function() {
                $(this).removeClass('ui-state-hover');
              }
          ).next().hide();

//        Activate LAST SEARCH !!!
          $("#us-prev-search").click(function() {
            $('.us-frame').slideUp();
            $(self.LastSearchId+'_p.us-frame').slideDown(); // _p means parent & unique id
          }).css("margin-left", '300px');

          $("#us-print").click(function() {
            self.registerViewManager("http://localhost:8000/vm/", "jsonp");
          });

//        }); document ready
//////////////////////////init accordion-like solution


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
    }

    framework.prototype = {
                           options: {
      tabRight:"diag-",
      tabLeft:"view-",
      tabs:"tabs",
      top:"#content-header",
      bottom:"#content-bottom",
      content:"content"
    },
    // Loading the main menu JSON description and put it as argument to callback function
    //@proexp
    'CreateDiagramMenu':function(type, innerHtml, callback) {
      return;
      var len = $("#accordion").length;
      if (len) {
        $("#accordion").accordion('destroy').append("<h3 aux='"+type+"'><a href='#'>"+type+" diagram</a></h3>"+innerHtml).accordion({'active': len, autoHeight:false});
      } else {
        var header = '<div id="diagram-menu-header" class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix">\
          <span id="ui-dialog-title-vp_main_menu" class="ui-dialog-title">Toolbox</span>\
          <a class="ui-dialog-titlebar-close ui-corner-all" href="#" role="button">\
          <span class="ui-icon ui-icon-closethick">close</span></a></div>';

          $("#tabs").append("<div class='diagram-menu ui-dialog ui-widget ui-widget-content ui-corner-all'>"+header+"<div id='accordion'><h3 aux='"+type+"'><a href='#'>"+type+" diagram</a></h3>"+innerHtml+"</div></div>");
          $("#accordion").accordion({'active': 0, autoHeight:false});
          $(".diagram-menu").draggable({'containment': '#tabs', 'cancel':'div#accordion'});
      }
      if (callback) {
        callback(len); // len == index
      }
    },
    //@proexp
    'ActivateDiagramMenu':function(type) {
      return;
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
      return menuIsActive;
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
          'success':    function(json) {
          // Complete menu update first.
          // And open the default views than.
          for (i in json) {
            if (json[i]['isdefault']) {
              var IView = new dm.base.LocalhostView(self.options.viewmanager + json[i]['id']);
              IView.euid = json[i]['id'];
              self.addView2(json[i]['id'], IView);
              dm.dm.fw.addRepositories(IView.euid, 'localhost', [{full_name:json[i]['title']}]);
            }
          }
        }
        });
      }
    },
    updateFrameWork: function(resizeAll, ui) {
      $.log("updateFrameWork " + resizeAll);
      if (resizeAll) {
        // setup height for content and left - resize -right conent DIV's
        // header border 1px => total 2px (border top, border-bottom)
        // content border 1px => total 2px (border top, border-bottom)
        // and -1 to get real height
        var hhh = $(window).height() - $(this.options.top).outerHeight(true) - 5 - $("#"+this.options.content+"-bottom").outerHeight(true);

        var $ch1 = $("#" + this.options.content).height(hhh)  // set height of middle:  #content
        .children("#" + this.options.content + "-right").height(hhh)  // set height of middle:  #content
        .children("#tabs").height(hhh)                          // #content-left; #content-right; #content-left-right-resize;  No border for this items available
        .children("ul.us-frames").height(hhh - 2)      // 1px solid border defined for .ui-scrollable-tabs
        .children("li.us-frame").height(hhh - 2)      // 1px solid border defined for .ui-scrollable-tabs
        .children("DIV").height(hhh - 8);                // 3px border defined for .ui-tabs BUT if we will shift it than it is possible to observe cool effect

        /*var $ch;
                                if ($ch1.children(".ui-tabs-panel").length) {
                                  hhh = hhh - $ch1.children("ul").height() - 8; //  8 from above and 1 is top padding of ul (which is tabs navigator)
                                  $ch = $ch1.children(".ui-tabs-panel").height(hhh)
                                    .children("div").height(hhh - 24); // Border 1px + padding 11
                                        hhh -= 24;
                                 }*/

        // recalculate the content
        var wd = $("#" + this.options.content).width() - $("#"+ this.options.content+"-left").width() - 6;
        $("#" + this.options.content + "-right").width(wd);

        var canvas = window.document.getElementById('SingleCanvas');
        if (canvas) {
          if ($ch) {
            var s = $ch.offset();
            canvas.left = s.x;
            canvas.top = s.y;
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
      }
      var tabsHeight = $(window).height() - $(this.options.top).outerHeight(true) - 8 - $(this.options.bottom).outerHeight(true);

      $("#tabs").width($("#content").width() - $("#content-left").width() - 13);//.height(tabsHeight);
      $("#tabs .ui-tabs-panel") //.height(tabsHeight-45)
      .children("DIV")
      .width($("#content").width() - $("#content-left").width() - 32);
      //.height($(window).height() - $("#content").position().top - 55 -  $(this.options.bottom).height());
      //$("#treetabs .ui-tabs-panel").height(tabsHeight-45);

    },
    removeRepository: function(viewid, data) { // Remove repo from the list. Applicable for "Repo search" items only
    },
    addSearchResults: function(viewid, word, data) {
      var id = this.options.tabLeft+ this.left_counter;
      this.left_counter++;
      var IView = dm.dm.fw.views[viewid].view;

      $("#tabs ul.us-frames li.us-frame").hide();
      $("#tabs ul.us-frames")
      .append('<li class="us-frame" id="'+id+'_p" style="overflow:scroll;"><div id="'+ id +'" style="margin-left:30px;"></div><li>');
      id = "#" + id;

      var innerHtml = "";
      for (var r in data) {
        innerHtml += '<div class="result">\
        <h2 class="title">\
        <a href="'+data[r]['owner']+'/'+data[r]['name']+'">'+data[r]['owner']+'/ '+data[r]['name']+'</a>\
        <span class="language">' + (data[r]['language'] ? '('+data[r]['language']+')': '') +'</span>\
        <img id="us-repo-add" src="/images/add-repo3.png" title="Add">\
        <img id="us-repo-drop" src="/images/drop-repo.png" title="Drop">\
        <img id="us-repo-view" src="/images/view-repo.png" title="View">\
        </h2>\
        <div class="description">\
        '+data[r]['description']+'\
        </div>\
        <div class="details">\
        '+data[r]['size']+' Kb <span>|</span>\
        '+data[r]['forks']+' forks <span>|</span>\
        '+data[r]['watchers']+' stars <span>|</span>\
        last activity '+data[r]['pushed']+'\
        </div>\
        </div>';
      }

      $(id).append('<div class="container">\
          <div id="code_search">\
          <form method="get" id="search_form" action="#" class="search_repos" accept-charset="UTF-8">\
          <dl class="form">\
          <dt><label for="type_value">Advanced Search</label></dt>\
          <dd>\
          <input type="text" style="width: 34.5em;" value="'+word+'" name="q" class="text">\
          <input type="hidden" value="" name="repo" id="repo_value">\
          <input type="hidden" value="" name="langOverride" id="lang_value">\
          <button type="submit" class="classy">Search</button>\
          <input type="hidden" value="1" name="start_value" id="start_value">\
          </dd>\
          </dl>\
          <dl class="form">\
          <dt><label for="type_value">Search for</label></dt>\
          <dd>\
          <select name="type" id="type_value"><option selected="selected" value="Everything">Everything</option>\
          <option value="Repositories">Repositories</option>\
          <option value="Users">Users</option>\
          <option value="Code">Code</option></select>\
          </dd>\
          </dl>\
          <dl class="form">\
          <dt><label for="language">Search Language</label></dt>\
          <dd>\
          <select id="language" name="language">\
          <option value="">Any Language</option>\
          <optgroup label="Popular">\
          <option value="ActionScript">ActionScript</option>\
          <option value="C">C</option>\
          <option value="C#">C#</option>\
          <option value="C++">C++</option>\
          <option value="Common Lisp">Common Lisp</option>\
          <option value="CSS">CSS</option>\
          <option value="Diff">Diff</option>\
          <option value="Emacs Lisp">Emacs Lisp</option>\
          <option value="Erlang">Erlang</option>\
          <option value="Haskell">Haskell</option>\
          <option value="HTML">HTML</option>\
          <option value="Java">Java</option>\
          <option value="JavaScript">JavaScript</option>\
          <option value="Lua">Lua</option>\
          <option value="Objective-C">Objective-C</option>\
          <option value="Perl">Perl</option>\
          <option value="PHP">PHP</option>\
          <option value="Python">Python</option>\
          <option value="Ruby">Ruby</option>\
          <option value="Scala">Scala</option>\
          <option value="Scheme">Scheme</option>\
          <option value="TeX">TeX</option>\
          <option value="XML">XML</option>\
          </optgroup>\
          <optgroup label="Everything else">\
          <option value="Ada">Ada</option>\
          <option value="Apex">Apex</option>\
          <option value="AppleScript">AppleScript</option>\
          <option value="Arc">Arc</option>\
          <option value="Arduino">Arduino</option>\
          <option value="ASP">ASP</option>\
          <option value="Assembly">Assembly</option>\
          <option value="Augeas">Augeas</option>\
          <option value="AutoHotkey">AutoHotkey</option>\
          <option value="Batchfile">Batchfile</option>\
          <option value="Befunge">Befunge</option>\
          <option value="BlitzMax">BlitzMax</option>\
          <option value="Boo">Boo</option>\
          <option value="Brainfuck">Brainfuck</option>\
          <option value="Bro">Bro</option>\
          <option value="C-ObjDump">C-ObjDump</option>\
          <option value="C2hs Haskell">C2hs Haskell</option>\
          <option value="Ceylon">Ceylon</option>\
          <option value="ChucK">ChucK</option>\
          <option value="Clojure">Clojure</option>\
          <option value="CMake">CMake</option>\
          <option value="CoffeeScript">CoffeeScript</option>\
          <option value="ColdFusion">ColdFusion</option>\
          <option value="Coq">Coq</option>\
          <option value="Cpp-ObjDump">Cpp-ObjDump</option>\
          <option value="Cucumber">Cucumber</option>\
          <option value="Cython">Cython</option>\
          <option value="D">D</option>\
          <option value="D-ObjDump">D-ObjDump</option>\
          <option value="Darcs Patch">Darcs Patch</option>\
          <option value="Dart">Dart</option>\
          <option value="DCPU-16 ASM">DCPU-16 ASM</option>\
          <option value="Delphi">Delphi</option>\
          <option value="Dylan">Dylan</option>\
          <option value="eC">eC</option>\
          <option value="Ecere Projects">Ecere Projects</option>\
          <option value="Ecl">Ecl</option>\
          <option value="Eiffel">Eiffel</option>\
          <option value="Elixir">Elixir</option>\
          <option value="F#">F#</option>\
          <option value="Factor">Factor</option>\
          <option value="Fancy">Fancy</option>\
          <option value="Fantom">Fantom</option>\
          <option value="FORTRAN">FORTRAN</option>\
          <option value="GAS">GAS</option>\
          <option value="Genshi">Genshi</option>\
          <option value="Gentoo Ebuild">Gentoo Ebuild</option>\
          <option value="Gentoo Eclass">Gentoo Eclass</option>\
          <option value="Go">Go</option>\
          <option value="Gosu">Gosu</option>\
          <option value="Groff">Groff</option>\
          <option value="Groovy">Groovy</option>\
          <option value="Groovy Server Pages">Groovy Server Pages</option>\
          <option value="Haml">Haml</option>\
          <option value="HaXe">HaXe</option>\
          <option value="HTML+Django">HTML+Django</option>\
          <option value="HTML+ERB">HTML+ERB</option>\
          <option value="HTML+PHP">HTML+PHP</option>\
          <option value="INI">INI</option>\
          <option value="Io">Io</option>\
          <option value="Ioke">Ioke</option>\
          <option value="IRC log">IRC log</option>\
          <option value="Java Server Pages">Java Server Pages</option>\
          <option value="Julia">Julia</option>\
          <option value="Kotlin">Kotlin</option>\
          <option value="LilyPond">LilyPond</option>\
          <option value="Literate Haskell">Literate Haskell</option>\
          <option value="LLVM">LLVM</option>\
          <option value="Logtalk">Logtalk</option>\
          <option value="Makefile">Makefile</option>\
          <option value="Mako">Mako</option>\
          <option value="Markdown">Markdown</option>\
          <option value="Matlab">Matlab</option>\
          <option value="Max">Max</option>\
          <option value="Mirah">Mirah</option>\
          <option value="Moocode">Moocode</option>\
          <option value="mupad">mupad</option>\
          <option value="Myghty">Myghty</option>\
          <option value="Nemerle">Nemerle</option>\
          <option value="Nimrod">Nimrod</option>\
          <option value="Nu">Nu</option>\
          <option value="NumPy">NumPy</option>\
          <option value="ObjDump">ObjDump</option>\
          <option value="Objective-J">Objective-J</option>\
          <option value="OCaml">OCaml</option>\
          <option value="ooc">ooc</option>\
          <option value="Opa">Opa</option>\
          <option value="OpenCL">OpenCL</option>\
          <option value="OpenEdge ABL">OpenEdge ABL</option>\
          <option value="Parrot">Parrot</option>\
          <option value="Parrot Assembly">Parrot Assembly</option>\
          <option value="Parrot Internal Representation">Parrot Internal Representation</option>\
          <option value="PowerShell">PowerShell</option>\
          <option value="Prolog">Prolog</option>\
          <option value="Puppet">Puppet</option>\
          <option value="Pure Data">Pure Data</option>\
          <option value="R">R</option>\
          <option value="Racket">Racket</option>\
          <option value="Raw token data">Raw token data</option>\
          <option value="Rebol">Rebol</option>\
          <option value="Redcode">Redcode</option>\
          <option value="reStructuredText">reStructuredText</option>\
          <option value="RHTML">RHTML</option>\
          <option value="Rust">Rust</option>\
          <option value="Sage">Sage</option>\
          <option value="Sass">Sass</option>\
          <option value="Scilab">Scilab</option>\
          <option value="SCSS">SCSS</option>\
          <option value="Self">Self</option>\
          <option value="Shell">Shell</option>\
          <option value="Smalltalk">Smalltalk</option>\
          <option value="Smarty">Smarty</option>\
          <option value="Standard ML">Standard ML</option>\
          <option value="SuperCollider">SuperCollider</option>\
          <option value="Tcl">Tcl</option>\
          <option value="Tcsh">Tcsh</option>\
          <option value="Tea">Tea</option>\
          <option value="Textile">Textile</option>\
          <option value="Turing">Turing</option>\
          <option value="Twig">Twig</option>\
          <option value="Vala">Vala</option>\
          <option value="Verilog">Verilog</option>\
          <option value="VHDL">VHDL</option>\
          <option value="VimL">VimL</option>\
          <option value="Visual Basic">Visual Basic</option>\
          <option value="XQuery">XQuery</option>\
          <option value="XS">XS</option>\
          <option value="XSLT">XSLT</option>\
          <option value="YAML">YAML</option>\
          </optgroup>\
          </select>\
          </dd>\
          </dl>\
          </form></div>\
          <div class="clear"></div>\
          <div id="code_search_results">\
          <table width="100%">\
          <tbody><tr><td width="60%" valign="top">\
          <div class="header ui-state-active">\
          <div class="title">Repositories ('+data.length+')</div>\
          <div class="info" style="color:white;">(0.07 seconds)</div>\
          </div>\
          '+innerHtml+'          <div class="more"><a href="https://github.com/search?langOverride=&amp;q=dia&amp;repo=&amp;start_value=1&amp;type=Repositories&amp;utf8=%E2%9C%93" class="more_link">more »</a></div>\
          </td><td width="40%" valign="top">\
          </td></tr>\
          </tbody></table>\
          <br>\
          </div>\
          </div>');

          $(id + " #us-repo-add").click(function() {
            var par = $(this).parent().children('A');
            dm.dm.fw.addRepositories('Github', 'search', [{full_name:par.attr('href')}]);
            $(this).parent().parent().slideUp('slow').delay(1400).remove()

          });
          $(id + " #us-repo-drop").click(function() { var par = $(this).parent().parent();
          par.slideUp('slow').remove();
          });


//        PREVENT SUBMIT CALL VIA HTML GET METHOD
          $(id + " #search_form").submit(function(e) {e.preventDefault();return false;});

//        HANDLE SUBMIT CALL VIA AJAX
          $(id + " #search_form .classy")
          .submit(function(e) {e.preventDefault();return false;})
          .click(function() {
            dm.dm.fw.views['Github'].view.search($(".text").val());
          });

          if (this.LastSearchId)
            $(this.LastSearchId).hide().remove();
          this.LastSearchId = id;
    },
    activateRepository: function(viewid, name) {
      $.log("Activate: " + name);
      var id = this.options.tabLeft+ this.left_counter;
      this.left_counter++;
      var IView = dm.dm.fw.views[viewid].view;

      $("#treetabs ul .us-tree").hide();
      $("#treetabs ul.us-list").append("<li class='us-tree' aux='"+name+"'><div id='"+id+"'></div></li>");
      id = "#" + id;
      //$("#treetabs").tabs("add", id, name);
      //var $treetabs = $("#treetabs");

      $(id).append("<div id='tree'></div>");

      IView.initTree(id + " #tree", name);
    },
    addRepositories: function(viewid, type, data) {
      for (var r in data) {
        if (data[r]['full_name'] == undefined && data[r]['owner'] != undefined) {
          data[r]['full_name'] = data[r]['owner'] + "/" + data[r]['name'];
        }
      }
      self.selector = self.selector || 0;
      self.selector++;
      $("#us-repos-" + type).listmenu({
        selector: "us-selector-" + self.selector,
        selectable: true,
        path:"./",
        data:data,
        onSelect: function(item) {
        $("#us-active-repo").html(item.full_name);
        var found = false;
        $("#treetabs ul.us-list li.us-tree").each(function(){
          if ($(this).attr("aux") == item['full_name']) {
            $(this).slideDown();
            found = true;
          } else {
            $(this).slideUp();
          }
        });
        if (!found) {
          dm.dm.fw.activateRepository(viewid, item['full_name']);
        }
      }
      });

      if (data.length == 1 && viewid == 'pe') {
        dm.dm.fw.activateRepository(viewid, data[0]['full_name']);
        $('#us-active-repo').trigger('click');
      }
    },
    //@proexp
    'addView2': function(name, IView) {

      if (IView.euid != name) {
        alert("Wrong view unique name !!!");
      }

      // Get the list of repositories and register them
      IView.init();

      //TODO: don't load view if name/euid is reserved yet !
      //      it could help to prevent some mess with localhost views
      var self = this;

      function initCtxMenu(vid, items) {
        $('<ul id="view-'+  vid +'" class="context-menu" ></ul>').hide().appendTo('body');
        $("#view-"+vid).listmenu({
          selector: "menu-item",
          path:"./",
          data:items,
          onSelect: function(item) {
          if (item.click) {
            item.click(activeNode)
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
        initCtxMenu(IView.euid, IView.ctx_menu);

        if (IView['element_menu']) {
          self.views[IView.euid]['element_menu'] = {};
          var counter = 0;
          for (r in IView['element_menu']) {
            var rs = r.split(","), // Multiple elements support "Package,Subsystem"
            nm = IView.euid + "-" + counter;
            for (h in rs) {
              self.views[IView.euid]['element_menu'][rs[h]] = nm;
            }
            initCtxMenu(nm, IView['element_menu'][r]);
            counter++;
          }
        }
      }
    },
    'ShowContextMenu': function(name, event, node) {
      $.log("SHOW: " + name);
      $(".context-menu").hide();
      if (name) {
        activeNode = node;
        $("#view-"+name +".context-menu").css("left", event.clientX).css("top", event.clientY).show();
      }
    },
    'ShowElementContextMenu': function(description, viewid, data, event) {
      activeNode = data;
      var self = dm.dm.fw;
      if (self.views && self.views[viewid]
      && self.views[viewid]['element_menu']
      && self.views[viewid]['element_menu'][description]) {
        // Enable the context menu for element
        var uniqueName = "#view-";
        uniqueName += self.views[viewid]['element_menu'][description];// Id of the menu
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
    getActiveView: function() {
      if (this.views["pe"] && this.views["pe"].view) {
        return this.views["pe"].view;
      }
      return null;
    },
    //@proexp
    'checkDiagramName': function(name) {
      var foundName = false;
      $('#' + this.options.tabs + ' ul li a').each(function(i) {
        if (this.text == name) {
          foundName = true;
        }
      });
      return !foundName;
    },
    //@proexp
    'addDiagram': function(baseType, type, name, options) {
      var tabname = this.options.tabRight + this.counter;

      $("#" + this.options.tabs)
      .append('<div id="'+tabname+'"></div>')
      .tabs('add','#'+tabname,name);
      tabname = "#" + tabname;
      //tabs("add", tabname, name);
      this.counter++;
      if (type == "sequence")
        baseType = "sequence";
      var self = this;
      var vid = options.viewid;
      dm.dm.loader.Diagram(type, baseType, $.extend({}, {'editable':true, 'name': name}, options), tabname
          , function(obj) {
        self.diagrams[tabname] = obj;
        self.views[vid].view.save(options.fullname, '{type:"'+type+'",name:"'+name+'"}', "new diagram");
      });
      this.updateFrameWork(true);
    },
    //@proexp
    'saveDiagram': function(viewId, path, data, description) {
      var self = this;
      if (!self.views || !self.views[viewId] || !self.views[viewId].view) {
        alert("View: " + viewId + " was not initialize.");
        return;
      }
      self.views[viewId].view.save(path, data, description);
    },
    //@proexp
    'loadDiagram': function(viewid, repo, path, parent) {
      var self = this,
         absPath = (path.getAbsolutePath) ? path.getAbsolutePath(): path.data.sha;
      if (self.diagrams) {
        for (var r in self.diagrams) {
          var d = self.diagrams[r];
          if ((d.options.viewid == viewid)
              && (d.options.repo == repo)
              && (d.options.fullname == absPath || ((d.options.fullname + ".umlsync") == absPath))) {
            $('.us-frame').slideUp();
            $(r+'_p.us-frame').slideDown(); // _p means parent & unique id
            return;
          }
        }
      }

      var self = this;
      if (!self.views || !self.views[viewid] || !self.views[viewid].view) {
        alert("View: " + viewid + " was not initialize.");
        return;
      }
      if (self.views[viewid])
        self.views[viewid].view.loadDiagram(path, repo, {
          'success': function(err, data) {
          var json = (typeof data ===  "string") ? $.parseJSON(data) : data;
          var tabname = parent;
          var force = true;
          if (parent == undefined) {
            force = false;
            tabname = self.options.tabRight + "-" + self.counter;
            self.counter++;

            $("#" + self.options.tabs + " ul.us-frames li.us-frame").hide();
            $("#" + self.options.tabs + " ul.us-frames").append('<li class="us-frame" id="'+tabname+'_p"><div id="'+ tabname +'"></div><li>');
            tabname = "#" + tabname;
            //$("#" + self.options.tabs).tabs("add", tabname, json.name);

            json['fullname'] = absPath;
          }
          json['multicanvas'] = true;
          json['force'] = force;
          dm.dm.loader.Diagram(json.type, json.base_type || "base", json, tabname
              , function(obj) {
            self.diagrams[tabname] = obj;
            obj.options['viewid'] = viewid;
            obj.options['repo'] = repo;
          });
          self.updateFrameWork(true);
        },
        'error': function() {alert("FAILED to load:" + path);}});
    },
    'loadMarkdown': function(viewid, repo, path) {
      var self = this,
      absPath = repo + "/" + (path.getAbsolutePath ? path.getAbsolutePath() :(path.data.sha || path.data.path)),
      absPath2 = (path.getAbsolutePath ? path.getAbsolutePath() :(path.data.path || path.data.sha));
      if (self.markdown) {
        for (var r in self.markdown) {
          var d = self.markdown[r];
          if ((d.viewid == viewid)
              && (d.repo == repo)
              && (d.fullname == absPath)) {
            $('.us-frame').slideUp();
            $(r+'_p.us-frame').slideDown(); // _p means parrent & unique id
            return;
          }
        }
      }

      if (!self.views || !self.views[viewid] || !self.views[viewid].view) {
        alert("View: " + viewid + " was not initialize.");
        return;
      }

      if (self.views[viewid])
        self.views[viewid].view.loadMarkdown(path, repo, {
          'success': function(err, json) {
          var tabname = self.options.tabRight + "-" + self.counter;
          self.counter++;

          $("#" + self.options.tabs + " ul.us-frames li.us-frame").hide();
          $("#" + self.options.tabs + " ul.us-frames").append('<li class="us-frame" id="'+tabname+'_p" style="overflow:scroll;"><div id="'+ tabname +'" style="margin-left:30px;"></div><li>');
          tabname = "#" + tabname;
          //$("#" + self.options.tabs).tabs("add", tabname, json.name);


          var innerHtml = '<div class="announce instapaper_body md" data-path="/" id="readme"><span class="name">\
            <span class="mini-icon mini-icon-readme"></span> '+absPath2+'</span>\
            <article class="markdown-body entry-content" itemprop="mainContentOfPage">\
            '+converter.makeHtml(json)+'\
            </article></div>';

            $(tabname).append(innerHtml);
            self.markdown[tabname] = self.markdown[tabname] || {repo: repo, fullname : absPath, viewid:viewid};

            var count = 0;
            $(tabname + " article.markdown-body .umlsync-embedded-diagram").each(function() {
              //var repo = $(this).attr("repo"),
              var sum = $(this).attr("sha"),
              relativePath = $(this).attr("path");

              $(this).css('padding', '20px').width("1200px").height("600px").css("overflow", "none").css("text-align", "center");;
              //$(this).id = "asd-" + count;
              //count++;
//            alert("ID:" + $(this).attr("id"));
              dm.dm.fw.loadDiagram(viewid,  repo, {data:{sha:sum, path:relativePath, parentPath:path}}, "#" +  $(this).attr("id"));
            });

            self.updateFrameWork(true);
        },
        'error': function() {alert("FAILED to load:" + path);}});
    },
    //@proexp
    'loadCode': function(viewid, repo, path) {
      var self = this,
      absPath = path.getAbsolutePath();
      if (self.codes) {
        for (var r in self.codes) {
          var d = self.codes[r];
          if ((d.options.viewid == viewid)
              && (d.options.repo == repo)
              && (d.options.fullname == absPath || ((d.options.fullname + ".umlsync") == absPath))) {
            $('.us-frame').slideUp();
            $(r+'_p.us-frame').slideDown(); // _p means parrent & unique id
            return;
          }
        }
      }

      if (!self.views || !self.views[viewid] || !self.views[viewid].view) {
        alert("View: " + viewid + " was not initialize.");
        return;
      }

      if (self.views[viewid])
        self.views[viewid].view.loadCode(path, repo, {
          'success': function(err, json) {
          var tabname = self.options.tabRight + "-" + self.counter;
          self.counter++;

          $("#" + self.options.tabs + " ul.us-frames li.us-frame").hide();
          $("#" + self.options.tabs + " ul.us-frames").append('<li class="us-frame" id="'+tabname+'_p" style="overflow:scroll;"><div id="'+ tabname +'" style="margin-left:30px;"></div><li>');
          tabname = "#" + tabname;
          //$("#" + self.options.tabs).tabs("add", tabname, json.name);

          //json['full_name'] = repo + "/" + absPath;
          $(tabname).append("<pre class='prettyprint linenums:1'>" + json + "</pre>");
          prettyPrint();
          //$(tabname + " code").chili();

          self.updateFrameWork(true);
        },
        'error': function() {alert("FAILED to load:" + path);}});
    },
    initializeKeyHandler: function(Loader) {
//    @ifdef EDITOR
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
          //var e = jQuery.Event("blur");
          //e.apply = false;            // Do not apply changes
          $(".editablefield input").trigger(e);
        } else if (e.keyCode == 13) { // Enter
          //$(".editablefield input").trigger('blur');
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
              //                          stop propagate
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
              //                          stop propagate
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
              //                          stop propagate if success
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
              //                       -> goBack()
              if (fw.diagrams[fw.selectedDiagramId])  {
                fw.diagrams[fw.selectedDiagramId].revertOperation();
              }
              break;
            case 89:// Handle Ctrl-Y
              // 1. Get focus manager
              // 2. if diagram => get operation sequence manager
              //                       -> goForward()
              if (fw.diagrams[fw.selectedDiagramId])  {
                fw.diagrams[fw.selectedDiagramId].repeatOperation();
              }
              break;
            case 83:// Handle Ctrl-S
              // 1. Get focus manager
              // 2. if diagram =>  Store the current diagram
              //                       -> goBack()
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
//    @endif
    },
    initializeToolBox: function(Loader) {
      var fw=this;
      // Place for logo !!!
      //$("body").append('<img src="/images/logo.png" style="position:fixed;top:0;left:0;"/>');
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
//        $("#vp_main_menu_ref").click(function(){
//        $( "#vp_main_menu" ).dialog( "open" );
//        });

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

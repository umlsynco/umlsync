/**
 *   Class: context menu for class element
 * 
 */
(function( $, dm, undefined ) {
    var ctx = dm.ms.ctx;
    ctx.class = function(menuBuilder) {
        var loadUrl = "http://localhost:8000/";//menuBuilder.loader.url;

        return new dm.ms.ctx.common(menuBuilder, {id: "class", uid:"classECtx"}, {
        'Update': {
            click: function(element) {  // element is the jquery obj clicked on when context menu launched
            if (!element.options.viewid
              && !element.parrent.options.viewid) {
              return;
            }
            
            if (!element.options.viewid)
              element.options.viewid = element.parrent.options.viewid;

            if (!element.options.filepath
            || element.options.filepath == "") {
              $.ajax({
                url: loadUrl + "vm/"+element.options.viewid+"/db/class/methods?key="+ element.getName(),
                dataType: "jsonp",
                success: function(data) {
                    if (data && data.filepath) {
						element.options.filepath = data.filepath + "/" + data.title;
                    }
                }
                }).fail(function(x,y,z) {alert("FAILED TO LOAD !!!" + x + y + z);});
                return;
            }

            var fpath = element.options.filepath;
            fpath = (fpath) ? fpath.substr(0, fpath.length - element.options.name.length - 1):"";
            fpath = (fpath) ? "&path="+fpath : "";
            $.ajax({
                url: loadUrl + "vm/"+element.options.viewid+"/db/class/methods?key="+ element.getName() + fpath,
                dataType: "jsonp",
                success: function(data) {
                    var items = [];
                    if (element.addMethod != undefined)  {
                      var items = [];
                      if (data.length == 0)
                        return;
                      //http://sourcenav.svn.sourceforge.net/viewvc/sourcenav/trunk/snavigator/hyper/sn.h?revision=240&view=markup
                      // see ./snavigator/hyper/sn.h for values analysis
                      var mapVisibility = function(vis, vs, sstr) { // s - is short writing
                        var out = "";
                        if (vis & 0x0001) {
                            out = (sstr)?"(-)":"private";
                        } else if (vis & 0x0002) {
                            out = (sstr)?"(#)":"protected";
                        } else if (vis & 0x0004) {
                            out = (sstr)?"(+)":"public";
                        }
                        if (vis & 0x1000) {
                            out = (sstr)?out:"virtual " + out;
                        } else if (vis & 0x0008) {
                            out = (sstr)?out:"static " + out;
                        }
                        return (sstr)? out : out + "(" + vs + ")";
                      }
                      $.each(data, function(k, d) {
                          items.push('<tr><td>' + mapVisibility(parseInt(d.attr), d.attr) + '</td><td>' + d.md + '</td><td>'+ d.ret + '</td><td>'+ d.args +'</td></tr>');
                      }); 

                      var innerHtml = items.join('');
                      innerHtml = "<div id='vp_main_menu2'><div><div class='scrollable' style='scroll:auto;'>\
                            <table id='SearchResultTable' class='tablesorter'><thead><tr class='header'><th>Visibility</th><th>Class</th><th>Return type</th><th>Arguments</th></tr></thead><tbody>\
                            " + innerHtml + "</tbody></table></div>" +
                            "<p><label>Search result: </label><input type='text' maxlength='30' pattern='[a-zA-Z ]{5,}' name='name'></p>" +
                            "<p style='margin: 10px 0; align: middle;'><button class='finish' type='submit' style='background-color:#7FAEFF;cursor:default;'>Finish</button>&nbsp;&nbsp;&nbsp;" +
                            "<button type='submit' class='close'>Cancel</button></p>" +
                            "</div></div>";



                            $('body').append(innerHtml);
                            $("#vp_main_menu2").draggable({cancel: '.scrollable'});
                            $("#vp_main_menu2").overlay({
                                // custom top position
                                top: 150,
                                // some mask tweaks suitable for facebox-looking dialogs
                                mask: {
                                // you might also consider a "transparent" color for the mask
                                color: '#',
                                // load mask a little faster
                                loadSpeed: 200,
                                // very transparent
                                opacity: 0.5
                            },
                            // disable this for modal dialog-type of overlayoverlays
                            closeOnClick: true,
                            // load it immediately after the construction
                            load: true
                            });

                            $("#SearchResultTable").tablesorter({sortList: [[0,0], [1,0]]});

                            $("#vp_main_menu2 .finish").click(function() {
                                var reg = $("#vp_main_menu2 input").val();
                                $.each(data, function(k, d) {
                                    if (reg != '') {
                                        if (d.md.match(reg))
                                            element.addMethod(mapVisibility(parseInt(d.attr), d.attr, true) + " " + d.ret + " " +d.md + "("+ d.args +")");
                                    } else {
                                        element.addMethod(mapVisibility(parseInt(d.attr), d.attr, true) + " " + d.ret + " " +d.md + "("+ d.args +")");
                                    }
                                });
                                $("#vp_main_menu2").remove();
                            });

                            $("#vp_main_menu2 .close").click(function() { $("#vp_main_menu2").remove();});

                  } // element.addmethod
                }
            }).fail(function(x,y,z) {alert("FAILED TO LOAD !!!" + x + y + z);}); // getJSON

            },
            klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
        },
        'Remove': {
            click: function(element) {  // element is the jquery obj clicked on when context menu launched
              menuBuilder.diagram.removeConnector(element.euid, undefined,undefined);
              menuBuilder.diagram.removeConnector(undefined, element.euid, undefined);
              menuBuilder.diagram.removeElement(element.euid);
              //$('#' +   + '_Border').remove();
            },
            klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
        },
        'Add method': {
            click: function(element){ 
            if (element.addMethod != undefined) 
                element.addMethod("private newmothod(int, int, void*)");
            },
            klass: "second-menu-item"
        },
        'Add field': {
            click: function(element){ 
            if (element.addField != undefined) 
                element.addField("private int newfield");
            },
            klass: "second-menu-item"
        },
        'Get base class': {
            click: function(element){
              if (!element.options.viewid
               || !element.options.filepath) {
                return;
                }
                var fpath = element.options.filepath;
                fpath = (fpath) ? fpath.substr(0, fpath.length - element.options.name.length - 1):"";
                fpath = (fpath) ? "&path="+fpath : "";
              $.ajax({
                url: loadUrl + "vm/"+element.options.viewid+"/db/class/base/?key="+ element.getName() + fpath,
                dataType: "jsonp",
                success : function(data) {
                    var items = [];
                    var e2 = $.extend({}, menuBuilder.dmb.getElementById("Class"), {'viewid':element.options.viewid});
                    if (e2 != undefined) {
                      $.each(data,function(k, d) {
                        $.each(d, function(key, val) {
                            e2.pageX = 200;
                            e2.pageY = 200;
                            e2.name = val;
                            var ename = menuBuilder.diagram.Element(e2.type, e2);
                            //menuBuilder.loader.Connector("generalization", {selected: element.id, temporary: ename});
                        });
                      });
                    }
                }
              });
           },
           klass: "second-menu-item"
        },
        'Get realization class': {
            click: function(element){
            if (!element.options.viewid) {
              return;
            }
            var fpath = element.options.filepath;
                fpath = (fpath) ? fpath.substr(0, fpath.length - element.options.name.length - 1):"";
                fpath = (fpath) ? "&path="+fpath : "";
            $.ajax({
                url: loadUrl + "vm/"+element.options.viewid+"/db/class/realization?key="+ element.getName() + fpath,
                dataType: "jsonp",
                success:function(data) {
                  var items = [];
                  var e2 = $.extend({}, menuBuilder.dmb.getElementById("Class"), {'viewid':element.options.viewid});
                  if (e2 != undefined) {

                    var items = [];

                    $.each(data, function(k, d) {
                        items.push('<tr><td>' + d['filepath'] + '</td><td>' + d['title'] + '</td></tr>');
                    }); 

                    var innerHtml = items.join('');
                    innerHtml = "<div id='vp_main_menu2'><div><div class='scrollable' style='scroll:auto;'>\
                            <table id='SearchResultTable' class='tablesorter'><thead><tr class='header'><th>Path</th><th>Class</th></tr></thead><tbody>\
                            " + innerHtml + "</tbody></table></div>" +
                            "<p><label>Search result: </label><input type='text' maxlength='30' pattern='[a-zA-Z ]{5,}' name='name'></p>" +
                            "<p style='margin: 10px 0; align: middle;'><button class='finish' type='submit' style='background-color:#7FAEFF;cursor:default;'>Finish</button>&nbsp;&nbsp;&nbsp;" +
                            "<button type='submit' class='close'>Cancel</button></p>" +
                            "</div></div>";



                            $('body').append(innerHtml);
                            $("#vp_main_menu2").draggable({cancel: '.scrollable'});
                            $("#vp_main_menu2").overlay({
                                // custom top position
                                top: 150,
                                // some mask tweaks suitable for facebox-looking dialogs
                                mask: {
                                // you might also consider a "transparent" color for the mask
                                color: '#',
                                // load mask a little faster
                                loadSpeed: 200,
                                // very transparent
                                opacity: 0.5
                            },
                            // disable this for modal dialog-type of overlayoverlays
                            closeOnClick: true,
                            // load it immediately after the construction
                            load: true
                            });
                            $("#vp_main_menu2 .close").click(function() { $("#vp_main_menu2").remove();});
                            $("#vp_main_menu2 .finish").click(function() { $("#vp_main_menu2").remove();});
                            $("#SearchResultTable").tablesorter({sortList: [[0,0], [1,0]]});
                            $.each(data,function(k, d) {

                                e2.pageX = 200;
                                e2.pageY = 200;
                                e2.name = d['title'];
                                e2.filename = d['filename'];

                                var ename = menuBuilder.diagram.Element(e2.type, e2);
                                //    menuBuilder.loader.Connector("generalization", {selected: ename, temporary: element.euid});
                            });
                    }
                }
              }); // ajax
            },
            klass: "second-menu-item"
        },
        'Get nested class': {
            click: function(element){
              if (!element.options.viewid
               || !element.options.filepath) {
                return;
                }
                var fpath = element.options.filepath;
                fpath = (fpath) ? fpath.substr(0, fpath.length - element.options.name.length - 1):"";
                fpath = (fpath) ? "&path="+fpath : "";
              $.ajax({
                url: loadUrl + "vm/"+element.options.viewid+"/db/class/nested?key="+ element.getName() + fpath,
                dataType: "jsonp",
                success : function(data) {
                    var items = [];
                    var e2 = $.extend({}, menuBuilder.dmb.getElementById("Class"), {'viewid':element.options.viewid});
                    if (e2 != undefined) {
                      $.each(data,function(k, d) {
                        $.each(d, function(key, val) {
                            e2.pageX = 200;
                            e2.pageY = 200;
                            e2.name = val;
                            var ename = menuBuilder.diagram.Element(e2.type, e2);
                            //menuBuilder.loader.Connector("generalization", {selected: element.id, temporary: ename});
                        });
                      });
                    }
                }
              });
            },
            klass: "second-menu-item"
        },
        'Get association class': {
            click: function(element){ alert('second clicked' + element.getAux()); },
            klass: "second-menu-item"
        },
        'Get aggregation class': {
            click: function(element){ alert('second clicked' + element.getAux()); },
            klass: "second-menu-item"
        },
        'Get composition class': {
            click: function(element){ alert('second clicked' + element.getAux()); },
            klass: "second-menu-item"
        }
        });
    };
})(jQuery, dm);
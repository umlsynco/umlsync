/**
  *   Class: context menu for class element
  * 
  */
(function( $, dm, undefined ) {

dm.ms.ctx.sequence = function(menuBuilder) {
  var url = menuBuilder.loader.url;

  return new dm.ms.ctx.common(menuBuilder, {id: "sequence", uid:"sequenceECtx"}, {
           'Open': {
                click: function(element) {  
var name = element.option("name");
                   if ($("#tab-" + name).length == 0) {
                     $("#tabs").tabs('add', '#tab-' + name, name);
                     if (element.options.filepath) {
                        $("#tab-" + name).load('http://localhost:8000/editor/?key=' + element.options.filepath.substr(0, element.options.filepath.length - name.length - 1) +'&project=storageman');
                     }
                   }

                   $("#tabs").tabs('select', '#tab-' + element.option("name"));

               },
               klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
            },
            'Update': {
                click: function(element) {  // element is the jquery obj clicked on when context menu launched

$.getJSON(url + "../../db/class/methods/?key="+ element.getName() + "&project=storageman", function(data) {
                    var items = [];
                    if (element.addMethod != undefined)  {
                      var items = [];
  if (data.length == 0)
    return;
    
    // see ./snavigator/hyper/sn.h for values analysis
    var mapVisibility = function(vis, vs, s) { // s - is short writing
        var out = "";
        if (vis & 0x0001) {
            out = (s)?"(-)":"private";
        } else if (vis & 0x0002) {
            out = (s)?"(#)":"protected";
        } else if (vis & 0x0004) {
            out = (s)?"(+)":"public";
        }
        if (vis & 0x1000) {
            out = (s)?out:"virtual " + out;
        } else if (vis & 0x0008) {
            out = (s)?out:"static " + out;
        }
        return (s)? out : out + "(" + vs + ")";
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
                                 element.addMethod(d.md);
                           } else {
           element.addMethod(d.md);
       }
                     });
          $("#vp_main_menu2").remove();
        });
        
$("#vp_main_menu2 .close").click(function() { $("#vp_main_menu2").remove();});

                    }
                  }); // getJSON
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
            }
        });
}

})(jQuery, dm);

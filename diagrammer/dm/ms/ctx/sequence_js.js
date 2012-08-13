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
                var name = element.getName(),
                    ns = name.split(".");
                  $.log("Update: " + name);
                  if ((ns[0] == "$") || (ns[0] == "jQuery")) {
                    var inst = $;
                    for (i=1; i<s.length; ++i) {
    inst = inst[s[i]];
    if (inst == undefined) {
        return;
    }
                    }
                    
                    $.log("INSTANCE IS: " + inst.prototype);
                    if (inst.prototype != undefined) {
    inst = inst.prototype;
                    }
                      for (g in inst) {
     if ($.isFunction(inst[g])) {
                            element.addMethod(g + "()");
     }
                      }
                    
                  }
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
        });
}

})(jQuery, dm);

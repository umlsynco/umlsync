/**
 *   Class: context menu for class element
 * 
 */
//@aspect
(function( $, dm, undefined ) {
    dm.ms.ctx['class'] = function(menuBuilder) {
        return new dm.ms.ctx.common(menuBuilder, {'id': "class", 'uid':"classECtx"}, {
        'Remove': {
            click: function(element) {  // element is the jquery obj clicked on when context menu launched
              menuBuilder.diagram.removeConnector(element.euid, undefined,undefined);
              menuBuilder.diagram.removeConnector(undefined, element.euid, undefined);
              menuBuilder.diagram.removeElement(element.euid);
            },
            klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
        },
        'Add method': {
            click: function(element){ 
            if (element.addMethod != undefined) 
                element.addMethod("private newmethod(int, int, void*)");
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
        'View specific >>': {
           mouseenter: function(element, event) {  // element is the jquery obj clicked on when context menu launched
                            if (element && element.options) {
                                  var viewid = element.options.viewid || element.parrent.options.viewid;
                                  var p = $(event.currentTarget).offset();
                                  dm.dm.fw.ShowElementContextMenu(element.options.description, viewid, element, {clientX:p.left + $(event.currentTarget).width(), clientY:p.top});
                                }
            },
            klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
           }
        });
    };
//@aspect
})(jQuery, dm);

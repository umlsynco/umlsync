/**
  *   Class: context menu for class element
  * 
  */
//@aspect
(function( $, dm, undefined ) {

dm.ms.ctx['default'] = function(menuBuilder) {
  var url = menuBuilder.loader.url;

  return new dm.ms.ctx.common(menuBuilder, {'id': "default", 'uid':"defaultECtx"}, {
           'Copy  Ctrl-C': {
                click: function(element) {  
                },
                klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
            },
           'Cut   Ctrl-X': {
                click: function(element) {  
                },
                klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
            },
           'Past Ctrl-V': {
                click: function(element) {  
                },
                klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
            },
            'Remove Del': {
                click: function(element) {  // element is the jquery obj clicked on when context menu launched
                    menuBuilder.diagram.removeConnector(element.euid, undefined,undefined);
                    menuBuilder.diagram.removeConnector(undefined, element.euid, undefined);
                    menuBuilder.diagram.removeElement(element.euid);
                    //$('#' +   + '_Border').remove();
                },
                klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
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
}
//@aspect
})(jQuery, dm);

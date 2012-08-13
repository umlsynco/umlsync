/**
  *   Class: context menu for all connectors :)
  *          How to use heritance of context menus ?
  * 
  */
(function( $, dm, undefined ) {

dm.ms.ctx.connector = function(menuBuilder) {
  var self = this;
  return new dm.ms.ctx.common(menuBuilder, {id: "connector", uid:"connectorEUI"}, {
           'Add "Text"': {
                click: function(element, x, y) {
                  if (element.addLable) {
                    element.addLable("Text", x, y);
                  }                  
                },
               klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
            },
            'Remove': {
                click: function(element) {  // element is the jquery obj clicked on when context menu launched
                  element.parrent.removeConnector(element.from, element.toId, element.options.type);
                },
                klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
            },
            'Edit': {
                click: function(element) {  // element is the jquery obj clicked on when context menu launched
                },
                klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
            }
        });
}

})(jQuery, dm);

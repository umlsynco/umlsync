/**
  *   Class: context menu for all connectors :)
  *          How to use heritance of context menus ?
  * 
  */
//@aspect
(function( $, dm, undefined ) {

dm.ms.ctx['connector'] = function(menuBuilder) {
  var self = this;
  return new dm.ms.ctx['common'](menuBuilder, {id: "connector", uid:"connectorEUI"}, [
           {
				title: 'Add "Text"',
                click: function(element, x, y) {
                  if (element.addLable) {
                    element.addLable("Text", x, y);
                  }                  
                }
            },
            {
				title: 'Remove',
                click: function(element) {  // element is the jquery obj clicked on when context menu launched
                  element.parrent.removeConnector(element.from, element.toId, element.options.type);
                }
            },
            {
				title: 'Edit',
                click: function(element) {  // element is the jquery obj clicked on when context menu launched
                }
            }
        ]);
}
//@aspect
})(jQuery, dm);

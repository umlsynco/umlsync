/**
  *   Class: context menu for all connectors
  * 
  */
//@aspect
(function( $, dm, undefined ) {

dm.ms.ctx['connector'] = function(menuBuilder) {
  var self = this;
  return new dm.ms.ctx['common'](menuBuilder, {id: "connector", uid:"connectorEUI"}, [
           {
				title: 'Add "Text"',
                click: function(connector, x, y) {
                  if (connector.addLabel) {
                    connector.addLabel({text:"Text", left:x, top:y});
                  }                  
                }
            },
            {
				title: 'Remove',
                click: function(connector) {  // connector is the jquery obj clicked on when context menu launched
                  connector.parrent.removeConnector(connector.from, connector.toId, connector.options.type);
                }
            },
            {
				title: 'Edit',
                click: function(connector) {  // connector is the jquery obj clicked on when context menu launched
                }
            }
        ]);
}
//@aspect
})(jQuery, dm);

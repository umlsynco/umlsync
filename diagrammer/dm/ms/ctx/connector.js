/**
  *   Class: context menu for all connectors
  * 
  */
//@aspect
(function( $, dm, undefined ) {

dm.ms.ctx['connector'] = function(menuBuilder) {
  return new dm.ms.ctx.common(menuBuilder, {id: "connector", uid:"connectorEUI"}, [
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
                  connector.parrent.removeConnectorById(connector.euid);
                }
            },
            {
                title: 'Edit',
                click: function(connector) {  // connector is the jquery obj clicked on when context menu launched
                }
            }
        ]);
};
//@aspect
})(jQuery, dm);

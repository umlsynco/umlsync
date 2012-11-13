/**
 *   Class: context menu for class element
 * 
 */
//@aspect
(function( $, dm, undefined ) {
    dm.ms.ctx['instance'] = function(menuBuilder) {
        return new dm.ms.ctx.common(menuBuilder, {'id': "instance", 'uid':"instanceECtx"}, [
        {
			title: 'Remove',
            click: function(element) {  // element is the jquery obj clicked on when context menu launched
              menuBuilder.diagram.removeConnector(element.euid, undefined,undefined);
              menuBuilder.diagram.removeConnector(undefined, element.euid, undefined);
              menuBuilder.diagram.removeElement(element.euid);
            }
        },
        {
			title: 'Add stereotype',
            click: function(element){ 
            if (element.addStereotype != undefined) 
                element.addStereotype("interface");
            }
        },
        {
			title: 'Add specification field',
            click: function(element){ 
            if (element.addSpec!= undefined) 
                element.addSpec("Field = VALUE");
            }
        },
        {
		   title: 'View specific >>',
		   //Handle as reference on external menu instead of this stuff (((
           mouseenter: function(element, event) {  // element is the jquery obj clicked on when context menu launched
                            if (element && element.options) {
                                  var viewid = element.options.viewid || element.parrent.options.viewid;
                                  var p = $(event.currentTarget).offset();
                                  dm.dm.fw.ShowElementContextMenu( element.options.title , viewid, element, {clientX:p.left + $(event.currentTarget).width(), clientY:p.top});
                                }
            }
        }
        ]);
    };
//@aspect
})(jQuery, dm);

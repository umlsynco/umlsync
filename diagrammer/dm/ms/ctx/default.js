/**
  *   Class: context menu for class element
  * 
  */
//@aspect
(function( $, dm, undefined ) {

dm.ms.ctx['default'] = function(menuBuilder) {
  var url = menuBuilder.loader.url;

  return new dm.ms.ctx['common'](menuBuilder, {'id': "default", 'uid':"defaultECtx"}, [
           {
				title: 'Copy  Ctrl-C',
                click: function(element) {  
                }
            },
           {
				title: 'Cut   Ctrl-X',
                click: function(element) {  
                }
            },
           {
				title: 'Past Ctrl-V',
                click: function(element) {  
                }
            },
            {
				title: 'Remove Del',
                click: function(element) {  // element is the jquery obj clicked on when context menu launched
                    menuBuilder.diagram.removeConnector(element.euid, undefined,undefined);
                    menuBuilder.diagram.removeConnector(undefined, element.euid, undefined);
                    menuBuilder.diagram.removeElement(element.euid);
                    //$('#' +   + '_Border').remove();
                }
            },
			{
				title: 'View specific >>',
			  mouseenter: function(element, event) {  // element is the jquery obj clicked on when context menu launched
			    if (element && element.options) {
				  var viewid = element.options.viewid || element.parrent.options.viewid;
				  var p = $(event.currentTarget).offset();
				  dm.dm.fw.ShowElementContextMenu(element.options.description, viewid, element, {clientX:p.left + $(event.currentTarget).width(), clientY:p.top});
				}
              }
			}
        ]);
}
//@aspect
})(jQuery, dm);

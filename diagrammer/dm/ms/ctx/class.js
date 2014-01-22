/**
 *   Class: context menu for class element
 * 
 */
(function( $, dm, undefined ) {
    dm.ms.ctx['class'] = function(menuBuilder) {
        return new dm.ms.ctx.common(menuBuilder, {'id': "class", 'uid':"classECtx"}, [
        {
            title: 'Remove',
            click: function(element) {  // element is the jquery obj clicked on when context menu launched
              // Remove all connectors from this element
              lmenuBuilder.diagram.removeConnector(element.euid, undefined,undefined);
              // Remove all connectors to this element
              menuBuilder.diagram.removeConnector(undefined, element.euid, undefined);
              // Remove element
              menuBuilder.diagram.removeElement(element.euid);
            }
        },
/*
        {
            title: 'Template On/Off',
            click: function(element){ 
            if (element.handleTemplate != undefined) 
                element.handleTemplate();
            }
        },
        {
            title: 'Subroutine On/Off',
            click: function(element){ 
            if (element.handleSubroutine != undefined) 
                element.handleSubroutine();
            }
        },
*/
        {
            title: 'Add method',
            click: function(element){ 
            if (element.addOperation != undefined) 
                element.addOperation({text:"private newmethod(int, int, void*)"});
            }
        },
        {
            title: 'Add field',
            click: function(element){ 
            if (element.addAttribute != undefined) 
                element.addAttribute({text:"private int newfield"});
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
})(jQuery, dm);

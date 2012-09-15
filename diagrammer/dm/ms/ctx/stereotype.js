/**
 *   Class: context menu for stereotype element
 * 
 */
//@aspect
(function( $, dm, undefined ) {
    var ctx = dm.ms.ctx;
    ctx['stereotype'] = function(menuBuilder) {
        var loadUrl = "http://localhost:8000/";//menuBuilder.loader.url;

        return new dm.ms.ctx.common(menuBuilder, {id: "stereotype", uid:"stereotypeECtx"}, {
        'Remove': {
            click: function(element) {  // element is the jquery obj clicked on when context menu launched
              menuBuilder.diagram.removeConnector(element.euid, undefined,undefined);
              menuBuilder.diagram.removeConnector(undefined, element.euid, undefined);
              menuBuilder.diagram.removeElement(element.euid);
              //$('#' +   + '_Border').remove();
            },
            klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
        },
        'Add tagged value': {
            click: function(element){ 
            if (element.addTaggedValue != undefined) 
                element.addTaggedValue("tag", "value");
            },
            klass: "second-menu-item"
        }
        });
    };
//@aspect
})(jQuery, dm);

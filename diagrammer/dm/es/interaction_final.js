/**
*  
*/
(function( $, dm, undefined ) {

dm.base.diagram("es.interaction_final", dm.es.element, {
    options: {
        nameTemplate: "interaction_final",
        color: 'white',
        size: '30',
        width: 20,
        height: 20
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-interaction-final us-element-resizable-area">\
                        </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
})(jQuery, dm);

/**
*  
*/
(function( $, dm, undefined ) {

dm.base.diagram("es.interaction_start", dm.es.element, {
    options: {
        nameTemplate: "interaction_start",
        color: 'black',
        size: '30',
        width: 20,
        height: 20
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-interaaction-start us-element-resizable-area">\
                        </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
})(jQuery, dm);

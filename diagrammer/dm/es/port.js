/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("es.port", dm.es.element, {
    options: {
        nameTemplate: "Port",
        width: '20px',
        height: '20px'
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="UMLSyncPort ElementResizeArea grElement">\
    </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    _init: function() {
      $('#' + this.euid  + '_Border')
         .css('width', this.options.width)
         .css('height', this.options.height);
    }
});
})(jQuery, dm);

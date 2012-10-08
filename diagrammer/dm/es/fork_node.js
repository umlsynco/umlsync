/**
   *  
   */
(function( $, dm, undefined ) {

dm.base.diagram("es.fork_node", dm.es.element, {
    options: {
        nameTemplate: "fork_node",
        color: 'black',
        width: '100px',
        height: '4px'
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-forknode us-element-resizable-area"></div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    _init: function() {
      $('#' + this.euid  + '_Border')
         .css('width', this.options.width).css('height', this.options.height);
    }
});
})(jQuery, dm);

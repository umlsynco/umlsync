/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("es.state", dm.es.element, {
    options: {
        nameTemplate: "State",
        height: "50"
    },
    _update: function() {
    
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-state us-element-resizable-area">\
                        <a class="editablefield" style="text-align:left;position:relative;top:30%">' + this.options.name + '</a>\
                        </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
})(jQuery, dm);

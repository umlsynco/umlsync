/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("es.ellipse", dm.es.element, {
    options: {
      nameTemplate: "Ellipse"
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-collaboration us-element-resizable-area">\
	    <a class="editablefield" style="text-align:left;position:relative;top:30%">' + this.options.name + '</a></div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
})(jQuery, dm);

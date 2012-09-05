/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("es.instance", dm.es.element, {
    options: {
        nameTemplate: "Instance"
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="UMLSyncInstance ElementResizeArea grElement">\
                        <a class="editablefield">Instance:' + this.options.name + '</a></div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
})(jQuery, dm);

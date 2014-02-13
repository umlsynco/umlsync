/**
   *  
   */
(function( $, dm, undefined ) {

dm.base.diagram("es.artifact", dm.es.element, {
    options: {
        nameTemplate: "Artifact"
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-component us-element-resizable-area">\
                        <img src="http://umlsync.org/static/images/artifact.png" style="position:absolute;top:3px;right:17px"></img>\
                        <a class="editablefield" style="text-align:left;position:relative;top:30%">&laquo;artifact&raquo;</a><br>\
    <a class="editablefield" style="text-align:left;position:relative;top:30%">' + this.options.name + '</a>\
                        </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
})(jQuery, dm);

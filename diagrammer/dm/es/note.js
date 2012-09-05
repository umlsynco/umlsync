/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("es.note", dm.es.element, {
    options: {
        width: 200,
        height: 76,
        nameTemplate: "Note"
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="UMLSyncNote ElementResizeArea grElement">\
                        <a class="editablefield Name">' + this.options.name + '</a>\
                        <img src="./images/corner.png" class="UMLSyncNoteCorner">\
    </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
})(jQuery, dm);

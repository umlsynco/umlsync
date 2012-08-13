/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("es.interaction", dm.es.element, {
    options: {
        nameTemplate: "Interaction"
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="UMLSyncInteraction ElementResizeArea">\
                        <div class="UMLSyncInteractionHead"><a class="editablefield">' + this.options.name + '</a></div>\
    <ul style="list-style-type:none;padding:0px;" >\
    <li><a class="editablefield">add something</a></li>\
    </ul>\
                        </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
})(jQuery, dm);

/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("es.procedure", dm.es.element, {
    options: {
        nameTemplate: "Procedure"
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-procedure us-element-resizable-area">\
                        <div class="us-entity-header"><a class="editablefield">' + this.options.name + '</a></div>\
    <ul style="list-style-type:none;padding:0px;" >\
    <li ><a class="editablefield">Procedure1()</a></li>\
    <li><a class="editablefield">Procedure2()</a></li>\
    </ul>\
                        </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
})(jQuery, dm);

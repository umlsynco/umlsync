/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("es.resultset", dm.es.element, {
    options: {
        nameTemplate: "ResultSet"
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-resultset us-element-resizable-area">\
                        <div class="us-entity-head"><a class="editablefield">' + this.options.name + '</a></div>\
    <ul style="list-style-type:none;padding:0px;" >\
    <li class="us-entity-field"><a class="editablefield">Column : integer(10)</a></li>\
    <li class="us-entity-field"><a class="editablefield">Column : integer(10)</a></li>\
    </ul>\
                        </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
})(jQuery, dm);

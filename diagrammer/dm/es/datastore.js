/**
   *  
   */
(function( $, dm, undefined ) {

dm.base.diagram("es.datastore", dm.es.element, {
    diagramName: "DataStore",
    diagramEventPrefix: "DS",
    options: {
        aux: "DataStore",
        editable: true        
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-datastore">\
                        <table class="us-element-resizable-area" cellspacing=0 style="margin:0;"><tr><td style="vertical-align:middle;background-color:gray;border-right:1px solid black;width:27px;"><h3>D</h3></td>\
    <td style="vertical-align:middle;"><a class="editablefield">' + this.options.name + '</a></td></tr></table>\
                        </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
})(jQuery, dm);

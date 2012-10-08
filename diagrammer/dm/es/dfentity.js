/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("es.dfentity", dm.es.element, {
    options: {
        nameTemplate: "DFEntity"
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" style="background-color:yellow;border:1px solid black;width:100%;height:100%;">\
                        <table width=100% height=40px class="us-element-resizable-area"><tr><td style="vertical-align:middle;text-align:center;"><a class="editablefield">'+this.options.name+'</a></td></tr></table>\
    </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
})(jQuery, dm);

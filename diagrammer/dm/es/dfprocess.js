/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("es.dfprocess", dm.es.element, {
    options: {
        nameTemplate: "dfprocess"
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-dfprocess">\
                        <div class="us-dfprocess-middle us-element-resizable-area">\
    <table width=100% height=100%><tr><td style="vertical-align:middle;text-align:center;"><a class="editablefield">' + this.options.name + '</a></td></tr></table></div>\
                        </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
})(jQuery, dm);

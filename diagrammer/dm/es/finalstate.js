/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("es.finalstate", dm.es.element, {
    options: {
        nameTemplate: "FinalState"
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" style="width:100%;height:100%;">\
                        <img src="dm/icons/vp/es/common/FinalState.gif"></img>\
                        </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    _init: function() {
      var self = '#' + this.id;    
      $('#' + this.euid + "_Border").bind( "resize", function(event, ui) {
         var w = $(self).width(),
             h = $(self).height();
         var m = w;
         if (w > h ) 
            m = h;
         $(self + " .us-interface").width(m).height(m);

      });
    }
});
})(jQuery, dm);

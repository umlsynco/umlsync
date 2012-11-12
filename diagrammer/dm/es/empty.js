/**
  *  
  */
//@aspect
(function( $, dm, undefined ) {

dm.base.diagram("es.empty", dm.es.element, {
    'options': {
        'nameTemplate': "Interface",
        'width': 16,
        'height': 16
    },
    '_create': function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" style="width:100%;height:100%;" class="us-element-resizable-area">&nbsp</div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    '_init': function() {
      // TODO: REPLACE THIS METHOD ON RESIZE OPTION TO KEEP RATIO
      var self = '#' + this.euid;    
      $('#' + this.euid + "_Border").width(this.options.width).bind( "resize", function(event, ui) {
         var w = $(self).width(),
             h = $(self).height();
         var m = w;
         if (w > h ) 
            m = h;
         $(self + " img"+self +"img").width(m).height(m);
      });

	  if (this.options.name) {
          $("<div id='lable' style=\"position:absolute;top:100%;z-index:99999;\">" + this.options.name + "</div>").appendTo("#" + this.euid).draggable().editable()
      }
    }
});

//@aspect
})(jQuery, dm);

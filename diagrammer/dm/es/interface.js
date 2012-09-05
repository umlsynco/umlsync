/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("es.interface", dm.es.element, {
    options: {
        nameTemplate: "Interface",
        width:'30px',
        height:'30px'
    },
    _update: function() {
       var p = $("#" + this.euid + "_Border").position();
       this.options.pageX = p.left;
       this.options.pageY = p.top;
       this.options.width = $("#" + this.euid + "_Border").width();
       this.options.height = $("#" + this.euid + "_Border").height();

       this.options.name = $("#" + this.euid + " #lable" ).html();
       
    },
    _create: function() {
      this.innerHtml = '<div id="' + this.euid + '" style="width:100%;height:100%;">\
                        <div id="Circle" class="UMLSyncInterface grElement"></div>\
                        </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    _init: function() {
      this.options.width = this.options.height;
      $('#' + this.euid  + '_Border')
         .css('width', this.options.width)
         .css('height', this.options.height);

      $('#' + this.euid + " #Circle")
         .css('width', this.options.width)
         .css('height', this.options.height);

      // TODO: replace on keep ratio option of resize
      var self = '#' + this.euid;
      $('#' + this.euid + "_Border").bind( "resize", function(event, ui) {
         var w = $(self).width(),
             h = $(self).height();
         var m = w;
         if (w > h ) 
            m = h;
         $(self + " .UMLSyncInterface").width(m).height(m);

      });
       $.log("INIT INTERFACE : " + this.options.name);
      if (this.options.name) {
          $("<div id='lable' style=\"position:absolute;top:100%;z-index:99999;\">" + this.options.name + "</div>").appendTo("#" + this.euid).draggable().editable()
      }
    }
});
})(jQuery, dm);

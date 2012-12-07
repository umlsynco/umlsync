/**
  *  
  */
//@aspect
(function( $, dm, undefined ) {

dm.base.diagram("es.circle", dm.es.element, {
    'options': {
        'nameTemplate': "Circle",
        'width':'100px',
        'height':'100px'
    },
    '_update': function() {
       var p = $("#" + this.euid + "_Border").position();
       this.options.pageX = p.left;
       this.options.pageY = p.top;
       this.options.width = $("#" + this.euid + "_Border").width();
       this.options.height = $("#" + this.euid + "_Border").height();

       this.options.name = $("#" + this.euid + " #lable" ).html();
       
    },
    '_create': function() {
      this.innerHtml = '<div id="' + this.euid + '" style="width:100%;height:100%;text-align:center;">\
                        <div id="Circle" class="us-interfaces grElement" >\
						<a class="editablefield Name" style="text-align:center;position:relative;top:30%">' + this.options.name + '</a>\
						</div>\
                        </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    '_init': function() {
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
         $(self + " .us-interfaces").width(m).height(m);

      });

      if (this.options.name) {
          $("#" + this.euid + " .name").val(this.options.name);
      }
	  
	  if (this.options['left']) {
        $('#' + this.euid + "_Border").css("left", this.options['left']);
      }

      if (this.options['top'])
        $('#' + this.euid + "_Border").css('top', this.options['top']);
    }
});

//@aspect
})(jQuery, dm);

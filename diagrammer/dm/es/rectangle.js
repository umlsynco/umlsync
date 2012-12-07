/**
   *  
   */
//@aspect
(function( $, dm, undefined ) {

dm.base.diagram("es.rectangle", dm.es.element, {
    'options': {
      'nameTemplate': "Rectangle",
      'aux': "rectangle",
      'droppable': true,
      'acceptdrop': "rectangle"
    },
    '_update': function() {
        this.options.name = "" + $("#" + this.euid + " .Name" ).html();
       var p = $("#" + this.euid + "_Border").position();
       this.options.pageX = p.left;
       this.options.pageY = p.top;
       this.options.width = $("#" + this.euid + "_Border").width();
       this.options.height = $("#" + this.euid + "_Border").height();
    },
    '_create': function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-component us-element-resizable-area grElement">\
    <a class="editablefield Name" style="text-align:left;position:relative;top:30%">' + this.options.name + '</a>\
                        </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    '_init': function() {
      this.options.dropped = null;
      $('#' + this.euid  + '_Border')
         .css('width', this.options.width);

      $('#' + this.euid  + '_Border .us-component')
         .css('width', this.options.width).css('height', this.options.height);
		 
	  if (this.options['left']) {
        $('#' + this.euid + "_Border").css("left", this.options['left']);
      }

      if (this.options['top'])
        $('#' + this.euid + "_Border").css('top', this.options['top']);
    }
});
//@aspect
})(jQuery, dm);

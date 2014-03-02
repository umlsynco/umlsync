/**
  *  
  */
  
//@aspect
(function( $, dm, undefined ) {
dm.base.diagram("es.port", dm.es.element, {
    'options': {
        'nameTemplate': "Port",
        'width': '20px',
        'height': '20px'
    },
	getSvgDescription: function() {
		var w1 = $("#" + this.euid).width();
		var h1 = $("#" + this.euid).height();
		var p1 = $("#" + this.euid + "_Border").position();
		var	desc = '<rect x="'+ p1.left + '" y="' + p1.top + '" width="' +w1 + '" height="' + h1 + '"/>';
		return desc;
	},
    '_create': function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-port us-element-resizable-area grElement"></div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    '_init': function() {
      $('#' + this.euid  + '_Border')
         .css('width', this.options.width)
         .css('height', this.options.height);
	  if (this.options['left']) {
        $('#' + this.euid + "_Border").css("left", this.options['left']);
      }

      if (this.options['top'])
        $('#' + this.euid + "_Border").css('top', this.options['top']);
    }
});
//@aspect
})(jQuery, dm);

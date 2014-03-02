/**
  *  
  */
//@aspect
(function( $, dm, undefined ) {

dm.base.diagram("es.note", dm.es.element, {
    'options': {
        'width': 200,
        'height': 76,
        'nameTemplate': "Note"
    },

	getSvgDescription: function() {
	    var w1 = $("#" + this.euid).width();
		var h1 = $("#" + this.euid).height();
		var p1 = $("#" + this.euid + "_Border").position();
		var desc = '<polyline points="'+ p1.left + ' ' + p1.top + ',' +
			                            p1.left + ' ' + (p1.top + h1) + ',' +
										(p1.left + w1) + ' ' + (p1.top + h1) + ',' +
										(p1.left + w1) + ' ' + (p1.top + 20) + ',' +
										(p1.left + w1 - 20) + ' ' + p1.top + ',' +
										p1.left + ' ' + p1.top + '"/>';
			desc += '<polyline fill="white" points="'+ (p1.left + w1) + ' ' + (p1.top + 20) + ',' 
			                            + (p1.left + w1 - 20) + ' ' + (p1.top + 20) + ',' 
										+ (p1.left + w1 - 20) + ' ' + p1.top + '"/>';
		return desc;
	},

    '_create': function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-note grElement">\
                        <a id="name" class="editablefield Name">' + this.options['name'] + '</a>\
                        <img src="http://umlsync.org/static/images/corner.png" class="us-note-corner">\
    </div>';
      $("#" + this['parrent'].euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
	'_init': function() {
	  this._setOptions(this.options);
	}
});
//@aspect
})(jQuery, dm);

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
    '_create': function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-note grElement">\
                        <a id="name" class="editablefield Name">' + this.options['name'] + '</a>\
                        <img src="/images/corner.png" class="us-note-corner">\
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

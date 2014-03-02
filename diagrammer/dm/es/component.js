/**
   *  
   */
//@aspect
(function( $, dm, undefined ) {

dm.base.diagram("es.component", dm.es.element, {
    'options': {
      'nameTemplate': "Component",
      'aux': "component",
      'droppable': true,
      'acceptdrop': "component",
	  'height': "100px"
    },
    '_update': function() {
        this.options.name = "" + $("#" + this.euid + " .Name" ).html();
       var p = $("#" + this.euid + "_Border").position();
       this.options.pageX = p.left;
       this.options.pageY = p.top;
       this.options.width = $("#" + this.euid + "_Border").width();
       this.options.height = $("#" + this.euid + "_Border").height();
    },
	getSvgDescription: function() {
		var w1 = $("#" + this.euid).width();
		var h1 = $("#" + this.euid).height();
		var p1 = $("#" + this.euid + "_Border").position();
		var np = $("#" + this.euid + " #name").position();
		var sp = $("#" + this.euid + " #stereotype").position();
		
		var	desc = '<rect x="'+ p1.left + '" y="' + p1.top + '" width="' +w1 + '" height="' + h1 + '"/>';
		desc += '<text x="' + (p1.left + np.left) + '" y="' + (p1.top + np.top + 11) + '">' + $("#" + this.euid + " #name").text() + "</text>";
		desc += '<text x="' + (p1.left + sp.left) + '" y="' + (p1.top + sp.top + 11) + '">' + $("#" + this.euid + " #stereotype").text() + "</text>";
	    desc += '<rect fill="white" height="17" stroke="black" stroke-width="1" width="12" x="'+(p1.left+ w1 -20) +'" y="'+(p1.top + 5)+'" />';
	    desc += '<rect fill="white" height="4" stroke="black" stroke-width="1" width="7" x="'+(p1.left+ w1 -22)+'" y="'+(p1.top + 8)+'" />';
	    desc += '<rect fill="white" height="4" stroke="black" stroke-width="1" width="7" x="'+(p1.left+ w1 -22)+'" y="'+(p1.top + 15)+'" />';
		return desc;
	},
    '_create': function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-component grElement">\
                        <img src="http://umlsync.org/static/images/component.png" style="position:absolute;top:3px;right:17px"></img>\
                        <a id="stereotype" class="editablefield" style="text-align:left;position:relative;top:30%">&laquo;interface&raquo;</a><br>\
                        <a id="name" class="editablefield Name" style="text-align:left;position:relative;top:30%">' + this.options.name + '</a>\
                        </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    '_init': function() {
      this.options.dropped = null;
      this._setOptions(this.options);
    }
});
//@aspect
})(jQuery, dm);

/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("es.instance", dm.es.element, {
    options: {
        nameTemplate: "Instance"
    },
    _create: function() {
	  var spec = "";
      for (var i in this.options['specification']) {
          spec += '<li><a class="editablefield specification">' + this.options['specification'][i] + '</a></li>';
      }
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-instance us-element-resizable-area grElement">\
                        <div style="padding:10px;border-bottom:1px solid black;"><a class="editablefield">&nbsp&nbsp&nbsp&nbsp</a><b>:</b><a id="name" class="editablefield" style="border-bottom:1px solid black;">' + this.options.name + '</a></div>'
						+ '<div class="us-instance-spec us-element-resizable-area"><ul class="us-sortable">'
						spec +'</ul></div></div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
	getSvgDescription: function() {
		var w1 = $("#" + this.euid).width();
		var h1 = $("#" + this.euid).height();
		var p1 = $("#" + this.euid + "_Border").position();
		var np = $("#" + this.euid + " #name").position();
		
		var	desc = '<rect x="'+ p1.left + '" y="' + p1.top + '" width="' +w1 + '" height="' + h1 + '"/>';
		desc += '<text x="' + (p1.left + np.left) + '" y="' + (p1.top + np.top + 11) + '">' + $("#" + this.euid + " #name").text() + "</text>";
		return desc;
	},
	_init: function() {
	  $("#" + this.euid + " .us-instance-spec .us-sortable").sortable().disableSelection();
	  if (this.options['left']) {
        $('#' + this.euid + "_Border").css("left", this.options['left']);
      }

      if (this.options['top'])
        $('#' + this.euid + "_Border").css('top', this.options['top']);
	},
	addSpec: function(desc) {
       var hg = $('<li><a class="editablefield specification" >' + desc + '</a></li>').appendTo("#" + this.euid + " .us-instance-spec .us-sortable").find("a").editable().height();
       var h1 = $("#" + this.euid + " .us-instance-spec .us-sortable").sortable("refresh").height();
	       h2 = $("#" + this.euid + " .us-instance-spec").height();
	   if (h1 > h2) {
		 $("#" + this.euid + "_Border").height("+="+ hg);
		 $("#" + this.euid).height("+="+ hg);
	     $("#" + this.euid + " .us-instance-spec ").height("+=" + hg);
	   }
	}
});
})(jQuery, dm);

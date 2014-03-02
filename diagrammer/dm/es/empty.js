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
    '_update': function() {
       var p = $("#" + this.euid + "_Border").position();
       this.options.pageX = p.left;
       this.options.pageY = p.top;
       this.options.width = $("#" + this.euid + "_Border").width();
       this.options.height = $("#" + this.euid + "_Border").height();

	   p = $("#" + this.euid + " #name" ).position();
	   this.options.nameX = p.left;
	   this.options.nameY = p.top;
       
    },
	getSvgDescription: function() {
		var p1 = $("#" + this.euid + "_Border").position();
		var np = $("#" + this.euid + " #name").position();
		return '<text x="' + (p1.left + np.left) + '" y="' + (p1.top + np.top + 11) + '">' + $("#" + this.euid + " #name").text() + "</text>";
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
          var self = this;
          $("<div id='name' style=\"position:absolute;top:100%;z-index:99999;top:"+this.options.nameY+"px;left:"+this.options.nameX+"px;\">" + this.options.name + "</div>")
		  .appendTo("#" + this.euid)
		  .draggable({
			  start: function(event, ui) {
			    $(this).data('startPosition', ui.helper.position());
			  },
			  stop: function(event, ui) {
				var pos = $(this).data("startPosition");
				var p = ui.helper.position();
				self.parrent.opman.reportShort("#name", self.euid, {left:pos.left, top:pos.top}, {left:p.left, top:p.top});
			  }
			})
		  .editable({onSubmit:function(data) {
				    if (data["current"] == data["previous"])
					  return;
					var id = $(this).attr("id");
				    self.options[id] = data["current"];
					self.parrent.opman.reportShort("~"+id, self.euid, data["previous"], data["current"]);
					return true;
			}});
      }
    },
    _setOption2: function(key, value) {
       if (key == "editable") {
         $("#" + this.euid + " #name")
         .draggable("option", "disabled", !value)
         .editable(value ? "enable":"disable");
       }
       return false;
    }
});

//@aspect
})(jQuery, dm);

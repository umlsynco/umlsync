/**
  *  
  */
//@aspect
(function( $, dm, undefined ) {

dm.base.diagram("es.interface", dm.es.element, {
    'options': {
        'nameTemplate': "Interface",
        'width':'30px',
        'height':'30px'
    },
	getSvgDescription: function() {
		var w1 = $("#" + this.euid).width()/2;
		var h1 = $("#" + this.euid).height()/2;
		var p1 = $("#" + this.euid + "_Border").position();
		var np = $("#" + this.euid + " #name").position();
		var desc = '<circle cx="'+ (p1.left + w1) + '" cy="' + (p1.top + h1) + '" r="' +w1 + '"/>';
		desc += '<text x="' + (p1.left + np.left) + '" y="' + (p1.top + np.top + 11) + '">' + $("#" + this.euid + " #name").text() + "</text>";
		return desc;
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
    '_create': function() {
      this.innerHtml = '<div id="' + this.euid + '" style="width:100%;height:100%;">\
                        <div id="Circle" class="us-interface grElement"></div>\
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

	 if (this.options["background-color"]) {
	   $('#' + this.euid + " #Circle")
         .css('background-color', this.options["background-color"]);
	  }

      $('#' + this.euid + "_Border").bind( "resize", "#" + this.euid, function(event, ui) {
         var w = $(event.data).width(),
             h = $(event.data).height();
         var m = w;
         if (w > h)
            m = h;
         $(event.data).children(".us-interface").width(m).height(m);

      });

	  if (this.options['left']) {
        $('#' + this.euid + "_Border").css("left", this.options['left']);
      }

      if (this.options['top'])
        $('#' + this.euid + "_Border").css('top', this.options['top']);
	  
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
			}})
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

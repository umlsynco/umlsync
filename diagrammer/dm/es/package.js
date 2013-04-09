/**
  *  
  */
//@aspect
(function( $, dm, undefined ) {
dm.base.diagram("es.package", dm.es.element, {
    'options': {
        'nameTemplate': "Package",
        'droppable': true,
        'acceptdrop': "package",
        'height': "102px"
    },
    '_update': function() {
       var p = $("#" + this.euid + "_Border").position();
       this.options.pageX = p.left;
       this.options.pageY = p.top;
       this.options.left = p.left;
       this.options.top = p.top;
       this.options.width = $("#" + this.euid + "_Border").width();
       this.options.height = $("#" + this.euid + "_Border").height();

       // Height of packet body. Width is the same for all part of element
       this.options.height_b = $("#" + this.euid + "_Border .us-package-body").height();
       
       if (this._dropped) {
         this.options.dropped = new Array();
         for (i in this._dropped) {
           this.options.dropped.push(this.parrent.elements[this._dropped[i]].options.id);
         }
       }
    },
    '_create': function() {
      // HTML for class structure creation
      var aux = (this.options.aux != undefined) ? "<a>&lt&lt" + this.options.aux + "&gt&gt</a><br><b>" : "";
      this.innerHtml = '<div id="' + this.euid + '" class="us-package">\
                                <div class="us-package-tab grElement"></div>\
            <div class="us-package-body grElement">'
            + aux + 
            '<a id="name" class="editablefield">'+ this.options.name + '</a></div>\
                                </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    '_init': function() {
	  this._setOptions(this.options);
    },
    '_setOption2': function( key, value ) {
		if (key == "color") {
            $("#" + this.euid + " .us-package-tab").css("background-color", value);
            $("#" + this.euid + " .us-package-body").css("background-color", value);
			return true;
        } else if (key == "borderwidth") {
            $("#" + this.euid + " .us-package-tab").css("border-width", value);
            $("#" + this.euid + " .us-package-body").css("border-width", value);
			return true;
        } else if (key == "font-family") {
          $("#" + this.euid).css(key, value);
		  return true;
        } if (key == "z-index") {
          $("#" + this.euid + '_Border ').css(key, value);
		  return true;
        }
        return false;
    }
});
//@aspect
})(jQuery, dm);

/**
  *  
  */
//@aspect
(function( $, dm, undefined ) {
dm.base.diagram("es.llalt", dm.es.element, {
    'options': {
        'nameTemplate': "Alt",
        'height_b': "100%",
		'width':'300px',
		'single': true, // no connection possible
		'cancel':'.us-package-body'
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
       this.options.name = $("#" + this.euid + " .us-package-body .editablefield" ).html();
       
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
            <div class="us-package-body us-element-resizable-area"><div style="width:100%;height:50%;border-bottom:1px dashed black;">[<a class="editablefield">if</a>]</div>'
            + aux + 
            '[<a class="editablefield">else</a>]</div>\
            <div class="us-alt-tab"><b>Alt</b><img src="images/cornerb.png" style="position:absolute;bottom:-1px;right:-1px;"></div>\
                                </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    '_init': function() {
	  this._setOptions(this.options);
    },
    '_setOption2': function( key, value ) {
        this.options[ key ] = value;

        if (key == "width") {
		  $('#' + this.euid  + '_Border').css('width', this.options.width);
          $('#' + this.euid  + '_Border .us-package-body').css('width', value);
		  return true;
        } else if (key == "height_b") {
          $('#' + this.euid  + '_Border .us-package-body').css('height', value);
		  return true;
        }  else if (key == "height") {
          $('#' + this.euid  + '_Border').css('height', value);
		  return true;
        } else if (key == "color") {
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
        } else if (key == "z-index") {
          $("#" + this.euid + '_Border ').css(key, value);
		  return true;
        }
        return false;
    }
});
//@aspect
})(jQuery, dm);

/**
  *  
  */
//@aspect
(function( $, dm, undefined ) {
dm.base.diagram("es.llalt", dm.es.element, {
    'options': {
        'nameTemplate': "Alt",
        'height_b': "100%",
		'borderwidth': "2",
		'width':'300px',
		'single': true, // no connection possible
		'cancel':'.us-alt-body'
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
       this.options.height_b = $("#" + this.euid + "_Border .us-alt-body").height();
       this.options.name = $("#" + this.euid + " .us-alt-body .editablefield" ).html();
       
       if (this._dropped) {
         this.options.dropped = new Array();
         for (i in this._dropped) {
           this.options.dropped.push(this.parrent.elements[this._dropped[i]].options.id);
         }
       }
    },
	getAlt: function() {
	  if (this.options.title == "Loop")
	    return 'Loop(<a class="editablefield">' + 10 + '</a>)';
	  if (this.options.title == "Parallel")
	    return 'par';
	  if (this.options.title == "Option")
	    return 'opt';
	  return this.options.title;
	},
	getCond: function() {
	  if (this.options.title == "Alt")
	    return '<div id="us-dashed" style="width:100%;height:50%;border-bottom:1px dashed black;">[<a id="ifcond" class="editablefield">if</a>]</div>[<a id="elsecond" class="editablefield">else</a>]';

	  if (this.options.title == "Option" || this.options.title == "Loop" || this.options.title == "Break")
        return '[<a id="cond" class="editablefield">condition</a>]';

  	 if (this.options.title == "Parallel" || this.options.title == "Strict")
        return '<div id="us-dashed" style="width:100%;height:30%;border-bottom:1px dashed black;"></div><div id="us-dashed" style="width:100%;height:30%;border-bottom:1px dashed black;"></div>';
	},
    '_create': function() {
      // HTML for class structure creation
      var aux = (this.options.aux != undefined) ? "<a>&lt&lt" + this.options.aux + "&gt&gt</a><br><b>" : "";
      this.innerHtml = '<div id="' + this.euid + '" class="us-package">\
            <div class="us-alt-body us-element-resizable-area">'+
			this.getCond() +
            '</div><div class="us-alt-tab"><b>'+this.getAlt()+'</b><img src="http://umlsync.org/sttaic/images/cornerb.png" style="position:absolute;bottom:-1px;right:-1px;"></div>\
            </div>';

      $("#" + this.parrent.euid).append(this.innerHtml);

      $("#"+this.euid + " #us-dashed").resizable({'handles': 's-l', stop:function() {$(this).width("100%")}});

      this.element = $("#"  + this.euid);
    },
    '_init': function() {
	  this._setOptions(this.options);
    },
    '_setOption2': function( key, value ) {
        this.options[ key ] = value;

        if (key == "width") {
		  $('#' + this.euid  + '_Border').css('width', this.options.width);
          $('#' + this.euid  + '_Border .us-alt-body').css('width', parseInt(value) - this.options.borderwidth*2);
		  return true;
        } else if (key == "height_b") {
          $('#' + this.euid  + '_Border .us-alt-body').css('height', value).css('height', "-=" + this.options.borderwidth*2);
		  return true;
        }  else if (key == "height") {
          $('#' + this.euid  + '_Border').css('height', value);
		  return true;
        } else if (key == "color") {
            $("#" + this.euid + " .us-alt-tab").css("background-color", value);
			return true;
        } else if (key == "borderwidth") {
            $("#" + this.euid + " .us-package-tab").css("border-width", value);
            $("#" + this.euid + " .us-alt-body").css("border-width", value);
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

/**
  *  
  */
//@aspect
(function( $, dm, undefined ) {

dm.base.diagram("es.class", dm['es']['element'], {
    'options': {
        'nameTemplate': 'Class',
        'width': '150px',
        'height': '64px'
    },
    '_getAux': function(aux) {
      var auxmap = [];
      auxmap["Class"] = "";
      auxmap["Interface"] = "interface";
      auxmap["Enumeration"] = "enum";
      auxmap["Primitive"] = "primitive";
      auxmap["ORM"] = "ORM";
      auxmap["ORMComponent"] = "ORMComponent";
      auxmap["Template"] = " ";
      auxmap[undefined] = "";

      return auxmap[aux] || aux;
    },
//@ifdef EDITOR
    'addMethod': function(desc) {
	   if (this.options['aux'] == "Enumeration")
	     return;
       $('<li><a class="editablefield operation" >' + desc + '</a></li>').appendTo("#" + this.euid + " .us-class-operations .us-sortable").find("a").editable();
       $("#" + this.euid + " .us-class-operations .us-sortable").sortable("refresh");
    },
    'addField': function(desc) {
	   if (this.options['aux'] == "Interface")
	     return;
       $('<li><a class="editablefield attribute" >' + desc + '</a></li>').appendTo("#" + this.euid + " .us-class-attributes .us-sortable").find("a").editable();
       $("#" + this.euid + ".us-class-attributes .us-sortable").sortable("refresh");
    },
    '_update': function() {
       var p = $("#" + this.euid + "_Border").position();

       this.options['pageX'] = p.left;
       this.options['pageY'] = p.top;
       this.options['left'] = p.left;
       this.options['top'] = p.top;
       this.options['width'] = $("#" + this.euid + "_Border").width();
       this.options['height'] = $("#" + this.euid + "_Border").height();

       // Height of attributes and operations. Width is the same for all components
       this.options['height_a'] = $("#" + this.euid + "_Border .us-class-attributes").height();
       this.options['height_o'] = $("#" + this.euid + "_Border .us-class-operations").height();

       this.options['name'] = "" + $("#" + this.euid + " .us-class-name" ).html();
//       this.options['aux'] = $("#" + this.euid + " .us-class-header .us-class-aux" ).html();
       this.options['operations'] = new Array();
       this.options['attributes'] = new Array();
       var self = this;
       
       $("#" + this.euid + " .us-class-operations .operation").each(function(i) {
         self.options['operations'].push($(this).html());
       });

       $("#" + this.euid + " .us-class-attributes .attribute").each(function(i) {
         self.options['attributes'].push($(this).html());
       });
    },
//@endif
    '_create': function() {
	   var templ = "",
	       aux = "";
       if (this.options['aux'] && (this.options['aux'] != "")) {
	       var aux2 = this._getAux(this.options['aux']);
		   if (aux2 != undefined && aux2 != "" && aux2 != " ") {
             aux = "&lt&lt " + aux2 + " &gt&gt";
		   }
		   templ = (this.options['aux'] != 'Template') ? "" : "<div class='editablefield us-class-template'>" + (this.options['template'] || "T")+"</div>";
       }

       var operations = "",
           attributes = "";

        for (var i in this.options['operations']) {
           operations += '<li><a class="editablefield operation">' + this.options['operations'][i] + '</a></li>';
        }
    
        for (var i in this.options['attributes']) {
           attributes += '<li><a class="editablefield attribute">' + this.options['attributes'][i] +'</a></li>';
        }

      // HTML for class structure creation
      this.innerHtmlClassInfo = '\
        <div id="' + this.euid + '" class="us-class grElement">'+ templ+'\
        <div class="us-class-header">\
        <a class="editablefield us-class-name">' + this.options['name'] + '</a><br>\
        <a class="us-class-aux">'+ aux +'</a>\
        </div>\
        <div class="us-class-attributes"><ul class="us-sortable">' +  attributes + '</ul></div>\
        <div class="us-class-operations us-element-resizable-area"><ul class="us-sortable">' +  operations + '</ul></div>\
        </div>\
      ';
      $("#" + this['parrent'].euid).append(this.innerHtmlClassInfo);

      this.element = $("#"  + this.euid);
    },
    '_init': function() {
		this._setOptions(this.options);
 //@ifdef EDITOR
      if (this['parrent'].options['editable']) {
      
         var border = "#"+this.euid + "_Border";
         var self = this;
         // stop-function is a fix for attributes area which became not resizizable with black points after internal resize usage
         $("#"+this.euid + " .us-class-attributes").resizable({'handles': 's-l',
		                                                   'alsoResize': border,
		                                                   'stop': function(event, ui) {
                                                                $("#"+self.euid + " .us-class-attributes").css({'width':"100%"}); } });
/*         $("#"+this.euid + " .us-class-operations").resizable({'handles': 's-l', 'alsoResize': border,
														   'resize': function(event, ui) { if ($(border).width() < ui.size.width) $(this).width($(border).width());}
											   
		 });
*/         
         $("#" + this.euid + " .us-class-operations .us-sortable").sortable().disableSelection();
         $("#" + this.euid + " .us-class-attributes .us-sortable").sortable().disableSelection();
      }
//@endif
    },
	_setOption2:function(key, value) {
	  if (key == "height_o") {
        $('#' + this.euid  + '_Border .us-class-operations').css('height', this.options['height_o']);
		return true;
	  } else if (key == 'height_a') {
         $('#' + this.euid  + '_Border .us-class-attributes').css('height', this.options['height_a']);
		 return true;
	  }
	  return false;
	},
	
//@ifdef EDITOR
    'getName': function() {
      this.options['name'] = "" + $("#" + this.euid + " .us-class-name" ).html();
      return this.options['name'];
    },
    'getAux': function() {
      return $("#" + this.euid + " .us-class-header .us-class-aux" ).html();
    },
//@endif
    'ec': 0
});


//@aspect
})(jQuery, dm);

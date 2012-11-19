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
    'addOperation': function(opt) {
	   if (this.options['aux'] == "Enumeration")
	     return;
	   var self = this;
       var hg = $('<li id="operation"><a id="operation'+this.opN+'" class="editablefield operation" >' + opt.text + '</a></li>')
	            .appendTo("#" + this.euid + " .us-class-operations .us-sortable")
				.children("a")
				.editable({onSubmit:function(data) {
				    if (data["current"] == data["previous"])
					  return;
					var id = $(this).attr("id");
				    self.options[id] = data["current"];
					self.parrent.opman.reportShort("~"+id, self.euid, data["previous"], data["current"]);
					return true;
	             }})
				.height();
	   ++this.opN;
       var h1 = $("#" + this.euid + " .us-class-operations .us-sortable").sortable("refresh").height(),
	       h2 = $("#" + this.euid + " .us-class-operations").height(),
		   h3, h4;
	   if (h1 > h2 ) {
	     h3 = $("#" + this.euid + "_Border").height();
		 $("#" + this.euid + "_Border").height("+="+ hg);
	     $("#" + this.euid + " .us-class-operations").height("+=" + hg);
		 h4 = $("#" + this.euid + "_Border").height();
		 this.options.height = h4;
		 this.options.height_o += hg;
	   }
	   
	   this.parrent.opman.startTransaction();
	   this.parrent.opman.reportShort("+operation",
	                                  this.euid,
									  {idx:$("#" + this.euid + " .operation").length-1, text:opt.text});
	   if (h1 > h2 ) {
         this.parrent.opman.reportShort("option",
		                                this.euid,
		 							    {height: h3},
										{height: h4});
       }
       this.parrent.opman.stopTransaction();
    },
	'rmOperation': function(opt) {
       $("#"+this.euid+" .us-class-operations ul li:eq(" + opt.idx + ")").remove();
	},
	'moveOperation': function(start, stop) {
	  var s1 = $("#"+this.euid+" .us-class-operations ul li:eq(" + stop.idx + ")");
	  var s2 = $("#"+this.euid+" .us-class-operations ul li:eq(" + start.idx + ")");
	  if (stop.idx < start.idx) {
	    s1.insertAfter(s2);
	  } else {
	    s1.insertBefore(s2);
	  }
	},
    'addAttribute': function(opt) {
	   if (this.options['aux'] == "Interface")
	     return;
	   var self = this;
       var hg = $('<li id="attribute"><a id="attribute'+this.atrN+'" class="editablefield attribute" >' + opt.text + '</a></li>')
	   .appendTo("#" + this.euid + " .us-class-attributes .us-sortable")
	   .children("a")
	   .editable({onSubmit:function(data) {
				    if (data["current"] == data["previous"])
					  return;
					var id = $(this).attr("id");
				    self.options[id] = data["current"];
					self.parrent.opman.reportShort("~"+id, self.euid, data["previous"], data["current"]);
					return true;
	             }})
	   .height();
	   this.atrN++;

       var h1 = $("#" + this.euid + " .us-class-attributes .us-sortable").sortable("refresh").height(),
	       h2 = $("#" + this.euid + " .us-class-attributes").height(),
		   h3, h4;

	   if (h1 > h2) {
	     h3 = $("#" + this.euid + "_Border .us-class-attributes").height();

		 $("#" + this.euid + "_Border").height("+="+ hg);
	     $("#" + this.euid + " .us-class-attributes").height("+=" + hg);

		 h4 = $("#" + this.euid + "_Border .us-class-attributes").height();
		 this.options.height_a = h4;
		 this.options.height += $("#" + this.euid + "_Border").height();;
	   }

	   this.parrent.opman.startTransaction();
	   this.parrent.opman.reportShort("+attribute",
                                      this.euid,
									  {idx:$("#" + this.euid + " .attribute").length-1,
									   text:opt.text});
	   if (h1 > h2 ) {
         this.parrent.opman.reportShort("option",
		                                this.euid,
		 							    {height_a: h3},
										{height_a: h4});
       }
       this.parrent.opman.stopTransaction();
    },
    'rmAttribute': function(opt) {
	  $("#"+this.euid+" .us-class-attributes ul li:eq(" + opt.idx + ")").remove();
	},
	'moveAttribute': function(start, stop) {
	  var s1 = $("#"+this.euid+" .us-class-attributes ul li:eq(" + stop.idx + ")");
	  var s2 = $("#"+this.euid+" .us-class-attributes ul li:eq(" + start.idx + ")");
	  if (stop.idx < start.idx) {
	    s1.insertAfter(s2);
	  } else {
	    s1.insertBefore(s2);
	  }
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
	   this.atrN = 0;
	   this.opN = 0;

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
           operations += '<li id="operation"><a id="operation'+this.atrN+'" class="editablefield operation">' + this.options['operations'][i] + '</a></li>';
		   this.atrN++;
        }
    
        for (var i in this.options['attributes']) {
           attributes += '<li id="attribute"><a id="attribute'+this.opN+'" class="editablefield attribute">' + this.options['attributes'][i] +'</a></li>';
		   this.opN++;
        }

      // HTML for class structure creation
      this.innerHtmlClassInfo = '\
        <div id="' + this.euid + '" class="us-class grElement">'+ templ+'\
        <div class="us-class-header">\
        <a id="name" class="editablefield us-class-name">' + this.options['name'] + '</a><br>\
        <a id="aux" class="us-class-aux">'+ aux +'</a>\
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
		this.attributes = new Array();
		this.operations = new Array();

 //@ifdef EDITOR
      if (this['parrent'].options['editable']) {
      
         var border = "#"+this.euid + "_Border";
         var self = this;
         // stop-function is a fix for attributes area which became not resizizable with black points after internal resize usage
         $("#"+this.euid + " .us-class-attributes")
		 .resizable({'handles': 's-l',
		             'alsoResize': border,
                     'start': function() {
					    self._update();
                        self.operation_start = {height_a:self.options.height_a};
			            $("#tabs #us-editable input").hide();  // TODO: send blur to editable ? 
                     },
                     'stop': function(event, ui) {
			           self._update();
			           self.parrent.opman.reportShort("option",
			                                 self.euid,
											 self.operation_start,
											 {height_a:self.options.height_a});
                       $("#"+self.euid + " .us-class-attributes").css({'width':""});
			         }
					}); // resizable
/*         $("#"+this.euid + " .us-class-operations").resizable({'handles': 's-l', 'alsoResize': border,
														   'resize': function(event, ui) { if ($(border).width() < ui.size.width) $(this).width($(border).width());}
											   
		 });
*/         

        this.sortableHandler = {
		  start: function(event, ui) {
		           var start_pos = ui.item.index();
                   ui.item.data('start_pos', start_pos);
		         },
		  stop: function(event, ui) {
			      var start_pos = ui.item.data('start_pos'),
				      index = ui.item.index();
				  if (index != start_pos) {
					self.parrent.opman.reportShort("%"+ui.item.attr("id"), self.euid, {idx: start_pos}, {idx:index});
				  }
			}
		};
		
         $("#" + this.euid + " .us-class-operations .us-sortable")
		.sortable(this.sortableHandler)
		.disableSelection()
		.each(function($item) {self.operations.push($item);})
		.children('A')
		.editable({onSubmit:function(data) {
				    if (data["current"] == data["previous"])
					  return;
					var id = $(this).attr("id");
				    self.options[id] = data["current"];
					self.parrent.opman.reportShort("~"+id, self.euid, data["previous"], data["current"]);
					return true;
	             }});

		$("#" + this.euid + " .us-class-attributes .us-sortable")
		.sortable(this.sortableHandler)
		.disableSelection()
        .each(function($item) {self.attributes.push($item);})
		.children('A')
		.editable({onSubmit:function(data) {
				    if (data["current"] == data["previous"])
					  return;
					var id = $(this).attr("id");
				    self.options[id] = data["current"];
					self.parrent.opman.reportShort("~"+id, self.euid, data["previous"], data["current"]);
					return true;
	             }});
      }
//@endif
    },
	_setOption2:function(key, value) {
	  if (key == "height_o") {
        $('#' + this.euid  + '_Border .us-class-operations').css('height', value);
		return true;
	  } else if (key == 'height_a') {
	     var oval = this.options[key];
         $('#' + this.euid  + '_Border .us-class-attributes').css('height', value);

		 var v = parseInt(value) - parseInt(oval);
		 var inc=(v>0)? ("+=" + v) : ("-=" + Math.abs(v));

         $('#' + this.euid  + '_Border').css('height', inc);
		 return true;
	  }/* else if (key.indexOf('height') == 0) {
	     var diff = parseInt(value) - parseInt(this.options['height_a']) - $('#' + this.euid + ' .us-class-header').height();
		 if (diff > 0)
           $('#' + this.euid  + '_Border .us-class-operations').css('height', diff);
	  }*/
	  return false;
	},
	
//@ifdef EDITOR
    'getName': function() {
      this.options['name'] = "" + $("#" + this.euid + " .us-class-name" ).html();
      return this.options['name'];
    },
    'getAux': function() {
      return $("#" + this.euid + " .us-class-header .us-class-aux").html();
    },
//@endif
    'ec': 0
});


//@aspect
})(jQuery, dm);

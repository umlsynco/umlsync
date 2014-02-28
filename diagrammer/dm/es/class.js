/**
  *  
  */
(function( $, dm, undefined ) {

dm.base.diagram("es.class", dm['es']['element'], {
    'options': {
        'nameTemplate': 'Class',
        'width': '150px',
        'height': 'auto'
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
    handleTemplate: function() {
        var template = $("#" + this.euid + " .us-class-template");
        if (template.length != 0) {
          this.rmTemplate();
        }
        else {
          this.addTemplate();
        }
    },
    addTemplate:function(opt) {
      dm.base.editable(this, $("<div id='template' class='editablefield us-class-template'>Template</div>").appendTo($("#" + this.euid)));
      this.options["aux"] = "Template";
    },
    rmTemplate:function(opt) {
      var template = $("#" + this.euid + " .us-class-template");
      if (template.length != 0) {
        template.remove();
        this.options["aux"].splice();
      }
    },
    //
    // On/Off subroutin UI element of class
    //
    handleSubroutine: function() {
    },
    addSubroutine:function() {
    },
    rmSubroutine:function() {
    },
    showContextMenu: function(selector, e) {
        var self = this,
            diag = this.parrent;
        if ($("#us-class-ctx-menu").length == 0) {
          var innerHtml = '<ul id="us-class-ctx-menu" class="context-menu">\
                             <li id="us-class-ctx-menu-edit"><a>Edit</a></li>\
                             <li id="us-class-ctx-menu-add"><a>Add</a></li>\
                             <li id="us-class-ctx-menu-remove"><a>Remove</a></li>\
                           </ul>';
          $(innerHtml).appendTo("#" + self.parrent.euid);
          $("#" + self.parrent.euid + " #us-class-ctx-menu li a").hover(function() {$(this).addClass('hover')}, function() {$(this).removeClass('hover')});

          var hideMenuSelector = "#" + diag.euid + " #us-class-ctx-menu";
          // Edit - simple trigger of click
          $("#" + self.parrent.euid + " #us-class-ctx-menu-edit a").click(function(e) {$(hideMenuSelector).hide();$("#" + diag.euid + " " + diag.classItem).click()});
          
          // Add - should call addOperation method of selected class
          $("#" + self.parrent.euid + " #us-class-ctx-menu-add a")
          .click(function(e) {
             // hide the context menu
             $(hideMenuSelector).hide();

             // Identify class euid in secure way
             if (diag.classItem == undefined || diag.classItem == null) {
               return;
             }

             var ssel = diag.classItem.split(" ");
             if (ssel.length != 2) {
               return;
             }

             var seuid = ssel[0].substring(1);
             var el = diag.elements[seuid];

             // if element euid is wrong or wring element
             if (el == undefined || el.addOperation == undefined)
               return;

             if (diag.classItem.indexOf("operation") !== -1) {
               el.addOperation({text:"private newmethod(int, int, void*)"});
             } else {
               el.addAttribute({text:"private int newfield"});
             }
          });
          $("#" + self.parrent.euid + " #us-class-ctx-menu-remove a")
          .click(function(e) {
            $(hideMenuSelector).hide();
             // Identify class euid in secure way
             if (diag.classItem == undefined || diag.classItem == null) {
               return;
             }

             var ssel = diag.classItem.split(" ");
             if (ssel.length != 2) {
               return;
             }

             var seuid = ssel[0].substring(1);
             var el = diag.elements[seuid];

             // if element euid is wrong or wring element
             if (el == undefined || el.addOperation == undefined)
               return;

             if (diag.classItem.indexOf("operation") !== -1) {
               el.rmOperation({selector:diag.classItem});
             } else {
               el.rmAttribute({selector:diag.classItem});
             }
          });
        }

        diag.classItem = selector;
        $(".context-menu").hide(); // hide all context menus
        var pos = $("#" + self.parrent.euid).offset();
        $("#us-class-ctx-menu").css({top:e.pageY-pos.top, left:e.pageX-pos.left}).show();

        e.stopPropagation(); // prevent class menu showing
        e.preventDefault();  // prevent default context menu showing
    },
//@endif
    'addOperation': function(opt) {
      if (this.options['aux'] == "Enumeration")
        return;
      var self = this;
      var idx = (opt.idx == undefined) ? this.opN : opt.idx;

      // Ctrl-Z/Y support
      var old_id;
//@ifdef EDITOR
      if (opt.id) {
        ld_id = opt.id;
        this.options.operations.splice(opt.idx, 0, opt.text);
      }
      else
//@endif
       {
        old_id  = ('operation-'+this.opN);
        ++this.opN;
        this.options.operations.push(opt.text);
      }



       var $op = $('<li id="operation"><a id="'+old_id+'" class="editablefield operation" >' + opt.text + '</a></li>'),
           $idx = $("#" + this.euid + " .us-class-operations .us-sortable li:eq("+idx+")");
       
       // if index not found
       if ($idx.length == 1) {
         $op.insertAfter($idx);
       }
       else {
         $op.appendTo("#" + this.euid + " .us-class-operations .us-sortable");
       }

       $op = $op.children("a");

       var hg = $op
//@ifdef EDITOR
                 .bind('contextmenu', function(e) {
                    self.showContextMenu("#" + self.euid + " #" + this.id, e)
                 })
//@endif
                 .height();

       dm.base.editable(this, $op, true);

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
//@ifdef EDITOR
       this.parrent.opman.startTransaction();
       this.parrent.opman.reportShort("+operation",
                                      this.euid,
                                      {idx:$("#" + this.euid + " .operation").length-1, text:opt.text, id: old_id});
       if (h1 > h2 ) {
         this.parrent.opman.reportShort("option",
                                        this.euid,
                                         {height: h3},
                                        {height: h4});
       }
       this.parrent.opman.stopTransaction();
//@endif
    },
//@ifdef EDITOR
    'rmOperation': function(opt) {
       // selector is path to ul>li>a object
       if (opt.selector) {
         var text = $(opt.selector).text();
         var idx = $(opt.selector.split(" ")[0] + " li").index($(opt.selector).parent());

         // Update options
         this.options.operations.splice(idx, 1);

         // Report operation.
         this.parrent.opman.reportShort("-operation",
                                      this.euid,
                                      {idx:idx, text:text, id: opt.selector.split(" ")[1].substring(1)});
         // It is necessary to remove li object
         // but selector refs to li>a
         $(opt.selector).parent().remove();
       }
       else {
         // It is not necessary to report operation
         // because this case happen on revert operation only
         $("#"+this.euid+" .us-class-operations ul li:eq(" + opt.idx + ")").remove();
       }

       // Refresh sortable after item removal
       $("#" + this.euid + " .us-class-operations .us-sortable").sortable("refresh");
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
//@endif
    'addAttribute': function(opt) {
       if (this.options['aux'] == "Interface")
         return;
       var self = this;
       var old_attr;
//@ifdef EDITOR
       if (opt.id) {
         old_attr = opt.id;
       } else
//@endif
       {
         old_attr = 'attribute-'+this.atrN;
         ++this.atrN;
       }
       var idx = (opt.idx == undefined) ? this.atrN : opt.idx;
       var $ch = $('<li id="attribute"><a id="'+ old_attr +'" class="editablefield attribute" >' + opt.text + '</a></li>'),
          $idx = $("#" + this.euid + " .us-class-attributes .us-sortable li:eq("+idx+")");
       
       // if index not found
       if ($idx.length == 1) {
         $ch = $ch.insertAfter($idx);
       }
       else {
         $ch = $ch.appendTo("#" + this.euid + " .us-class-attributes .us-sortable");
       }

//@ifdef EDITOR
       $ch = $ch.children("a");
       $ch.bind('contextmenu', function(e) {
         self.showContextMenu("#" + self.euid + " #" + this.id, e)
       });

       // Common approach for editable
       dm.base.editable(this, $ch, true);
//@endif
       var hg = $ch.height();
       

       var h1 = $("#" + this.euid + " .us-class-attributes .us-sortable").sortable("refresh").height(),
           h2 = $("#" + this.euid + " .us-class-attributes").height(),
           h3, h4;

       if (h1 > h2) {
         h3 = $("#" + this.euid + "_Border .us-class-attributes").height();

         $("#" + this.euid + "_Border").height("+="+ hg);
         $("#" + this.euid + " .us-class-attributes").height("+=" + hg);

         h4 = $("#" + this.euid + "_Border .us-class-attributes").height();
         this.options.height_a = h4;
         this.options.height = $("#" + this.euid + "_Border").height();
       }
//@ifdef EDITOR
       this.parrent.opman.startTransaction();
       this.parrent.opman.reportShort("+attribute",
                                      this.euid,
                                      {idx:$("#" + this.euid + " .attribute").length-1,
                                       text:opt.text,
                                       id: old_attr});
       if (h1 > h2 ) {
         this.parrent.opman.reportShort("option",
                                        this.euid,
                                        {height_a: h3},
                                        {height_a: h4});
       }
       this.parrent.opman.stopTransaction();
//@endif
    },
//@ifdef EDITOR
    'rmAttribute': function(opt) {
       // selector is path to ul>li>a object
       if (opt.selector) {
         var text = $(opt.selector).text();
         var idx = $(opt.selector.split(" ")[0] + " li").index($(opt.selector).parent());

         // Update options
         this.options.attributes.splice(idx, 1);
         
         // Report attribute.
         this.parrent.opman.reportShort("-attribute",
                                      this.euid,
                                      {idx:idx, text:text, id: opt.selector.split(" ")[1].substring(1)});
         // It is necessary to remove li object
         // but selector refs to li>a
         $(opt.selector).parent().remove();
       }
       else {
         // It is not necessary to report attribute
         // because this case happen on revert attribute only
         $("#"+this.euid+" .us-class-attributes ul li:eq(" + opt.idx + ")").remove();
       }

       // Refresh sortable after item removal
       $("#" + this.euid + " .us-class-attributes .us-sortable").sortable("refresh");
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
    _update: function() {
       var p = $("#" + this.euid + "_Border").position();

       this.options['pageX'] = parseInt(p.left);
       this.options['pageY'] = parseInt(p.top);
       this.options['left'] = parseInt(p.left);
       this.options['top'] = parseInt(p.top);
       this.options['width'] = parseInt($("#" + this.euid + "_Border").width());
       this.options['height'] = parseInt($("#" + this.euid + "_Border").height());

       // Height of attributes and operations. Width is the same for all components
       this.options['height_a'] = parseInt($("#" + this.euid + "_Border .us-class-attributes").height());
       this.options['height_o'] = parseInt($("#" + this.euid + "_Border .us-class-operations").height());
       
       // Operations and attributes should be up to date

//       this.options['name'] = "" + $("#" + this.euid + " .us-class-name" ).html();
//       this.options['aux'] = $("#" + this.euid + " .us-class-header .us-class-aux" ).html();
 //      this.options['operations'] = new Array();
 //      this.options['attributes'] = new Array();
       var self = this;
       /*
       $("#" + this.euid + " .us-class-operations .operation").each(function(i) {
         self.options['operations'].push("" + dm.base.convert($(this).html()));
       });

       $("#" + this.euid + " .us-class-attributes .attribute").each(function(i) {
         self.options['attributes'].push("" + dm.base.convert($(this).html()));
       });
       */
    },
//@endif
    '_create': function() {
       var templ = "",
           aux = "";
       this.atrN = 0;
       this.opN = 0;

       // Work-around for get description methods
       this.options.operations = this.options.operations || new Array();
       this.options.attributes = this.options.attributes || new Array();

       if (this.options['aux'] && (this.options['aux'] != "")) {
           var aux2 = this._getAux(this.options['aux']);
           if (aux2 != undefined && aux2 != "" && aux2 != " ") {
             aux = "&lt&lt " + aux2 + " &gt&gt";
           }
           templ = (this.options['aux'] != 'Template') ? "" : "<div id='template' class='editablefield us-class-template'>" + (this.options['template'] || "T")+"</div>";
       }

       var operations = "",
           attributes = "";

        for (var i in this.options['operations']) {
           operations += '<li id="operation"><a id="operation-'+this.atrN+'" class="editablefield operation">' + this.options['operations'][i] + '</a></li>';
           this.atrN++;
        }
    
        for (var i in this.options['attributes']) {
           attributes += '<li id="attribute"><a id="attribute-'+this.opN+'" class="editablefield attribute">' + this.options['attributes'][i] +'</a></li>';
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

//@ifdef EDITOR
      this.element
      .children('#operation')
      .children("a")
      .bind('contextmenu', function(e) {
        self.showContextMenu("#" + self.euid + " #" + this.id, e);
      });
      
      this.element
      .children('#attribute')
      .children("a")
      .bind('contextmenu', function(e) {
        self.showContextMenu("#" + self.euid + " #" + this.id, e);
      });
//@endif
    },
    '_init': function() {
        this._setOptions(this.options);
        this.attributes = new Array();
        this.operations = new Array();

       if (this['parrent'].options['editable']) {
      
         var border = "#"+this.euid + "_Border";
         var self = this;
         // stop-function is a fix for attributes area which became not resizizable with black points after internal resize usage
//@ifdef EDITOR
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
                      index = ui.item.index(),
                      type = ui.item.attr("id").split("-")[0];
                  if (index != start_pos) {
                    // Update options values to keep them up to date
                    var tmp = self.options[type + "s"][start_pos];
                    self.options.operations.splice(start_pos, 1);
                    self.options.operations.splice(index, 0, tmp);

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
//@endif
      }
    },
    _setOption2:function(key, value) {
      if (key == "height_o") {
        $('#' + this.euid  + '_Border .us-class-operations').css('height', value);
        return true;
      } else if (key == 'height_a') {
         var oval = this.options[key];
         $('#' + this.euid  + '_Border .us-class-attributes').css('height', value);

         var v = parseInt(value) - parseInt(oval);
         
         if (v != 0) {
           var inc=(v>0)? ("+=" + v) : ("-=" + Math.abs(v));

           $('#' + this.euid  + '_Border').css('height', inc);

           // Change the default height value too
           this.options['height'] += v;
        }

         return true;
      }
      else if (key == "editable") {
        // do not return true because it is only part of 
        // transition to none-editable
        $("#" + this.euid + " .us-sortable").sortable({ disabled: (value == true) ? false:true });
      }
      /* else if (key.indexOf('height') == 0) {
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
	getSvgDescription: function() {
	    var w1 = $("#" + this.euid).width();
		var h1 = $("#" + this.euid).height();
		var p1 = $("#" + this.euid + "_Border").position();
		var desc = '<g id="class-'+this.options.id+'">';
		    desc += '<desc>' + this.getDescription() + '</desc>';
			desc += '<rect width="'+w1 + '" height="' + h1 + '" x="' + p1.left + '" y="' + p1.top + '" />';
		var $name = $("#" + this.euid + " #name"),
		    p = $name.position();
		var font_y = p1.top + parseInt($name.css("font-size")) + p.top;
			desc += '<text id="name" x="' + (p1.left + p.left) + '" y="' + font_y + '" fill="black">'+this.options.name+'</text>';
		var $attr = $("#" + this.euid + " .us-class-attributes");
		p = $attr.position();
		var p2 = p;
		var ggg = $attr.height();
			desc += '<rect width="'+w1 + '" height="' + $attr.height() + '" x="' + p1.left + '" y="' + (p1.top + p.top + 2) + '" />';
		$("#" + this.euid + " .us-class-attributes ul li a").each(function(k, el) {
			  var p = $(el).position();
			  var font_y = p1.top + p2.top + parseInt($name.css("font-size")) + p.top;
			  var ttt = $(el).text();
			  var t2  = $(el).val();
			  desc += '<text x="' + (p1.left + p.left) + '" y="' + font_y + '" fill="black">'+$(el).text()+'</text>';
			}
		);
		var $opp = $("#" + this.euid + " .us-class-operations");
		
		var p3 = $opp.position();
		p = p3;
		var bbb = $opp.height();
			desc += '<rect width="'+w1+ '" height="' + ($opp.height() + 3) + '" x="' + p1.left + '" y="' + (p1.top + p.top) + '" />';

		$("#" + this.euid + " .us-class-operations ul li a").each(function(k, el) {
			  var p = $(el).position();
			  var font_y = p1.top + p3.top + parseInt($name.css("font-size")) + p.top;
			  var ttt = $(el).text();
			  var t2  = $(el).val();
			  desc += '<text x="' + (p1.left + p.left) + '" y="' + font_y + '" fill="black">'+$(el).text()+'</text>';
			}
		);
		desc += '</g>';
		return desc;

	}, 
//@endif
    'ec': 0
});

})(jQuery, dm);

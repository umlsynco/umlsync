/**
  *  
  */
(function( $, undefined ) {
dm.base.diagram("es.objinstance", dm.es.element, {
	options: {
		nameTemplate: "Object",
	    acceptdrop: "package",
		top_min: 40,
		height: 400,
        resizable_h: 'e-u,e-ul,s-u,w-u,w-ul,sw-u,se-u',
		axis: 'x'
	},
	_create: function() {
	  // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-element-resizable-area" style="width:100%;">\
                        <div class="us-instance-line"></div>\
	                    <div id="' + this.euid + '_NEXT" class="us-instance grElement" style="height:40px;">\
	                    <div><a id="name" class="editablefield Name">:' + this.options.name+ '</a></div></div></div>';
	  $("#" + this.parrent.euid).append(this.innerHtml);
	  this.element = $("#"  + this.euid);
	},
	_init: function () {
      if (this.options.height)
	    $('#' + this.euid)
	     .css('width', '100%').css('height', this.options.height);

     if (this.options.top_min)
	    $('#' + this.euid + "_Border")
	     .css('top', this.options.top_min);
	},
	onDropComplete: function() {
	  var element = $("#" + this.euid + "_Border"),
		  e_left = element.position().left + element.width() / 2;

	  for (var i in this._dropped) {
	    var level = this.parrent.elements[i].options.level;
	    var e = $("#" + i + "_Border"),
		    w = e.width()/2 ;
		e.css("left", e_left - w + level *w);
	  }
	  this.parrent.draw();
	},
	onResizeComplete: function() {
	  var element = $("#" + this.euid + "_Border"),
		  e_left = element.position().left + element.width() / 2;

	  for (var i in this._dropped) {
	    var e = $("#" + i + "_Border"),
		    w = e.width()/2;
		e.css("left", e_left - w);
	  }
	  this.parrent.draw();
	},
	_getDropHelper: function(ui, isFrom) {
	  var element = $("#" + this.euid + "_Border"),
	      wd2 = element.width() / 2,
		  x_top = element.position().top + element.height();

	  for (var i in this._dropped) {
	    var e = $("#" + i + "_Border"),
		    p = e.position(),
			h = e.height(),
			w = e.width()/2;
			$.log("DROPPPPPPPED: " + i);
		$.log("CHECK: " + ui.position.top + " < " + p.top + "<" + (p.top+h));
   		if (true
   		//(ui.position.left > p.left - wd2 + w) // Check all parrent element width
//		  && (ui.position.left < p.left - w + wd2)
		  && (ui.position.top > p.top -10)
		  && (ui.position.top < p.top + h + 10)) {

		  if (ui.position.top < p.top) {
		    e.css("top", p.top -10).css("height", h+10);
		  }
		  if (ui.position.top > p.top + h) {
		    e.css("height", h+10);
		  }
		  return i;
        }
	  }
	  return undefined;
	},
	dropHelper: function(posUi, connector, dndOptions) {
	    $.log("OBJINST DH");
		if (connector.isCreator && connector.toId == this.euid) {
	      $.log("OBJINST RET CREATOR");
		  return;
		}
		
	    if (dndOptions != undefined && (dndOptions.isElFound == undefined || !dndOptions.isElFound)) {
		  $('#'+ this.euid + "_Border").css({left:posUi.position.left,top:posUi.position.top});
		 return;
		}

	     var p11 = $('#'+ this.euid + "_Border").position();
	   	 var w = $('#'+ this.euid + "_Border").width();
	     var par = this.parrent;
		 var self = this;
		 var con = connector;
		 
		 var dropped_euid = this._getDropHelper(posUi, con.from == self.euid);
         var extra_points = {position:{left:posUi.position.left,top:posUi.position.top}};
		 $.log("DROP helper: " + dropped_euid);
		 if (dropped_euid) {
		   if (con.from == self.euid) {
			con.from = dropped_euid;
			con.options.fromId = dropped_euid;
		   }
  		   if (con.toId == self.euid) {
		    con.toId = dropped_euid;
		    con.options.toId = dropped_euid;
		   }

		   // Keep the connector location
		   if (con._updateEPoints) {
		     con._updateEPoints(extra_points);
		   }

		   // redraw connector
		   self.parrent.draw();
		 }
		 else 
	       par.Element((dndOptions && dndOptions.expected) ? dndOptions.expected : "llport",
	         {left: p11.left + w/2 - 5, top:  posUi.position.top, "menu":this.options["menu"]},
        		function(element) {
		          var ui = {};
		          element.drop_parent = self.euid;
		          ui.position = $("#" + element.euid+"_Border").position();
                  par._dropElement(element, ui);
				  // perform some action on completion
				  if (con.from == self.euid) {
				    con.from = element.euid;
				    con.options.fromId = element.euid;
				  }
				  if (con.toId == self.euid) {
				    con.toId = element.euid;
				    con.options.toId = element.euid;
				  }
				  self.parrent.draw();
		     });
	},
	sortDropedElements: function() {
	  var _sort = new Array();
      for (var s in this._dropped) {
	    // Prevent adding end of live of object adding to sort
	  	if ((this.parrent.elements[s].options.type == "lldel")
		|| (this.parrent.elements[s].options.type == "llport" && this.parrent.elements[s].options.level > 0))
		  continue;

		var e2 = $("#" + s + "_Border"),
            p2 = e2.position(),
            h2 = e2.height();
            $.log("sort: " + this._dropped[s]);
            _sort.push({name:s, top:p2.top, height:h2});
      }

     var _seq = new Array();
      for (var s =0; s<_sort.length; ++s) {
		_seq[s] = new Array();
        for (var n=0; n<s; ++n) {
		  if (n != s) {
  		     if (((_sort[s].top < _sort[n].top)
  		      && (_sort[s].top + _sort[s].height >= _sort[n].top)) // n in the bottom of s
  		      || ((_sort[n].top < _sort[s].top)
  		      && (_sort[n].top + _sort[n].height >= _sort[s].top))) { // s in the bottom of n
  		    _seq[s].push(n);
            _seq[n] = _seq[n] || new Array();
            _seq[n].push(s);
            $.log("seq["+s+"].push("+n+"); seq["+n+"].push("+s+");");
		     }
	      }
	    }
	  }
      var has_concat = false;
      for (var m=0; m<_seq.length; ++m) {
		do {
		  has_concat = false;
		  for (var mm=0; mm<_seq[m].length; ++mm) {
			var n = _seq[m][mm];
			if ((m != n) && (_seq[n].length > 0)) {
                $.log("seq["+m +"].concat(seq["+n+"]); seq["+n+"] = new Array()");
				_seq[m] = _seq[m].concat(_seq[n]);
				_seq[n] = new Array();
                $.log("seq["+m +"].concat(seq["+n+"]) : "+ _seq[m] +"; seq["+n+"] = new Array()");
				has_concat = true;
			}
		  }
		} while (has_concat);
		_seq[m].sort();
	  }
	  
	  for (var m=0; m<_seq.length; ++m) {
		  if (_seq[m].length > 0) {
			  $.log("Intersection: [" +m + "] = "  + _seq[m]);
			  var top = _sort[m].top,
			      bottom  = top + _sort[m].height,
			      prev = undefined;
			  for (var r=0; r< _seq[m].length; ++r) {
				  $.log("Intersection: [" +m + "] [ " + r + "] = "  + _seq[m][r]);
				  var n = _seq[m][r];
				  if ((m == n) || (prev == n)) {
				    continue;
				  }

				  prev = n;

				  if (_sort[n].top < top) {
					  top = _sort[n].top;
				  }
				  if (bottom < _sort[n].top + _sort[n].height) {
					  bottom = _sort[n].top + _sort[n].height;
				  }
				  for (var f in this.parrent.connectors) {
				    var from = this.parrent.connectors[f].from,
					to = this.parrent.connectors[f].toId,
					tc = false, fc = false;

				    if (from == _sort[n].name) {
					  fc = true;
				      this.parrent.connectors[f].from = _sort[m].name;
					}

      			    if (to == _sort[n].name) {
					  tc = true;
				      this.parrent.connectors[f].toId = _sort[m].name;
					}

					if (tc) {
					  this.parrent.opman.reportShort("recon", f, {fromId:from, toId:to},{fromId:from, toId:_sort[m].name});
					} 
					
					if (fc) {
					  this.parrent.opman.reportShort("recon", f, {fromId:from, toId:to},{fromId:_sort[m].name, toId:to});
					}
				  }
				  this.parrent.removeElement(_sort[n].name);
			  }
			  $("#" + _sort[m].name + "_Border").css("top", top).css("height", bottom - top).children("DIV.us-port").css("height", "100%");
		  }
	  }


		/*
		hasIntersection = function(euid) {
     	    var e = $("#" + euid + "_Border"),
	   	        p = e.position(),
			    h = e.height(),
			    intersection 
   		           if ((ui.position.top > p.top -10)
		  && (ui.position.top < p.top + h + 10)) {

		  if (ui.position.top < p.top) {
		    e.css("top", p.top -10).css("height", h+10);
		  }
		  if (ui.position.top > p.top + h) {
		    e.css("height", h+10);
		  }
		  */
		
	},
	addMethod: function(md) {
		this.options.methods = this.options.methods || new Array();
		this.options.methods.push(md + "()");
	},
    getAutocomplete: function() {
		$.log("objinst AUTOCOMPLETE:");
		$.log("methods" + this.options.methods);
        return this.options.methods;
	},
	getName: function() {
      this.options.name = "" + $("#" + this.euid + " .Name" ).html();
      return this.options.name;
	},
	getSvgDescription: function() {
		var w1 = $("#" + this.euid).width();
		var h1 = $("#" + this.euid).height();
		var p1 = $("#" + this.euid + "_Border").position();
		var np = $("#" + this.euid + " #name").position();
		var	desc = '<rect x="'+ p1.left + '" y="' + p1.top + '" width="' +w1 + '" height="40"/>';
		desc += '<line stroke="black" stroke-dasharray="7 3" stroke-width="1" x1="'+ (p1.left+w1/2) + '" y1="' + (p1.top+40) + '" x2="' +(p1.left+w1/2) + '" y2="'+(p1.top + h1 -40)+'"/>';
		desc += '<text x="' + (p1.left + np.left) + '" y="' + (p1.top + np.top + 11) + '">' + $("#" + this.euid + " #name").text() + "</text>";
		return desc;
	}
});

// Drag helper element
// It is part of objinstance but it
// is implemented as a separate element
// menu should be shared from objinstance
dm.base.diagram("es.llport", dm.es.element, {
	options: {
		nameTemplate: "LLPort",
		width: '15px',
		height: '40px',
	    droppable: true,
        resizable_h: 'n-ul,s-ul',
		axis: 'y',
		level: 0
	},
	_create: function() {
	  // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-port us-element-resizable-area grElement">\
						</div>';
	  $("#" + this.parrent.euid).append(this.innerHtml);
	  this.element = $("#"  + this.euid);
	},
	_init: function() {
      $('#' + this.euid  + '_Border')
	     .css('width', this.options.width)
		 .css('height', this.options.height)
		 .css('left', this.options.left)
		 .css('top', this.options.top);
	  if (this.options["z-index"])
	    this._setOption("z-index", this.options["z-index"]);
	},
    _setOption3: function( key, value ) {
        this.options[ key ] = value;
        if (key == "color") {
			$("#" + this.euid).css("background-color", value);
			return true;
		} else if (key == "borderwidth") {
		  $("#" + this.euid).css("border-width", value);
			return true;
		} else if (key == "font-family") {
		  $.log("ff: " + value);
		  $("#" + this.euid).css(key, value);
		  return true;
		} else if (key == "selected") {
		  if (value)
		   $('#' + this.euid +'_Border ' + ".ui-resizable-handle").css({'visibility':'visible'});
		  else
		   $('#' + this.euid +'_Border ' + ".ui-resizable-handle").css({'visibility':'hidden'});
		} else if (key == "z-index") {
		  $("#" + this.euid + '_Border ').css(key, value);
		}

        return this;
    },
    getAutocomplete: function() {
	  $.log("LLPORT AUTOCOMPLETE:");
	  if (this.parrent) {
		var els = this.parrent.elements;
		for (var i in els) {
			for (var j in els[i]._dropped) {
				if ((j == this.euid)
				  && (els[i].getAutocomplete))
				  return els[i].getAutocomplete();
			}
		}
	  }
		return null;
	},
	dropHelper: function(posUi, connector) {
	    if (connector.options.type == "llselfcall" && connector.options.toId == this.euid) {
		  var fel = $("#" + this.parrent.elements[connector.from].euid + "_Border");
		  $("#" + this.parrent.elements[connector.toId].euid + "_Border").css("left", fel.position().left + fel.width()/2);
		  this.parrent.elements[connector.toId].options.level = this.parrent.elements[connector.from].options.level + 1;
		}

		$.log("DROP HELPER LLPORT:" );
        var pos = $("#" + this.euid + "_Border").position(),
            h = $("#" + this.euid + "_Border").height(),
            pui = posUi.position;
            if (pos.top + h < pui.top)
              $("#" + this.euid + "_Border").height(pui.top - pos.top);
            else if (pos.top > pui.top)
              $("#" + this.euid + "_Border").css("top", pui.top).height(pos.top - pui.top + h);		
	},
	getSvgDescription: function() {
		var w1 = $("#" + this.euid).width();
		var h1 = $("#" + this.euid).height();
		var p1 = $("#" + this.euid + "_Border").position();
		var	desc = '<rect x="'+ p1.left + '" y="' + p1.top + '" width="' +w1 + '" height="'+h1+'"/>';
		return desc;
	}
});

dm.base.diagram("es.lldel", dm.es.element, {
	options: {
		nameTemplate: "LLdel",
		width: '15px',
		height: '15px',
	    droppable: true,
		axis: 'y'
	},
	_create: function() {
	  // HTML for class structure creation
      this.innerHtml = '<img id="' + this.euid + '" class="us-element-resizable-area" src="http://umlsync.org/sttaic/images/lldel.png">\
						</img>';
	  $("#" + this.parrent.euid).append(this.innerHtml);
	  this.element = $("#"  + this.euid);
	},
	_init: function() {
      $('#' + this.euid  + '_Border')
	     .css('width', this.options.width)
		 .css('height', this.options.height)
		 .css('left', this.options.left)
		 .css('top', this.options.top);
	  if (this.options["z-index"])
	    this._setOption("z-index", this.options["z-index"]);
	},
    getAutocomplete: function() {
	  $.log("LLPORT AUTOCOMPLETE:");
	  if (this.parrent) {
		var els = this.parrent.elements;
		for (var i in els) {
			for (var j in els[i]._dropped) {
				if ((j == this.euid)
				  && (els[i].getAutocomplete))
				  return els[i].getAutocomplete();
			}
		}
	  }
		return null;
	},
	dropHelper: function(posUi, connector) {
		$.log("DROP HELPER DEL OBJ:" );
        var pos = $("#" + this.euid + "_Border").position(),
            h = $("#" + this.euid + "_Border").height(),
            pui = posUi.position;
            if (pos.top + h < pui.top)
              $("#" + this.euid + "_Border").height(pui.top - pos.top);
            else if (pos.top > pui.top)
              $("#" + this.euid + "_Border").css("top", pui.top).height(pos.top - pui.top + h);		
	},
	getSvgDescription: function() {
		var w1 = $("#" + this.euid).width();
		var h1 = $("#" + this.euid).height();
		var p1 = $("#" + this.euid + "_Border").position();
		var	desc = '<rect x="'+ p1.left + '" y="' + p1.top + '" width="' +w1 + '" height="'+h1+'"/>';
		return desc;
	}
});

}) ( jQuery );

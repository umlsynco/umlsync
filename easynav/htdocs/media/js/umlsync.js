/*!
  * UMLSync 1.0.0
  *
  * Copyright 2010, AUTHORS.txt (http://TBD/about)
  * Under the  GPL Version 2 license.
  * 
  * CSS required
  */
  
  var ConnectorsDrawHelper = {
  	  drawAggregation: function(context2, points, color) {
	        if ((points == null) || (points.length < 2)) {
			   return;
			}
context2.globalAlpha  = 0.1;
  			context2.strokeStyle = "rgba(14,14,14,0.2)";
			context2.stroke();
			context2.fillStyle = "rgba(14,14,14,0.2)";
			context2.fillRect(0, 0, 500, 500);

			context2.strokeStyle = "Solid #000";
			context2.stroke();
			var x = 10,
			    dx = points[1][0] - points[0][0],
			    dy = points[1][1] - points[0][1],
			    gip = Math.sqrt(dx*dx + dy*dy);

			if (gip<x)
			   return;
			
			var sina = dy/gip,
			cosa = dx/gip,
			x3 = points[1][0] - Math.sqrt(x*x*3/4)*cosa,
			y3 = points[1][1] - Math.sqrt(x*x*3/4)*sina,
			x6 = points[1][0] - Math.sqrt(x*x*3)*cosa,
			y6 = points[1][1] - Math.sqrt(x*x*3)*sina,
			x4 = x3 + x * sina/2,
			y4 = y3 - x * cosa/2,
			x5 = x3 - x * sina/2,
			y5 = y3 + x * cosa/2;
			
			context2.beginPath();
			context2.moveTo(points[0][0], points[0][1]);
			context2.lineTo(x6, y6);
			context2.lineTo(x4, y4);
			context2.lineTo(points[1][0], points[1][1]);
			context2.lineTo(x5, y5);
			context2.lineTo(x6, y6);

			context2.closePath();
	  },
	  drawGeneralization: function(c, points, color) {
	        if ((points === null) || (points.length < 2)) {
			   return;
			}

            var x2 = points[1][0],
			x1 = points[0][0],
			y2 = points[1][1],
			y1 = points[0][1];

			var x = 10,
				dx = x2 -x1,
			    dy = y2 -y1,
			    gip = Math.sqrt(dx*dx + dy*dy);

			if (gip<x)
			   return;

			var sina = dy/gip,
			cosa = dx/gip,
			x3 = x2 - Math.sqrt(x*x*3/4)*cosa,
			y3 = y2 - Math.sqrt(x*x*3/4)*sina,
			x6 = x1 - Math.sqrt(x*x*3)*cosa,
			y6 = y1 - Math.sqrt(x*x*3)*sina,
			x4 = x3 + x * sina/2,
			y4 = y3 - x * cosa/2,
			x5 = x3 - x * sina/2,
			y5 = y3 + x * cosa/2;
			
			c.beginPath();
			c.moveTo(x1, y1);
			c.lineTo(x3, y3);
			c.lineTo(x4, y4);
			c.lineTo(x2, y2);
			c.lineTo(x5, y5);
			c.lineTo(x3, y3);
			c.closePath();
			c.globalAlpha  = 0.1;
			c.fillStyle = "rgba(14,14,14,0.2)";
			c.strokeStyle = color;
			c.stroke();

	  },
	  drawDependency : function() {
	  },
	  drawInterfaceProvider : function() {
	  },
	  drawInterfaceRequestor : function() {
	  }
  };
  
  var UMLSyncClassDiagram = function(parrentId, nameId, width, height) {
      this.id = nameId;
	  this.width = width;
	  this.height = height;
	  this.activeConnector = -1;
	  
	  //$('<div id="' + nameId + '" class="UMLSyncClassDiagram" width="'+width+'" height="'+height+'">\
	  $('<div id="' + nameId + '" class="UMLSyncClassDiagram" width="100%" height="100%">\
		 <canvas id="' + nameId +'_Canvas" class="UMLSyncCanvas" width="'+width+'" height="'+height+'">\
		 <p> Your browser doesn\'t support canvas</p>\
		 </canvas>\
		 </div>\
		 ').appendTo(parrentId);

      this.Elements = new Array();
	  this.Connectorts = new Array();
	  this.activeElementNum = null;

	  this.canvas = window.document.getElementById(nameId +'_Canvas');
      this.canvas.width = $('#' + nameId).width();
      this.canvas.height = $('#' + nameId).height();

	  $('#' + nameId +'_Canvas').mousemove(function(event) {
	     var ctx = $('#' + this.id)[0].getContext('2d');
		 var data = ctx.getImageData(event.pageX-3, event.pageY-3, 7, 7).data;

		 //var color = new Color([data[0], data[1], data[2]]);
		 for (var i=0; i<data.length; i+=4) {
		 if ((data[i] == 238) && (data[i+1] == 238) && (data[i+2] == 238) && (data[i+3] == 255))  {
		    continue;
		 }
		 
		    var dd = $(this).parent().get(0).id;
			
            var d1 = $('#' + dd).data('UMLSyncDiagram');
			
			d1.HandleConnectors(ctx, event);
			return;
		 }
		 
		   var dd = $(this).parent().get(0).id;
           var d1 = $('#' + dd).data('UMLSyncDiagram');
      	   if (d1.activeConnector >= 0) {
			  d1.Connectorts[d1.activeConnector].color = '#000';
			  d1.redraw();
			  d1.activeConnector = -1;
			  
           }
		 });

	  this.findById = function(id) {
		for (var i in this.Elements) {
			if (this.Elements[i].id == id) {
			   return this.Elements[i];
			};
		};
		return null;
	  };

	  this.addElement = function(element) {
	    // the list of acceptable types of elements
		if ((element.type !== "class")
		  && (element.type !== "packet")
		  && (element.type !== "collaboration")
		  && (element.type !== "Note")){
		   return;
		}
	  
	     $(element.getInnerHtml()).appendTo("#"+this.id);
		 this.Elements[this.Elements.length] = element;
		
	
		$('#'+element.id).click(function() {
		   $('#' + this.id +'_Border').css({'border':'0px solid #87CEEB'});

          var dd = $('#' + this.id + "_Border").parent().get(0).id;
          var d1 = $('#' + dd).data('UMLSyncDiagram');

		  if (d1.activeElementNum !== null) {
		     // To save some performance
		     if (d1.activeElementNum == this.id) {
			    return;
			 }
			 $('#' + d1.activeElementNum + "_Border").resizable('destroy');
		  }
          d1.activeElementNum = this.id;

		   //var p1 = $('#' + this.id +'_Border');
		   var w = $('#' + this.id +'_Border').width() + 10,
		       h = $('#' + this.id +'_Border').height() + 10;
		   $('<div class="HResizer ui-resizable-handle ui-resizable-nw" style="top:4;left:4;cursor: nw-resize"></div>\
		      <div class="HResizer ui-resizable-handle ui-resizable-n" style="top:4;left:50%;cursor: n-resize"></div>\
		      <div class="HResizer ui-resizable-handle ui-resizable-ne" style="top:4;right:4;cursor: ne-resize"></div>\
		      <div class="HResizer ui-resizable-handle ui-resizable-e" style="top:50%;right:4;cursor: e-resize"></div>\
			  <div class="HResizer ui-resizable-handle ui-resizable-se" style="bottom:4;right:4;cursor: se-resize"></div>\
			  <div class="HResizer ui-resizable-handle ui-resizable-s" style="bottom:4;left:50%;cursor: s-resize"></div>\
			  <div class="HResizer ui-resizable-handle ui-resizable-sw" style="bottom:4;left:4;cursor: sw-resize"></div>\
			  <div class="HResizer ui-resizable-handle ui-resizable-w" style="top:50%;left:4;cursor: w-resize"></div>\
		   ').appendTo('#' + this.id +'_Border');
           
		   var ares = '#'+this.id;
		   $('#'+this.id+'_Border').resizable( {
		               handles:'all', 
					   alsoResize:"#"+this.id, 
					   alsoResize:"#"+this.id + " .ResizeAim",
					   resize: function(event, ui) {
                         var dd = $(this).parent().get(0).id;
                         var d1 = $('#' + dd).data('UMLSyncDiagram');
			             d1.redraw(this.id.substring(0, this.id.length-7));
					   }});
		});
		
		$('#'+element.id).mouseenter(function (){
			$('#' + this.id +'_Border').css({'border':'3px solid #87CEEB'});
		}).mouseleave(function (){
			$('#' + this.id +'_Border').css({'border':'0px solid #87CEEB'});
		});
		 
		
 		$('#'+element.id+'_Border').draggable({
        opacity : 0.3,
		snap:true,
		drag: function(event, ui) {
		    $('#' + this.id).css({'border':'0px solid #87CEEB'});
			var dd = $(this).parent().get(0).id;
			var d1 = $('#' + dd).data('UMLSyncDiagram');
			d1.redraw(this.id.substring(0, this.id.length-7));
		}		,
		cancel: '#'+element.id + ' .Operations'
		});
		
		
		
	  };

     this.getRValue = function(x1, x2, w) {
        var diffx = x2-x1;
	    if (diffx>0) {
          if (diffx > w)
		    return x1 + w;
		  return x2;
		}
		return x1;
	  };

	 this.getConnectionPoints = function(fromId, toId) {
	   var p1 = $('#'+ fromId).position();
       var p2 = $('#' + toId).position();
	   var p11 = $('#'+ fromId + "_Border").position();
       var p21 = $('#' + toId + "_Border").position();
       var x1 = this.getRValue(p1.left + p11.left, p2.left + p21.left, $('#'+ fromId).width()) ;
       var y1 = this.getRValue(p1.top + p11.top, p2.top + p21.top, $('#'+ fromId).height()) ;
       var x2 = this.getRValue(p2.left + p21.left, p1.left + p11.left, $('#' + toId).width());
       var y2 = this.getRValue(p2.top + p21.top, p1.top + p11.top,  $('#' + toId).height());
	   var newpoints = [[x1,y1], [x2,y2]];
       return newpoints;
	 };

	 this.HandleConnectors  = function(ctx, event) {
	 
	    function isininterval(x1, x2, x3) {
		   if (x1 <= x2) {
		      if ((x1<=x3) && (x3<=x2))
			    return true;
		   } else {
		      if ((x2<=x3) && (x3<=x1))
			    return true;
		   }
		   return false;
		};
		
	    for (var j=0; j< this.Connectorts.length; j++) {
		  var points = this.Connectorts[j].ps;
		  if ((isininterval(points[0][0], points[1][0], event.pageX))
		    && (isininterval(points[0][1], points[1][1], event.pageY))) {
			//alert("found " + j + "  "+ points[0][0] + '  ' +  points[1][0] + '  ' + event.pageX + '  ' + points[0][1]+ '  ' +points[1][1]+ '  '+ event.pageY);
			if (j == this.activeConnector) {
			   return;
			}
			
			this.activeConnector = j;
			this.Connectorts[j].color = 'Red';
			this.redraw();
		  }
        }
	 };
	 
	  this.addConnector = function(fromId, toId, points, type) {
	  /*
	       *    1) Check that from and to Id's are exist
                  *   2) if point are not null, need to validate that 1-st and last point on the elements border
	       *   3) if points are null, create a simple connection 
	       *   4) add the connector to the list
	        */
		
		// the list of acceptable connectors
		if ((type !== "generalization")
		  && (type !== "association")) {
		   return;
		}
		
		var fromE = this.findById(fromId),
		toE = this.findById(toId);
		
		if ((fromE == null) || (toE == null))
		   return;

        if (points == null) {
		
		   var newpoints = this.getConnectionPoints(fromId, toId);
		   this.Connectorts[this.Connectorts.length] = { from:fromId, to:toId, ps:newpoints, ctype:type, color:'#000'};

		} else {
		   //TODO:  Check that 1-s and last point are on the element
		   //              toE.isOnBorder();
		   this.Connectorts[this.Connectorts.length] = { from:fromId, to:toId, ps:newpoints, ctype:type, color:'#000'};
		}
        this.redraw();	
	  };
	  
	  this.redraw = function(elementId) {
	     //   1) Clear canvas
		 //   2) Recalculate all connectors which are dragable
		 //   3) re-draw all connectors
		 //   TODO: think about dragable connectors cache for DND implememntation
		var ctx = this.canvas.getContext("2d");
		c.globalAlpha  = 0.1;
		ctx.strokeStyle = "rgba(14,14,14,0.2)";
		ctx.fillStyle = "rgba(14,14,14,0.2)";
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (var ii=0; ii < this.Connectorts.length; ii++) {
		   if ((elementId == this.Connectorts[ii].from)
             || (elementId == this.Connectorts[ii].to))  {
		     this.Connectorts[ii].ps = this.getConnectionPoints(this.Connectorts[ii].from, this.Connectorts[ii].to);
		   }
		   
		   var points = this.Connectorts[ii].ps;
		   ConnectorsDrawHelper.drawGeneralization(ctx, points, (this.Connectorts[ii].color));
		}		
		ctx.stroke();
	  };
	  
	  this.removeElement = function(nameId) {
	     // 1) remove all connectors
		 // 2) remove elemnet
		 // 3) re-draw
	  };
	  
	  this.removeConnector = function(fromId, toId, type) {
	     // 1) identify connector
		 // 2) remove connector from list
		 // 3) re-draw
	  };
	  
	  // @param:  vis - "visible"  or "hidden"
	  this.setVisiblity = function(vis) {
	     $('#' + this.id).visibility = vis;
	  };
	  
	  // Subscribe on DIV scrolling. 
	  // It is necessary to increase canvas size on scroll
	  // TODO: think about canvas sharing when multiple diagrams uses via tabs.
	  $('#' + nameId ).scroll(function() {
	    var the_canvas = window.document.getElementById(this.id +'_Canvas');
	    if (the_canvas.width < $(this).width() + $(this).innerWidth()) {
		    the_canvas.width = $(this).width() + $(this).innerWidth() + 100;
		}
		if (the_canvas.height < $(this).height() + $(this).innerHeight()) {
		    the_canvas.height = $(this).height() + $(this).innerHeight() + 100;
		}

      });

	  // Store the reference on class as data of diagram
	  // thus it is possible to use common mehanizm of class DND
  	  $('#' + nameId).data('UMLSyncDiagram', this);

  };
  
  function UMLSyncNote (jsonNoteInfo) {
    this.id = "Note";
	this.type = "Note";

	var noteInfo = jQuery.parseJSON( jsonNoteInfo );
    if (noteInfo != null) {
	
	   this.id = noteInfo.name;
	}
	
	// HTML for packet structure creation
	this.innerHtmlPackInfo = '	<div id="' + this.id + '_Border" class="UMLSyncNoteBorder">\
								<div id="' + this.id + '" class="UMLSyncNote ResizeAim">\
                                <img src="images/corner.png" class="UMLSyncNoteCorner">\
								</div>\
								</div>\
                                ';

    this.getInnerHtml = function() {
	    return this.innerHtmlPackInfo;
	};	
	
  };
  
  function UMLSyncPacket (jsonPackInfo) {
    this.aux = "";
    this.type = "packet";
	this.id = "Packet";
	this.class = "packet";

	var packInfo = jQuery.parseJSON( jsonPackInfo );
    if (packInfo != null) {
	   this.id = packInfo.name;
	}

	// HTML for packet structure creation
	this.innerHtmlPackInfo = '	<div id="' + this.id + '_Border" class="UMLSyncPacketBorder">\
	                            <div id="' + this.id + '" class="UMLSyncPacket">\
                                <div class="UMLSyncPacketTab"></div>\
								<div class="UMLSyncPacketBody ResizeAim"><a href="SomeJabaCode">'+ this.id + '</a></div>\
								</div>\
                                </div>';
		
    this.getInnerHtml = function() {
	    return this.innerHtmlPackInfo;
	};
  };
  
  function UMLSyncCollaboration(jsonCollaborationInfo) {
    this.aux = "";
    this.type = "collaboration";
	this.id = "Collaboration";
	this.class = "collaboration";

	var elementInfo = jQuery.parseJSON( jsonCollaborationInfo );
    if (elementInfo != null) {
	   this.id = elementInfo.name;
	}
    
	// HTML for packet structure creation
	this.innerHtmlPackInfo = '	<div id="' + this.id + '_Border" class="UMLSyncCollaborationBorder">\
	                            <div id="' + this.id + '" class="UMLSyncCollaboration">\
								<canvas id="' + this.id + '_Canvas" class="UMLSyncCollaborationCanvas ResizeAim">\
					            <p> Your browser doesn\'t support canvas</p>\
								</canvas>\
								<a class="UMLSyncCollaborationText">' + this.id + '</a>\
								</div>\
                                </div>';
		
    this.getInnerHtml = function() {
	    return this.innerHtmlPackInfo;
	};
  };
  
  function UMLSyncClass2 (jsonClassInfo) {
  this.id = "Class";
  this.visibility = "public";
  this.aux       = "";
  this.type = "class";
  
  var ClassInfoHelper = {
      getOperationString : function(desc) {
	     if ((desc == null) || (desc.name == null))
		    return "";

		var result = "";
			
		 if (desc.visibility == "public") {
			result += " + ";
		 } else if (desc.visibility == "private") {
            result += " - ";
		 } else if (desc.visibility == "protected") {
            result += " # ";
		 } else {
		    // Public by default
		    result += " + ";
		 }
		 
		 if (desc.return != null) {
		    result += ' ' + desc.return + ' ';
		 }
		 
		 result += desc.name + '(';
		 for (var i in desc.parameters) {
		     result += desc.parameters[i].type + ' ' + desc.parameters[i].name;
		 }
		 result += ')';
		 return result;
		 
	  },
	  getAttributeString : function(desc) {
        if ((desc == null) || (desc.name == null))
	      return "";

       var result = "";
       if (desc.visibility == "public") {
         result += " + ";
       } else if (desc.visibility == "private") {
         result += " - ";
       } else if (desc.visibility == "protected") {
         result += " # ";
       } else {
         // Public by default
         result += " + ";
       }

       result += ' ' + desc.type + ' ' + desc.name;
	   return result;

	  }
  };

 var classInfo = jQuery.parseJSON( jsonClassInfo ),
     operations = "",
     attributes = "";
  
  if (classInfo) {
    this.id = classInfo.name;  
    this.width = classInfo.width;
    this.height = classInfo.height;
	
	for (var i in classInfo.operations) {
    	operations += '<li><a class="editablefield operation">' + ClassInfoHelper.getOperationString(classInfo.operations[i]) + '</a></li>';
	}
	
	for (var i in classInfo.attributes) {
    	attributes += '<li><a class="editablefield attribute">' + ClassInfoHelper.getAttributeString(classInfo.attributes[i]) +'</a></li>';
	}
  }

	// HTML for class structure creation
	this.innerHtmlClassInfo = '\
        <div id="' + this.id + '_Border" class="UMLSyncClassBorder">\
        <div id="' + this.id + '" class="UMLSyncClass">\
		<div class="UMLSyncClassHeader">\
		<a href="JabaScriptForFileLocation">' + this.id + '</a><br>\
		<a href="LocationOfAbstractDescription">abstract </a>\
	    </div>\
	    <div class="Attributes"><ul>' +  attributes + '</ul></div>\
		<div class="Operations ResizeAim"><ul>' +  operations + '</ul></div>\
		</div>\
		</div>\
	  ';
		
    this.getInnerHtml = function() {
	    return this.innerHtmlClassInfo;
	};

	this.addMethod = function(op) {
      $('<li><a class="operation">' + ClassInfoHelper.getOperationString(op) + '</a></li>').
	      appendTo('#' + this.id + ' .Operations ul');
    };

    this.getMethod = function(name) {
    };
  
    this.addMember = function(attr) {
   	  $('<li><a class="attribute">' + ClassInfoHelper.getAttributeString(attr) +'</a></li>').
		appendTo('#' + this.id + ' .Attributes ul');
    };

    this.getMember = function(name) {
    };
  };

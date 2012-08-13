
(function( $, undefined ) {
/*
$.widget("ui.umlcanvas", $.ui.mouse, {
	widgetEventPrefix: "umlcanvas",
	pageX:0,
	pageY:0,
	options:{
	  addClasses: true,
	  sharedCanvas: false
	},
	_create: function() {
		(this.options.addClasses && this.element.addClass("ui-umlcanvas"));
		(this.options.disabled && this.element.addClass("ui-umlcanvas-disabled"));
		var self = this;
		this._mouseMoveDelegate2 = function(event) {
			return self._mouseMove2(event);
		};
		this.element.bind("mousemove." + this.widgetName, this._mouseMoveDelegate2);

		this._mouseInit();

	},

	destroy: function() {
		if(!this.element.data('uml-canvas')) return;
		this.element
			.removeData("umlcanvas")
			.unbind(".umlcanvas")
			.removeClass("ui-umlcanvas"
				+ " ui-umlcanvas-dragging"
				+ " ui-umlcanvas-disabled");
		this._mouseDestroy();

		return this;
	},

	_mouseCapture: function(event) {
		this.started = true;
	
		var o = this.options;
	this.canvas = window.document.getElementById(this.element[0].id +'_Canvas');		
	if (this.canvas.width !== 1000) {
	this.canvas.width = 1000;
	this.canvas.height = 700;
	}
	this.pageX = event.pageX - 8;
	this.pageY = event.pageY * 10/7;
	this.cctx = this.canvas.getContext('2d');

		// among others, prevent a drag on a resizable-handle
	//	if (o.disabled || $(event.target).is('.ui-resizable-handle'))
		//	return false;

		//Quit if we're not on a valid handle
//		this.handle = this._getHandle(event);
	//	if (!this.handle)
		//	return false;

		
		return true;

	},
	
	_mouseStart: function(event) {
	//alert("2 ");

	
		this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;
	},	
	_mouseDrag: function(event, noPropagation) {
	//alert("1 ");
		this.cctx.fillStyle = "#eee";
		this.cctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.cctx.stroke();
		
		this.cctx.beginPath();
		this.cctx.lineWidth=1;
		
        var imageToUsedAsPattern = document.getElementById('dottedLine');

		this.cctx.strokeStyle=this.cctx.createPattern(imageToUsedAsPattern, "repeat"); ;
		
		//this.cctx.moveTo(event.pageX, event.pageY);
		this.cctx.strokeRect(this.pageX, this.pageY, event.layerX, event.layerY);
		this.cctx.moveTo(this.pageX, this.pageY);

		this.cctx.lineTo(event.pageX -8, (event.pageY)*this.canvas.width/this.canvas.height);
	//alert(" to " + event.pageX + "  " + event.pageY);
//		this.cctx.fillStyle = "Solid #eee";
		this.cctx.stroke();


		return false;
	},

	_mouseStop: function(event) {
		this.cctx.fillStyle = "#eee";
		this.cctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	//this.cctx.lineTo(event.pageX, event.pageY);
		this.started = false;
		return false;
	},
		
	_mouseMove2: function(event){
	    if (this.cctx && (this.started == false)) {
		   if (this.cctx.isPointInPath(event.pageX -8, (event.pageY)*10/7)) 
		      alert("In PAth");
		}
		return true;
	}
});
/*
$.ui.diagrammanager = {
   current: null,
   diagram: function(desc) {
               if ((!desc) || (!desc.name))
			     return null;
               $.ui.diagrammanager.diagram[desc.name] = desc;
            },
   element: function(diagram, desc) {
            },
   connector: function(diagram, desc) {
               $.ui.diagrammanager.connectors[desc.name] = desc;
            }
}
*/
})(jQuery);
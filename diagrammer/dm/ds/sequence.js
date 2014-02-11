
(function( $, dm, undefined ) {
dm.base.diagram("ds.sequence", dm.ds.base, {
    options: {
        type: 'sequence',
		acceptElements: ['objinstance','llport','lldel','message','llalt','actor','note']
    },
	getElementMenu:function(menu, element) {
	  if (menu == "icon") {
	    if (element.options.type == "note") {
	      return "us-"+this.options.type + "-" + element.options.type+"-menu";
		}
		if (element.options.type == "message") {
		  return "us-" + element.options.type+"-menu"
		}
		else {
		  return "us-objinstance-menu"
		}
	  }
	  if (menu == "context") {
	    return "us-ctx-common-menu";
	  }
	},

    onElementDragStart: function(el, ui, isConnector) {

     this.opman.startTransaction();

     if (isConnector) {
		 $.log("onDragStart");
		 // If from has only one connector
		 var single = true;
		 for (i in this.connectors)
		   if ((this.connectors[i] != el) &&
		     ((this.connectors[i].from == el.from)
		       || (this.connectors[i].toId == el.from))) {
				   single = false;
			   $.log("FOUND: " + this.connectors[i].euid);
		       break; // element has one more connector. Could not be moved.
		       }

		 if (single) {
			 $.log("also: " + el.from);
		   this.elements[el.from].onDragStart(ui);
		 } else
		   if (this.elements[el.from].drop_parent)
			   el.from = this.elements[el.from].drop_parent;
		   
		 // if to element has only one connector
         single = true;
		 
		 // if connector toId is objinstance then it is single = true !!!!!!
		 if (this.elements[el.toId].options.type == "objinstance") {
		    // moove objinstance !!!
			el.isCreator = true;
		 } else {
		   for (i in this.connectors)
		   if ((this.connectors[i] != el) &&
		     ((this.connectors[i].from == el.toId)
		       || (this.connectors[i].toId == el.toId))) {
				   single = false;
		       break; // element has one more connector. Could not be moved.
		       }
			   
          }
		 if (single) {
		   if (el.isCreator)
		     this.elements[el.toId].onDragStart(ui, true); // true means skipDropped
		   else 
		     this.elements[el.toId].onDragStart(ui);
         } else
		   if (this.elements[el.toId].drop_parent)
			   el.toId = this.elements[el.toId].drop_parent;
	 }
	 else {
		 var skip_objects = false;
		 if (el.option("type") == "llport") {
			 ui.left = 0;
			 skip_objects = true;
		 } else {
			 ui.top = 0;
		 }

		el.onDragStart(ui);

		if (this.multipleSelection)
		  for (i in this.elements) {
			if (this.elements[i] != el
			  && this.elements[i].option("selected")
			  && (!skip_objects || this.elements[i].option("type") == "llport")
			  && this.elements[i].option("dragStart") == undefined) {
				  this.elements[i].onDragStart(ui);
			}
		  }

	    for (i in this.connectors) 
	      if (this.elements[this.connectors[i].from].option("dragStart")
	        || this.elements[this.connectors[i].toId].option("dragStart"))
            this.connectors[i].onDragStart(ui);
		
		if (skip_objects)
		for (i in this.connectors) {
	      var f = this.elements[this.connectors[i].from].option("dragStart"),
	        t = this.elements[this.connectors[i].toId].option("dragStart"); 
		  if (f && !t) {
			  var dp = true; // drag possible
			  for (j in this.connectors)
				if (!this.connectors[j].option("dragStart")
				  && (this.connectors[j].from == this.connectors[i].toId
				      || this.connectors[j].from == this.connectors[i].toId))
				      dp = false; // some of the connectors goes to another element				      
			  if (dp)
			    this.elements[this.connectors[i].toId].onDragStart(ui);
		  }
		  else if (!f && t) {
			  var dp = true; // drag possible
			  for (j in this.connectors)
				if (!this.connectors[j].option("dragStart")
				  && (this.connectors[j].from == this.connectors[i].from
				      || this.connectors[j].from == this.connectors[i].from))
				      dp = false; // some of the connectors goes to another element
			  if (dp)
			    this.elements[this.connectors[i].from].onDragStart(ui);
		  }
		}
        }
	},
	onElementDragMove: function(el, ui, isConnector) {
		if (!isConnector)
		 if (el.option("type") == "llport") {
//			 $.log("LEFT IS 0 != " + ui.left);
			 ui.left = 0;
		 } else {
//			 $.log("TOP IS 0 !=" + ui.top);
			 ui.top = 0;
		 }
	  for (i in this.elements)
	    if (this.elements[i].option("dragStart") != undefined
	      && (isConnector || this.elements[i] != el))
		  this.elements[i].onDragMove(ui);
	  for (i in this.connectors)
        if (this.connectors[i].option("dragStart")
          && ((!isConnector) || (this.connectors[i] != el)))
		  this.connectors[i].onDragMove(ui);
    },
	onElementDragStop: function(el, ui, isConnector) {
	  if (!isConnector)
		 if (el.option("type") == "llport") {
			 ui.left = 0;
		 } else {
			 ui.top = 0;
		 }
	  if (!isConnector)
          el.onDragStop(ui);

	  for (i in this.connectors)
        if (this.connectors[i].option("dragStart"))
		  this.connectors[i].onDragStop(ui);

	  for (i in this.elements)
	    if (this.elements[i].option("dragStart") != undefined
	      && this.elements[i] != el)
		  this.elements[i].onDragStop(ui);


      if (isConnector) {
		  var upos = {position: {left:el.points[0][0], top: el.points[0][1]}},
		  l = el.points.length -1,
		  upos2 = {position: {left:el.points[l][0], top: el.points[l][1]}};
		  if ((this.elements[el.from].dropHelper) && (this.elements[el.from].options.type != 'llport')) {
		    this.elements[el.from].dropHelper(upos, el);
		  }
		  if ((this.elements[el.toId].dropHelper) && (this.elements[el.toId].options.type != 'llport' && this.elements[el.toId].options.type != 'lldel')) {
		    this.elements[el.toId].dropHelper(upos2, el);
   		  }
	  }
	  
	  var diag = this;
	  // Perform function on diagram load completion
	  dm.dm.loader.OnLoadComplete(function() {
		  for (i in diag.elements) {
			if (diag.elements[i].sortDropedElements)
			  diag.elements[i].sortDropedElements();
		  }
		  diag.opman.stopTransaction();
	  });
	},
});
}) ( jQuery, dm );

/**
  *  
  */
(function( $, dm, undefined ) {
$.diagram("dm.elements.Collaboration", dm.elements.element, {
	diagramName: "Collaboration",
	diagramEventPrefix: "Cl",
	options: {
		lazyload: false,
		imgpath: "images/collaboration/small.jpg",
		visibility: "public",
		editable: true		
	},
	_create: function(jsonDesc, parrentId) {
	alert(jsonDesc);
       var info3 = jQuery.parseJSON( jsonDesc );
  
       if (info3) {
        this.id = info3.name;  // Note HTML name 
		this.diagramName = this.id;
        this.width = info3.width;
        this.height = info3.height;
      }

	  // HTML for class structure creation
      this.innerHtmlClassInfo = '<div id="' + this.id + '" class="UMLSyncCollaboration ElementResizeArea">\
								<a class="editablefield" style="text-align:left;position:relative;top:30%">' + this.id + '</a>\
                                </div>';
	  $(parrentId).append(this.innerHtmlClassInfo);
	  this.element = $("#"  + this.id);
	},
	_init: function() {
      

      $('#' + this.id + ' .UMLSyncCollaboration').contextMenu('context-menu-1', {
            'Context Menu Item 1': {
                click: function(element) {  // element is the jquery obj clicked on when context menu launched
                    alert('Menu item 1 clicked');
                },
                klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
            },
            'Context Menu Item 2': {
                click: function(element){ alert('second clicked'); },
                klass: "second-menu-item"
            }
        });

	  //  + Activate context ment  -> _contextmenu()
	  // BASE ELEMENT

      if (this.options.editable) {
	     $("#" + this.id + " .editablefield").editable();
      } else {
	     // Activate AJAX references only 
		 // editable -> clickable for a switch to diagram
	  }
	},
	_contextmenu: function() {
	   if (this.options.editable) {
	      // Open description of element on the overlay
	   }
	   else {
	     // Open context menu Copy/Past/Jump to implementation etc... if it is necessary :)
	   }
	}
});
}) ( jQuery, dm );

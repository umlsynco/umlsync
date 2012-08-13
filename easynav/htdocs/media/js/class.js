/**
  *  
  */
(function( $, dm, undefined ) {
$.diagram("dm.elements.Class", dm.elements.element, {
	diagramName: "Class",
	diagramEventPrefix: "C",
	options: {
		lazyload: false,
		imgpath: "images/class/small.jpg",
		visibility: "public",
		aux: "", // it could be interface, abstract, etc
		editable: false		
	},
	_create: function(jsonDesc, parrentId) {
       var classInfo = jQuery.parseJSON( jsonDesc ),
       operations = "",
       attributes = "";
  
       if (classInfo) {
        this.id = classInfo.name;
		this.diagramName = this.id;
        this.width = classInfo.width;
        this.height = classInfo.height;
	
	    for (var i in classInfo.operations) {
           operations += '<li><a class="editablefield operation">' + classInfo.operations[i].name + '</a></li>';
        }
	
	    for (var i in classInfo.attributes) {
     	  attributes += '<li><a class="editablefield attribute">' + classInfo.attributes[i].name +'</a></li>';
        }
      }

	  // HTML for class structure creation
      this.innerHtmlClassInfo = '\
        <div id="' + this.id + '" class="UMLSyncClass ClassHeader">\
		<div class="UMLSyncClassHeader">\
		<a class="JabaScriptForFileLocation">' + this.id + '</a><br>\
		<a class="LocationOfAbstractDescription">abstract</a>\
	    </div>\
	    <div class="ClassAttributes"><ul id="sortable-atr">' +  attributes + '</ul></div>\
		<div class="ClassOperations ElementResizeArea"><ul id="sortable">' +  operations + '</ul></div>\
		</div>\
	  ';
	  $(parrentId).append(this.innerHtmlClassInfo);
	  this.element = $("#"  + this.id);
	},
	_init: function() {

      $('.UMLSyncClassBorder').contextMenu('context-menu-1', {
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
	  
	     var border = "#"+this.id + "_Border";
		 var self = this;
	     $("#"+this.id + " .ClassAttributes").resizable({ handles: 's-l', alsoResize: border, stop: function(event, ui) { $("#"+self.id + " .ClassAttributes").css({width:"100%"}); } });
	     $("#"+this.id + " .ClassOperations").resizable({ handles: 's-l', alsoResize: border });
		 $("#"+this.id + " .ClassAttributes").contextMenu('context-menu-2', {
            'Context Menu Item 3': {
                click: function(element) {  // element is the jquery obj clicked on when context menu launched
                    alert('Menu item 1 clicked');
                },
                klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
            },
            'Context Menu Item 4': {
                click: function(element){ alert('second clicked'); },
                klass: "second-menu-item"
            }
        });

      $('.Operations').contextMenu('context-menu-3', {
            'Context Menu Item 5': {
                click: function(element) {  // element is the jquery obj clicked on when context menu launched
                    alert('Menu item 1 clicked');
                },
                klass: "menu-item-1" // a custom css class for this menu item (usable for styling)
            },
            'Context Menu Item 6': {
                click: function(element){ alert('second clicked'); },
                klass: "second-menu-item"
            }
        });


         $("#" + this.id + " #sortable").sortable();
         $("#" + this.id + " #sortable").disableSelection();
	     $("#" + this.id + " .JabaScriptForFileLocation").editable();
         $("#" + this.id + " .LocationOfAbstractDescription").editable();
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

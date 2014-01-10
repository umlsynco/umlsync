/**
  *  
  */
(function( $, dm, undefined ) {
$.diagram("dm.diagrams.ClassDiagram", dm.diagrams.diagram, {
	diagramName: "ClassDiagram",
	diagramEventPrefix: "CD",
	options: {
		lazyload: false,
		imgpath: "images/classdiagram/small.jpg"
	},
	_init: function() {
	}
});
}) ( jQuery, dm );

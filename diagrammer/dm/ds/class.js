
(function( $, dm, undefined ) {
dm.base.diagram("ds.class", dm.ds.diagram, {
    diagramName: "ClassDiagram",
    options: {
        type: 'class',
		acceptElements: ['class','package','note']
    }
});
})(jQuery, dm);

/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("ds.component", dm.ds.diagram, {
    diagramName: "ComponentDiagram",
    options: {
        type: 'component',
		acceptElements:'component,interface,port,empty,instance,note,package'
    },
    _init: function() {
    }
});
})(jQuery, dm);

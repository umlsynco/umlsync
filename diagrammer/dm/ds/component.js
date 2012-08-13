/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("ds.component", dm.ds.diagram, {
    diagramName: "ComponentDiagram",
    diagramEventPrefix: "CompD",
    options: {
        lazyload: false,
        type: 'component'
    },
    _init: function() {
    }
});
})(jQuery, dm);


(function( $, dm, undefined ) {
dm.base.diagram("ds.class", dm.ds.diagram, {
    diagramName: "ClassDiagram",
    diagramEventPrefix: "CD",
    options: {
        lazyload: false,
        imgpath: "images/classdiagram/small.jpg",
        type: 'class'
    },
    _init: function() {
    }
});
})(jQuery, dm);

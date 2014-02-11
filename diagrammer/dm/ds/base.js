/*
 Class: base
        Base diagram type, most diagram doesn't requered any specific changes in the base structures
        that's why there is no needs to duplicate code
 Author:
   Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

 Copyright:
  Copyright (c) 2011 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

 URL:
  umlsync.org/about

 Version:
  2.0.0 (2012-07-12)
*/

(function( $, dm, undefined ) {
    dm['base']['diagram']("ds.base", dm.ds['diagram'], {
        diagramName: "BaseDiagram",
        diagramEventPrefix: "CD",
        'options': {
            'width': 1300,
            'height': 700,
            'type': 'base'
        },
        '_init': function() {
        }
    });
    
	dm.base.diagram("ds.class", dm.ds.diagram, {
      diagramName: "ClassDiagram",
      options: {
        type: 'class',
		acceptElements: ['class','package','note']
      }
    });
	
	dm.base.diagram("ds.component", dm.ds.diagram, {
		diagramName: "ComponentDiagram",
		options: {
			type: 'component',
			acceptElements:'component,interface,port,empty,instance,note,package'
		},
		_init: function() {
		}
	});
	
	dm.base.diagram("ds.package", dm.ds.diagram, {
		diagramName: "PackageDiagram",
		options: {
			type: 'package',
			acceptElements: ['class','package','note']
		}
	});
})(jQuery, window.dm);

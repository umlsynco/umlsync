/*
Class: Extension for UML package diagrams specific.

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2012 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  umlsync.org/about

Version:
  2.0.0 (2012-07-12)
*/
(function( $, dm, undefined ) {
dm.base.diagram("ds.package", dm.ds.diagram, {
    diagramName: "PackageDiagram",
    options: {
        type: 'package',
		acceptElements: ['class','package','note']
    }
});
})(jQuery, dm);

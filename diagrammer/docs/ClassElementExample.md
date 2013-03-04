UML Diagrammer framework: Class element description example
===========================================================

Class is a simple UML primitive which doesn't require complex interaction with other UML element.

But for another hand it is extend the default behavior of  element in a very simple way to make it more understrandable:

So, first of all dm.es.class instance inherited from dm.es.element like any element and follow to element initialization sequence.    
 
<br>
![Diagram:](http://umlsync.org/github?path=./dm-diagrams/ClassInheritanceExample.umlsync "Class.")
<br>


As you can see from the diagram above "Class" implements basic methods for diagram's element (create, init, update, setOptions2)
and introduce it's own specific methods: addMethod(), addField(), getName() getAux(or getStereotype).


The real constructor of dm.es.class is located in dm.base.diagram, see the following code:
<pre>
dm [ namespace ][ name ] = function( options, parrent ) {
            // allow instantiation without initializing for simple inheritance
            if ( arguments.length ) {
                options = options || {};
                if (options['type'] == undefined)
                    options['type'] = name;
                this._createDiagram( options, parrent);
            }
        };
</pre>

The element creation process affect all hierarchy of classes:


![Diagram:](http://umlsync.org/github?path=./dm-diagrams/ElementClassInit.umlsync "Element.")




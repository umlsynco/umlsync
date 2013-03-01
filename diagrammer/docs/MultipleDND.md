UML Diagrammer framework: Droppable element
===========================================================

Droppable functionality mean that it is possibility to drop one element into another.

There are two options were created for this purpose: `droppable` and `acceptdrop`. Both of them accept value `TRUE` or element `type`:        

<pre>
dm.base.diagram("es.package", dm.es.element, {
    'options': {
        'droppable': true,  
        'acceptdrop': "package"
    },
    ...
    });
</pre>

`droppable=TRUE` means that element with type-X could be dropped on any element which has 'acceptdrop' equal to `TRUE` or type-X.

And `acceptdrop=type-X`  means that element could accept drop for elements with droppable=type-X or TRUE.



For example, the following code allow to make note droppable into the package :  

<pre>
dm.base.diagram("es.package", dm.es.element, {
    'options': {
        'droppable': <b>"package"</b>,  
        'acceptdrop': <b>true</b>
    },
    ...
    });

dm.base.diagram("es.note", dm.es.element, {
    'options': {
        'droppable': <b>"package"</b>
    },
    ...
    });
</pre>


<br>
<div id="ClassInheritanceExample" class="pack-diagram" repo="umlsynco/umlsync" branch="master" path="/diagrammer/docs/dm-diagrams/ClassInheritanceExample.umlsync">
UMLSync package structure diagram. 
</div>
<br>

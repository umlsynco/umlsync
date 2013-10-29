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


Droppable functionality do not use jQuery droppable. Instead it is use jQuery.draggable events to handle drop: 

<br>
<div id="DroppableSequence" class="pack-diagram" repo="umlsynco/umlsync" branch="master" path="./dm-diagrams/DroppableSequence.umlsync">
Droppable handling sequence. 
</div>
<br>

dm.ds.diagram._dropElement handle element drop and has the following limitations:
1. Element could not be dropped into several elements simultaniously. It could be dropped into one element only
2. Element could change drop-parent. Therefore it is neccessary to remove previous value 
3. Information about dropped element could not be pushed twice

This method creates associative array field called `_dropped` for elements which has 'acceptdrop' option. And manage it's content on DND.






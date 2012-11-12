UML Diagrammer framework: Draggable element
===========================================================

Draggable functionality allow user to move element or multiple elements on diagram.


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


Draggable functionality based on jQuery UI draggable but multiple elements draggable implemented in a simple way in draggable.start/drag/stop events. 
 

<br>
<div id="DraggableSequence" class="pack-diagram" repo="umlsynco/umlsync" path="/Diagrammer/diagrammer/docs/dm-diagrams/DraggableSequence.umlsync">
Draggable handling sequence: 
</div>
<br>








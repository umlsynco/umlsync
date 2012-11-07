UML Diagrammer framework: Hierarchy of elements
===============================================




Hierarchy of elements based on dm.base.diagram() method which implements elements inheritance.

<div id="HierarhyOfClasses" class="pack-diagram" repo="umlsynco/umlsync" path="/Diagrammer/diagrammer/docs/dm-diagrams/HierarchyOfElements.umlsync">
Hierarchy of elements. 
</div>

<br>

Inheritance implementation use overwrite method for options and methods. Thus each method which available in object prototype is VIRTUAL and could be replaced.
There is no special mechanism to highlight backward compatibility of methods and options therefore it is responsibility of developers to check options and methods names before creation.  


For example the following code should overwrite defaultField and baseMethod() (if they are present in the "base" dm.es.element class) and create a newMethod() and newField:
<pre>
(function( $, dm, undefined ) {
  dm.base.diagram("es.NEW_ELEMENT", dm['es']['element'], {
    options: {
        'defaultField': 'some value',
        'newField': 'some value'
    },
    baseMethod: function() {
    },
    newMethod: function() {
    }
  });
})(jQuery, dm);
</pre>

 
PLEASE NOTE : element JSON description is based on options therefore they should be clearly named and CSS compatible (which modify CSS options of element).   
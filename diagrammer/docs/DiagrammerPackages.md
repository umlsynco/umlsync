UML Diagrammer framework: Packages
==================================

<pre>
* dm/ : diagram manager
* dm/ms : menus
* dm/ms/ctx : context menu
* dm/ms/ds : diagram's menu
* dm/ds : diagram classes folder
* dm/ds/diagram.js : base class for diagram, element and connector
* dm/ds/&lt;type&gt;.js : &lt;type&gt; of diagram class,package etc...
* dm/es/ : element classes folder
* dm/es/&lt;type&gt;.js - &lt;type&gt; of element image, class, artifact etc...
* dm/cs/&lt;type&gt;.js - &lt;type&gt; of connector aggregation, composition etc ...

// TBD:
* dm/ms/vp - main diagram load menu
* dm/hs/framework.js - tabs based diagram handler
* dm/hs/framework_viwer.js - tabs based diagram handler
</pre>

And this structure maps on internal hierarchy of classes and objects.<br>
BUT there are several exceptions exists:<br>
<pre>
1. dm.dm.XXX  namespace : contain singletone objects 
2. dm/dm/xxx: files contain objects with dm.base.xxx namespace and should create objects in dm.dm.XXX namespace
3. dm/dm/diagrams.js : base class for all diagrams/elements/connectors
4. dm/ms/ds/common.js : base menu for diagrams etc...
</pre>      

<div id="packageDiagram" class="pack-diagram" repo="umlsynco/umlsync" path="diagrammer/docs/dm-diagrams/PackageStructure.umlsync">
UMLSync package structure diagram. 
</div>
<br>

*dm.base.loader* is responsible for loading and creating diagrams, elements, connectors and diagram menus.

*dm.base.framework* is responsible for user UI (File menu, context menu, tabs etc) and wrap loader functionality to be able to create/open diagram in the corresponding areas. 

*dm.base.IView* - is an abstract interface which provide possibility to create CORS AJAX requests to the GitHub, SourceForge, Localhost applications etc.

<br>
Therefore framework initialization should be done in the following way:
<pre>
$(document).ready(function() {
  // Initialize loader with static scripts location
  var Loader = new dm.base.loader("./");

  // Initialize framework with loader
  var fw = new dm.hs.framework(Loader);

  // Initialize specific data store view
  var IGithubView = new dm.base.GithubView();

  // Add IView to framework 
  fw.addView2('Github', IGithubView);
});
</pre> 





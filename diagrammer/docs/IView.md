UML Diagrammer framework: IView interfaces
===================================================

IView interface were created for CORS requests to the 3PP data store services like GitHub or SorceForge.

It is responsible for incapsulation of all AJAX requests. Thus all calls to the concrete service should be placed in a single file.   

<div id="IViewAPI" class="pack-diagram" repo="umlsynco/umlsync" path="/Diagrammer/diagrammer/docs/dm-diagrams/IViewAPI.umlsync">
IView interface and it's dependencies. 
</div>
<br>


The main initialization sequence happen on view registration via framework::addView2(title, IView).
Each view could extend the framework UI with file tree, context menu for file tree and context menu extension for the diagram's elements.

On addView2 the following action should be performed:   

*IView::init()* - initialization of view: ping to Github or ping localhost application. It could contain dialogs etc ...

*IView::tree* - dynatree should be created based on this tree description;   

*IView::ctx_menu* describes the context menu for the dynatree nodes;

*IView::element_menu* described the context menu extension for elements. It is associative array which associate element(or elements) with context menu extension.
One context menu could be applied to the several elements.
Association based on element's 'title' option !!!
To apply context menu to several elements association sould contain several 'title's of elements separated by comma. (For example: 'Package,Class,Note')       

<be>
After initialization of dynatree and context menu's extensions view should perform all requests by UI events only.
It means that AJAX request should happen only by user request: tree navigation (request list of files), open diagram (request JSON) etc ...    

So, the sequence of diagram load look like this:

<div id="OpenDiagram" class="pack-diagram" repo="umlsynco/umlsync" path="/Diagrammer/diagrammer/docs/dm-diagrams/OpenDiagram.umlsync">
Open diagram by click on tree element. 
</div>
<br>

1. User click on file to open it
2. Dynatree::onActivate hooks this click and call the framework->loadDiagram(node)
3. Framework should create empty tab(with tabId) for diagram and call IView->loadJSON(node)
4. IView should create AJAX request to GitHub and get JSON and return it to framework
5. framework should call loader.Diagram(JSON, tabId) <- which create diagram in DIV#tabId
6. And as result - user could see selected diagram  

  
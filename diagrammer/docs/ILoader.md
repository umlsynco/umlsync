UML Diagrammer framework: ILoader interfaces
===

ILoader interface were created for loading static javascript/JSON/font files from the installation web-site. 
Loader allow us to do not upload all possible diagrams on start-up and do it by request.
Thus all AJAX requests to the web-site should be placed into the loader.

See DiagrammerPackages structure to map _dm_ namespace elements on load paths.

<b>PLEASE NOTE: loader is a singletone object and should create instance in the _dm.dm.loader_ namespace !!!</b>
  
Loader loader functionality could be separate on 3 major part: 
<pre>
1. Load queue (internal methods);
2. Load diagram elements;
3. Load menus and menus data elements;
</pre> 

![mime-type:application/vnd.umlsync.json] (http://umlsync.org/github?path=./dm-diagrams/ILoader.umlsync "")


<br>

1. Load queue (internal):
---
Load queue consists of items: 
<pre>
{
    url: "",                             // script to load
    dataType: 'JSON',                    // JSON or script 
    precondition: function() { return BOOL;}, // TRUE load required FALSE - already loaded
    callback: function(data) {},         // callback on load complete 
    data: options                        // callback data
}
</pre>

each item should be placed into the _loadQueue via addToLoadQueue(item) method;

Queue was created to prevent double loading of the same file in parallel AND to create the sequence of initialization for element.

*precondition()* method check if it is necessary to load the file or not. It is possible that previous item in queue has requested the same script therefore precondition check was introduced.  



2. Load diagram elements:
---
Initialization sequence is very important for diagram elements. It is not possible to create element without diagram Or it is not possible to create connector without element.
Therefore loader queue always perform requests in a sequence of there calls even if script loading not required.

An average load procedure looks like this:
<pre>
<b>'Element'</b>: function(type, data, diagram, callback2) {
  this._addToLoadQueue({<b>url</b>: "/dm/es/" + type + ".js",
                        <b>precondition</b>: function() {
                           if (dm['es'][type] == undefined) {
                             return true;
                           }
                           return false; // Element already in namespace loading not required
                        },
                        <b>callback</b>: function(data) { 
                          var e2 = new dm['es'][type](data, diagram); // create an object and return it to callback
                          if (callback2)
                            callback2(e2);
                        },
                        <b>data</b>: data
                       });
</pre> 


There are some operations required on diagram load completion. For example re-arrange dropped elements.

*OnLoadComplete(callback)* method was created to add callback method to the queue without loading any request. It is allow us to perform to create post-process method on diagram load complete.   


*LoadElement(type)* - it is quiet unusual method because it doens't create any element. It is just load element script. It is created to improve the performance of icon menu.  

3. Load menus and menus data elements:
---
'LoadDiagramMenuData() and LoadMainMenuData()' uses to load JSON descriptions of diagram menu and main menu correspondingly. Async methods not in a load queue.

'Menu(), CreateContextMenu() and CreateDiagramMenu()' are loading any menu, context menu and diagram menu correspondingly. It seems that Menu() is legacy method and will be removed in the future.  

 
 

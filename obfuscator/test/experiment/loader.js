/*
Class: loader

Lazy load of diagrams, elements, connectors and it's menus:
// dm/ - diagram manager
// dm/ms - menus
// dm/ms/ctx - context menu
// dm/ms/ds - diagram's menu
// dm/ds - diagram classes folder
// dm/ds/diagram.js - base class for diagram, element and connector
// dm/ds/<type>.js - <type> of diagram class,package etc...
// dm/es/ - element classes folder
// dm/es/<type>.js - <type> of element image, class, artifact etc...
// dm/cs/<type>.js - <type> of connector aggragation, composition etc ...

// TBD:
// dm/ms/vp - main diagram load menu
// dm/hs/tabbed.js - tabs based diagram handler
// dm/hs/plain.js - handler to insert diagrams into the docuemnt (not implemented)

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2011 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  umlsync.org/about

Version:
  2.0.0 (2012-07-12)
*/
//@aspect
//(function($, dm, undefined) {

//dm = dm || {};
//dm.base = dm.base || {};

dm.base.loader = function(url) {
  this.url = url;
};

//@export:dm.base.loader:plain
dm.base.loader.prototype = {
   _lazyLoad: function(path, callback, options) {
      LazyLoad.load(this.url + path, callback, options);
   },
   _addToLoadQueue: function(item) {
      if (!this._loadQueue) {
	    this.working = false;
	    this._loadQueue = new Array();
	  }
	  this._loadQueue.push(item);
	  this._process(false);
   },
   _process: function(isAjaxCallback) {
     var item = null;
	 if (this.working) {
	   return;
	 }

     if ((isAjaxCallback) || (this._loadQueue.length == 1)) {
	   this.working = true;
  	   item = this._loadQueue.shift();
	 }

	 if (item) {
	   var callback = item.callback,
		   data = item.data,
		   self = this;

       // Check that we still need to load data
	   // It is possible that previous item 
	   // loaded all necessary data yet.
	   if (item.precondition()) {
           $.ajax({
             url: this.url + item.url,
             dataType: "script",
             success: function(){
                        callback(data);
						self.working = false;
                        self._process(true);
                      },
			 error: function(){
			            // Do not call calback on failed
                        // callback(data);
						alert("Failed to load: " + item.url);
						self.working = false;
                        self._process(true);
                    }
            });
	   }
	   else {
		 callback(data);
		 this.working = false;
		 self._process(true); 
	   }
	 } else {
	    this.working = false;
	 }
   },
   //@proexp
   OnLoadComplete: function(callback2, options) {
	   this._addToLoadQueue({
		   url: "",
		   precondition: function() { return false;},
		   callback: function(opt) { if (callback2) callback2(opt);},
		   data: options
	   });
   },
   //@proexp
   Menu: function(type, specific, options) {
	  this._addToLoadQueue({
		url: "/dm/ms/" + type + "/" + specific +".js", 
		precondition: function() {
		                if ((dm['ms'][type] == undefined)
	                       || (dm['ms'][type][specific] == undefined)) {
                           return true;
			            }
			            return false;
					  },
		callback: function(opt) { 
		             return new dm['ms'][type][specific](opt);
		          },
		data: options
	  });
   },
   //@proexp
   CreateContextMenu: function(name, menuBuilder) {
	   this._addToLoadQueue({
	      url: "./dm/ms/ctx/" + name + ".js",
	      precondition: function(options) {
		                  if (dm['ms']['ctx'][name] == undefined) {
			                return true;
		                  }
			              return false;
		                },
		  callback: function(options) { 
		              return new dm['ms']['ctx'][name](options);
		            },
          data: menuBuilder
		});
   },
   //@proexp
   DiagramMenu: function(type, diagram, callback2) {
       var self2 = this;
	   this._addToLoadQueue({
	      url: "dm/ms/ds/common.js",
		  precondition: function() {
                            if ((dm['dm'] == undefined)
                              || (dm['ms']['ds'] == undefined)
	                          || (dm['ms']['ds']['common'] == undefined)) {
							  return true;
							}
							return false;
						},
          callback: function(data) {
		              var obj = new dm['ms']['ds']['common'](data, diagram, self2);
					  if (callback2 != undefined)
		                callback2(obj);
		            },
		  data:type
		});
   },
   //@proexp
   Diagram: function(dName, dType, options, parrent) {
   
     if ((dm['ds'] == undefined)
	   || (dm['ds']['diagram'] == undefined)) {
	   // it is secure because LazyLoad deal with queue
	   this._addToLoadQueue({
	     url: "./dm/ds/diagram.js",
		 precondition: function() {return true;},
		 callback:function(data) {},
		 data: null	   
	   });
	 }

     var self = this;
	 options.loader = this;
     var opt = {},
         option = options || {};
	     option['type'] = dName;
		 option['base_type'] = dType;
	     opt.options = options;
		 opt.diagram = dName;
		 opt.type = dType;
		 opt.parrent = parrent;

	    this._addToLoadQueue({
		  url:"./dm/ds/" + dType + ".js",
		  precondition: function() {
		       if ((dm['ds'] == undefined)
            	   || (dm['ds'][dType] == undefined)) {
				   return true;
			   }
               return false;
		  },
		  callback: function(data) {
		    var newdiagram = new dm['ds'][data.type](options, parrent);
			$.log("NAME: " + parrent);
			if (self.hs) {
			  self.hs.diagrams = self.hs.diagrams || {};
			  self.hs.diagrams[parrent] = newdiagram;
			}
			self.DiagramMenu(opt.diagram, newdiagram);
			self.selectedDiagram = newdiagram; // Fix for just added diagram
			return newdiagram;
		    },
          data: opt
		});

	 /*{
		    var newdiagram = new dm.ds[dType](options, jsonDesc, parrentId);
			self.DiagramMenu(dName, newdiagram);
			return newdiagram;
	 }*/
   },
   //@proexp
   LoadElement: function(type) {
   
     if (dm['es'] == undefined) {
       alert("You should create diagram instance first !!!");
	   return;
	 }

     if (dm.es[type] == undefined) {
	    this._lazyLoad("/dm/es/" + type + ".js");
	 }
   },
   //@proexp
   Element: function(type, options, diagram, callback2) {
   
     if (dm['es'] == undefined) {
       alert("You should create diagram instance first !!!");
	   return;
	 }

     var opt = {};
		  opt.options = options;
		  opt.type = type;
		  opt.diagram = diagram;

	 this._addToLoadQueue({
	   url: "/dm/es/" + type + ".js",
	   precondition: function() {
                       if (dm['es'][type] == undefined) {
					     return true;
					   }
					   return false;
	                 },
       callback: function(o) { 
				  var e2 = new dm['es'][o.type](o.options, o.diagram);
				  if (callback2)
				      callback2(e2);
		         },
	   data:opt
	   });
   },
   //@proexp
   Connector: function(type, options, diagram, callback2) {
   
     if (dm.cs == undefined) {
       alert("You should create diagram instance first !!!");
	   return;
	 }

     var opt = {};
		  opt.options = options;
		  opt.type = type;
		  opt.diagram = diagram;

     this._addToLoadQueue({
		  url: "./dm/cs/" + type + ".js",
		  precondition: function() {
		                  if (dm['cs'][type] == undefined) {
			                return true;
			              }
			              return false;
		                },
		  callback: function(o) {
          		      var e2 = new dm['cs'][o.type](o.options, o.diagram);
			    	  if (callback2 != undefined)
				        callback2(e2);
		            },
		  data: opt});
   }
};

dm['base']['loader'] = dm.base.loader;
dm['base']['loader'].prototype['Menu'] = dm.base.loader.prototype.Menu;
dm['base']['loader'].prototype['CreateContextMenu'] = dm.base.loader.prototype.CreateContextMenu;
dm['base']['loader'].prototype['DiagramMenu'] = dm.base.loader.prototype.DiagramMenu;
dm['base']['loader'].prototype['Diagram'] = dm.base.loader.prototype.Diagram;
dm['base']['loader'].prototype['Element'] = dm.base.loader.prototype.Element;
dm['base']['loader'].prototype['Connector'] = dm.base.loader.prototype.Connector;

dm['base']['loader'].prototype['OnLoadComplete'] = dm.base.loader.prototype.OnLoadComplete; // perform some action of load element equence load completion
dm['base']['loader'].prototype['LoadElement'] = dm.base.loader.prototype.LoadElement;// load element without creation

//@print

//@aspect
//})(jQuery, dm);

